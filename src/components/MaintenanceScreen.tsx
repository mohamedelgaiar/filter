import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  RotateCcw,
  Printer,
  FileSpreadsheet,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  AlertCircle,
  ChevronDown,
  Layers,
  Sparkles,
  User,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerStageConfig, MaintenanceStatus, MaintenanceTicket } from '../types';
import {
  formatDisplayDate,
  getDaysDifferenceFromToday,
  getStatusBadgeInfo,
  getTodayString,
  isDueToday,
  isOverdue,
} from '../utils/dateUtils';
import { exportCompletedMaintenanceToExcel, exportMaintenanceToExcel } from '../utils/excelExport';
import { CompleteMaintenanceModal } from './CompleteMaintenanceModal';
import { PostponeModal } from './PostponeModal';
import { DeleteMaintenanceModal } from './DeleteMaintenanceModal';
import { PrintRunSheetModal } from './PrintRunSheetModal';
import { CustomerDetailModal } from './CustomerDetailModal';
import { CustomerModal } from './CustomerModal';
import { PhoneNumber } from '../utils/phoneUtils';

export const MaintenanceScreen: React.FC = () => {
  const {
    customers,
    maintenanceTickets,
    stageDefinitions,
    restoreMaintenance,
    currencySymbol,
    language,
    t,
  } = useApp();

  // Active status tab: 'due' | 'all' | 'completed' | 'postponed' | 'deleted'
  const [activeTab, setActiveTab] = useState<'due' | 'all' | 'completed' | 'postponed' | 'deleted'>('due');

  // Search query (name, phone, stage)
  const [searchQuery, setSearchQuery] = useState('');
  // Filter by specific stage number (all or 1..7)
  const [selectedStageFilter, setSelectedStageFilter] = useState<number | 'all'>('all');
  // Group by customer toggle
  const [groupByCustomer, setGroupByCustomer] = useState(true);

  // Selected customer for detail/edit modal
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  // Action Modals State
  const [completeModalData, setCompleteModalData] = useState<{
    customer: Customer;
    stageNumbers: number[];
  } | null>(null);

  const [postponeModalData, setPostponeModalData] = useState<{
    customerId: string;
    customerName: string;
    stageNumber: number;
    stageName: string;
    currentDueDate: string;
  } | null>(null);

  const [deleteModalData, setDeleteModalData] = useState<{
    customerId: string;
    customerName: string;
    stageNumber: number;
    stageName: string;
  } | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const today = getTodayString();

  // --- 1. Compute Active / Scheduled Stages for All Customers ---
  const allActiveStages = useMemo(() => {
    const list: {
      customer: Customer;
      stage: CustomerStageConfig;
      effectiveDueDate: string;
      diffDays: number;
      isDue: boolean;
      isPostponed: boolean;
    }[] = [];

    customers.forEach((cust) => {
      cust.stages.forEach((st) => {
        const effectiveDueDate = st.postponedUntil || st.currentDueDate;
        const diff = getDaysDifferenceFromToday(effectiveDueDate);
        // Stage is considered "due" if days have passed (diff <= 0) or due within current week (diff <= 3)
        const isDue = diff <= 3;
        const isPostponed = !!st.postponedUntil;

        list.push({
          customer: cust,
          stage: st,
          effectiveDueDate,
          diffDays: diff,
          isDue,
          isPostponed,
        });
      });
    });

    return list;
  }, [customers]);

  // --- 2. Filter Active Stages by Search Query and Stage Filter ---
  const filteredActiveStages = useMemo(() => {
    return allActiveStages.filter((item) => {
      // Status filter
      if (activeTab === 'due' && !item.isDue) return false;
      if (activeTab === 'postponed' && !item.isPostponed) return false;

      // Stage filter
      if (selectedStageFilter !== 'all' && item.stage.stageNumber !== selectedStageFilter) {
        return false;
      }

      // Search query (Customer Name, Phone, Stage Name or Stage Number)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = item.customer.name.toLowerCase().includes(q);
        const phoneMatch = item.customer.phone.toLowerCase().includes(q);
        const addressMatch = (item.customer.address || '').toLowerCase().includes(q);
        const stageMatch =
          item.stage.stageName.toLowerCase().includes(q) ||
          item.stage.stageNumber.toString() === q ||
          `stage ${item.stage.stageNumber}`.toLowerCase().includes(q) ||
          `مرحلة ${item.stage.stageNumber}`.includes(q) ||
          `شمعة ${item.stage.stageNumber}`.includes(q);

        if (!nameMatch && !phoneMatch && !addressMatch && !stageMatch) {
          return false;
        }
      }

      return true;
    });
  }, [allActiveStages, activeTab, selectedStageFilter, searchQuery]);

  // --- 3. Group Stages by Customer (for Due on the same day / grouped view) ---
  const groupedCustomerCards = useMemo(() => {
    const map = new Map<string, { customer: Customer; stages: CustomerStageConfig[] }>();

    filteredActiveStages.forEach((item) => {
      if (!map.has(item.customer.id)) {
        map.set(item.customer.id, {
          customer: item.customer,
          stages: [],
        });
      }
      map.get(item.customer.id)!.stages.push(item.stage);
    });

    // Sort: customers with overdue stages first, then due today, then upcoming
    const groups = Array.from(map.values());
    groups.sort((a, b) => {
      const minDueA = Math.min(
        ...a.stages.map((s) => getDaysDifferenceFromToday(s.postponedUntil || s.currentDueDate))
      );
      const minDueB = Math.min(
        ...b.stages.map((s) => getDaysDifferenceFromToday(s.postponedUntil || s.currentDueDate))
      );
      return minDueA - minDueB;
    });

    return groups;
  }, [filteredActiveStages]);

  // --- 4. Filter Tickets for Completed / Postponed / Deleted views ---
  const filteredTickets = useMemo(() => {
    return maintenanceTickets.filter((tk) => {
      if (activeTab === 'completed' && tk.status !== 'completed') return false;
      if (activeTab === 'postponed' && tk.status !== 'postponed') return false;
      if (activeTab === 'deleted' && tk.status !== 'deleted') return false;

      // Stage filter
      if (selectedStageFilter !== 'all' && tk.stageNumber !== selectedStageFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = tk.customerName.toLowerCase().includes(q);
        const phoneMatch = tk.customerPhone.toLowerCase().includes(q);
        const stageMatch =
          tk.stageName.toLowerCase().includes(q) ||
          tk.stageNumber.toString() === q ||
          `stage ${tk.stageNumber}`.toLowerCase().includes(q) ||
          `مرحلة ${tk.stageNumber}`.includes(q);

        if (!nameMatch && !phoneMatch && !stageMatch) {
          return false;
        }
      }

      return true;
    });
  }, [maintenanceTickets, activeTab, selectedStageFilter, searchQuery]);

  // --- Stats for Badges ---
  const dueCount = useMemo(() => allActiveStages.filter((i) => i.isDue).length, [allActiveStages]);
  const postponedCount = useMemo(
    () => maintenanceTickets.filter((t) => t.status === 'postponed').length,
    [maintenanceTickets]
  );
  const completedCount = useMemo(
    () => maintenanceTickets.filter((t) => t.status === 'completed').length,
    [maintenanceTickets]
  );
  const deletedCount = useMemo(
    () => maintenanceTickets.filter((t) => t.status === 'deleted').length,
    [maintenanceTickets]
  );

  // --- Export to Excel Handler ---
  const handleExportExcel = () => {
    if (activeTab === 'completed') {
      exportCompletedMaintenanceToExcel(filteredTickets, 'completed_water_filter_maintenance');
    } else {
      const itemsToExport = filteredActiveStages.map((item) => ({
        customer: item.customer,
        stageNumber: item.stage.stageNumber,
        stageName: item.stage.stageName,
        dueDate: item.stage.currentDueDate,
        status: item.stage.postponedUntil ? 'postponed' : item.isDue ? 'due' : 'scheduled',
        intervalDays: item.stage.intervalDays,
        postponedUntil: item.stage.postponedUntil,
        postponeReason: item.stage.postponeReason,
        customPrice: item.stage.customPrice,
      }));
      exportMaintenanceToExcel(itemsToExport, `water_filter_maintenance_${activeTab}`);
    }
  };

  // WhatsApp quick url
  const getWhatsAppLink = (cust: Customer, stages: CustomerStageConfig[]) => {
    const cleanPhone = cust.phone.replace(/[^0-9]/g, '');
    const stageNames = stages.map((s) => s.stageName).join(' + ');
    const msg =
      language === 'ar'
        ? `السلام عليكم أستاذ ${cust.name}، نود تذكيركم بموعد صيانة فلتر المياه (${stageNames}). متى يناسبكم زيارة الفني لتغيير الشمعات؟`
        : `Hello ${cust.name}, AquaCare reminder: Your water filter maintenance for (${stageNames}) is due. When is a good time for our technician visit?`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 print:hidden">
        {/* Search & Main Filter Controls Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Row 1: Search box and action buttons */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-3`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-2.5 text-xs text-slate-400 hover:text-slate-600`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action buttons: Export Excel & Print Schedule */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
              title="Download Microsoft Excel .xlsx file"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.exportExcel}</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printSchedule}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
            <button
              onClick={() => setActiveTab('due')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'due'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.tabDue}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold">
                {dueCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>{t.tabAll}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {allActiveStages.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.tabCompleted}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {completedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('postponed')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'postponed'
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.tabPostponed}</span>
              {postponedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                  {postponedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'deleted'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{t.tabDeleted}</span>
              {deletedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                  {deletedCount}
                </span>
              )}
            </button>
          </div>

          {/* Stage Dropdown Filter & Grouping Toggle */}
          <div className="flex items-center gap-3">
            {/* Filter by stage dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              <select
                value={selectedStageFilter}
                onChange={(e) =>
                  setSelectedStageFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium cursor-pointer"
              >
                <option value="all">{t.allStages}</option>
                {stageDefinitions.map((s) => (
                  <option key={s.stageNumber} value={s.stageNumber}>
                    {t.stagePrefix} {s.stageNumber}: {language === 'ar' ? s.nameAr : s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggle Grouping */}
            {(activeTab === 'due' || activeTab === 'all') && (
              <button
                type="button"
                onClick={() => setGroupByCustomer(!groupByCustomer)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition cursor-pointer ${
                  groupByCustomer
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
                title="When stages are due together for the same client, display bundled together"
              >
                {groupByCustomer ? `✓ ${t.groupByCustomer}` : t.flatView}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA --- */}

      {/* VIEW 1 & 2: Due / All Maintenance (Grouped View - Meeting user requirement) */}
      {(activeTab === 'due' || activeTab === 'all') && groupByCustomer && (
        <div className="space-y-4">
          {groupedCustomerCards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                {language === 'ar' ? 'ممتاز! لا توجد صيانات متأخرة أو مستحقة حالياً' : 'All Caught Up! No pending maintenance'}
              </h3>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                {t.noMaintenanceFound}
              </p>
            </div>
          ) : (
            groupedCustomerCards.map(({ customer, stages }) => {
              const allStageNumbers = stages.map((s) => s.stageNumber);
              const hasMultipleDueTogether = stages.length > 1;
              const cleanPhone = customer.phone.replace(/[^0-9]/g, '');

              return (
                <div
                  key={customer.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-700/60 transition overflow-hidden"
                >
                  {/* Card Header with Customer details */}
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-sky-600 text-white font-bold flex items-center justify-center text-lg shadow-xs shrink-0">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedCustomerForDetail(customer)}
                            className="font-bold text-slate-900 dark:text-white text-base hover:text-sky-600 transition text-left cursor-pointer"
                          >
                            {customer.name}
                          </button>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                            {customer.id}
                          </span>
                          {hasMultipleDueTogether && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {stages.length} {t.stagesDueTogether}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <PhoneNumber
                            phone={customer.phone}
                            secondaryPhone={customer.secondaryPhone}
                            align="left"
                            primaryClassName="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold"
                            secondaryClassName="font-mono text-slate-500 text-[10px]"
                          />
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {customer.address || customer.cityOrArea || '-'}
                          </span>
                          <span>•</span>
                          <span>{customer.filterModel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Contacts & Batch Action */}
                    <div className="flex items-center gap-2 self-end md:self-center">
                      <a
                        href={`tel:${customer.phone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                        title={t.btnCall}
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={getWhatsAppLink(customer, stages)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-xs"
                        title={t.btnWhatsApp}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      {/* Batch Complete All stages due together button */}
                      {hasMultipleDueTogether && (
                        <button
                          type="button"
                          onClick={() =>
                            setCompleteModalData({
                              customer,
                              stageNumbers: allStageNumbers,
                            })
                          }
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t.btnBatchComplete} ({stages.length})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Notes banner if present */}
                  {customer.notes && (
                    <div className="px-5 py-2 bg-amber-50/50 dark:bg-amber-950/10 border-b border-amber-100/60 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="italic">{customer.notes}</span>
                    </div>
                  )}

                  {/* Stages List inside Customer Card */}
                  <div className="p-5 space-y-3">
                    {stages.map((stage) => {
                      const effectiveDueDate = stage.postponedUntil || stage.currentDueDate;
                      const isPost = !!stage.postponedUntil;
                      const badge = getStatusBadgeInfo(effectiveDueDate, isPost, language);

                      return (
                        <div
                          key={stage.stageNumber}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                        >
                          {/* Stage details */}
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs shrink-0">
                              {stage.stageNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                                  {stage.stageName}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.color}`}
                                >
                                  {badge.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                                <span>
                                  {t.dueDate}: <b className="text-slate-700 dark:text-slate-300">{effectiveDueDate}</b>
                                </span>
                                <span>•</span>
                                <span>
                                  {t.lastServiced}: {stage.lastServicedDate || customer.dateAdded}
                                </span>
                                <span>•</span>
                                <span>
                                  {t.intervalDays}: {stage.intervalDays} {t.days}
                                </span>
                                {stage.customPrice && (
                                  <>
                                    <span>•</span>
                                    <span className="font-semibold text-emerald-600">
                                      {stage.customPrice} {currencySymbol}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons for this specific stage */}
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Complete Maintenance Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setCompleteModalData({
                                  customer,
                                  stageNumbers: [stage.stageNumber],
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                              title={t.btnComplete}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{t.btnComplete}</span>
                            </button>

                            {/* Postpone Maintenance Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setPostponeModalData({
                                  customerId: customer.id,
                                  customerName: customer.name,
                                  stageNumber: stage.stageNumber,
                                  stageName: stage.stageName,
                                  currentDueDate: effectiveDueDate,
                                })
                              }
                              className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                              title={t.btnPostpone}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t.btnPostpone}</span>
                            </button>

                            {/* Delete Maintenance Button */}
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModalData({
                                  customerId: customer.id,
                                  customerName: customer.name,
                                  stageNumber: stage.stageNumber,
                                  stageName: stage.stageName,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                              title={t.btnDelete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 1 & 2 (Flat List Mode if user toggled flat view) */}
      {(activeTab === 'due' || activeTab === 'all') && !groupByCustomer && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5">{t.customerName}</th>
                  <th className="p-3.5">{t.phoneNumber}</th>
                  <th className="p-3.5">{language === 'ar' ? 'المرحلة' : 'Stage'}</th>
                  <th className="p-3.5">{t.dueDate}</th>
                  <th className="p-3.5">{t.status}</th>
                  <th className="p-3.5 text-right">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredActiveStages.map((item) => {
                  const badge = getStatusBadgeInfo(item.effectiveDueDate, item.isPostponed, language);
                  return (
                    <tr key={`${item.customer.id}-${item.stage.stageNumber}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5">
                        <button
                          onClick={() => setSelectedCustomerForDetail(item.customer)}
                          className="font-bold text-slate-900 dark:text-white hover:text-sky-600 cursor-pointer"
                        >
                          {item.customer.name}
                        </button>
                        <span className="block text-[11px] text-slate-400">
                          {item.customer.address || item.customer.cityOrArea}
                        </span>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <PhoneNumber
                          phone={item.customer.phone}
                          secondaryPhone={item.customer.secondaryPhone}
                          align="left"
                          primaryClassName="font-mono text-slate-700 dark:text-slate-300 text-xs font-semibold"
                          secondaryClassName="font-mono text-slate-500 text-[10px]"
                        />
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Stage {item.stage.stageNumber}: {item.stage.stageName}
                        </span>
                        <span className="block text-[11px] text-slate-400">
                          {t.intervalDays}: {item.stage.intervalDays} {t.days}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">
                        {item.effectiveDueDate}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              setCompleteModalData({
                                customer: item.customer,
                                stageNumbers: [item.stage.stageNumber],
                              })
                            }
                            className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 cursor-pointer"
                          >
                            {t.btnComplete}
                          </button>
                          <button
                            onClick={() =>
                              setPostponeModalData({
                                customerId: item.customer.id,
                                customerName: item.customer.name,
                                stageNumber: item.stage.stageNumber,
                                stageName: item.stage.stageName,
                                currentDueDate: item.effectiveDueDate,
                              })
                            }
                            className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer"
                          >
                            {t.btnPostpone}
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModalData({
                                customerId: item.customer.id,
                                customerName: item.customer.name,
                                stageNumber: item.stage.stageNumber,
                                stageName: item.stage.stageName,
                              })
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Completed Maintenance Log */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {language === 'ar' ? 'لا توجد صيانات مكتملة مسجلة بعد.' : 'No completed maintenance records found.'}
              </p>
            </div>
          ) : (
            filteredTickets.map((tk) => (
              <div
                key={tk.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {tk.customerName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Stage {tk.stageNumber}: {tk.stageName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ar' ? 'تاريخ الإتمام:' : 'Completed on:'} <b>{formatDisplayDate(tk.completedDate || '', language)}</b>
                      {tk.technicianName && ` • ${tk.technicianName}`}
                    </p>
                    {tk.completionNotes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        {tk.completionNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {tk.costCharged || 0} {currencySymbol}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-emerald-600 block">
                      {tk.paymentStatus || 'paid'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 4: Postponed Maintenance */}
      {activeTab === 'postponed' && (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {language === 'ar' ? 'لا توجد صيانات مؤجلة حالياً.' : 'No postponed maintenance records.'}
              </p>
            </div>
          ) : (
            filteredTickets.map((tk) => {
              const customer = customers.find((c) => c.id === tk.customerId);
              return (
                <div
                  key={tk.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {tk.customerName}
                        </h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                          Stage {tk.stageNumber}: {tk.stageName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'ar' ? 'مؤجل حتى:' : 'Postponed until:'}{' '}
                        <b className="text-amber-700 dark:text-amber-400">
                          {formatDisplayDate(tk.postponedUntil || '', language)} ({tk.postponedUntil})
                        </b>
                      </p>
                      {tk.postponeReason && (
                        <p className="text-xs text-amber-800 dark:text-amber-300 mt-1 italic">
                          "{tk.postponeReason}"
                        </p>
                      )}
                    </div>
                  </div>

                  {customer && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          setCompleteModalData({
                            customer,
                            stageNumbers: [tk.stageNumber],
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t.btnComplete}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPostponeModalData({
                            customerId: customer.id,
                            customerName: customer.name,
                            stageNumber: tk.stageNumber,
                            stageName: tk.stageName,
                            currentDueDate: tk.postponedUntil || today,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-200 cursor-pointer"
                      >
                        {language === 'ar' ? 'تأجيل إضافي' : 'Postpone More'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 5: Deleted Maintenance (with restore button) */}
      {activeTab === 'deleted' && (
        <div className="space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
              <Trash2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">
                {language === 'ar' ? 'سلة المحذوفات فارغة. لا توجد صيانات محذوفة.' : 'No deleted maintenance records.'}
              </p>
            </div>
          ) : (
            filteredTickets.map((tk) => (
              <div
                key={tk.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {tk.customerName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-semibold">
                        Stage {tk.stageNumber}: {tk.stageName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ar' ? 'تاريخ الحذف:' : 'Deleted on:'} {formatDisplayDate(tk.deletedAt || '', language)}
                    </p>
                    {tk.deletionReason && (
                      <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 italic">
                        {language === 'ar' ? 'السبب:' : 'Reason:'} {tk.deletionReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => restoreMaintenance(tk.id)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.btnRestore}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>

      {/* --- MODALS --- */}

      {/* Complete Modal */}
      {completeModalData && (
        <CompleteMaintenanceModal
          isOpen={true}
          onClose={() => setCompleteModalData(null)}
          customer={completeModalData.customer}
          stageNumbers={completeModalData.stageNumbers}
        />
      )}

      {/* Postpone Modal */}
      {postponeModalData && (
        <PostponeModal
          isOpen={true}
          onClose={() => setPostponeModalData(null)}
          customerId={postponeModalData.customerId}
          customerName={postponeModalData.customerName}
          stageNumber={postponeModalData.stageNumber}
          stageName={postponeModalData.stageName}
          currentDueDate={postponeModalData.currentDueDate}
        />
      )}

      {/* Delete Modal */}
      {deleteModalData && (
        <DeleteMaintenanceModal
          isOpen={true}
          onClose={() => setDeleteModalData(null)}
          customerId={deleteModalData.customerId}
          customerName={deleteModalData.customerName}
          stageNumber={deleteModalData.stageNumber}
          stageName={deleteModalData.stageName}
        />
      )}

      {/* Print Run Sheet Modal */}
      <PrintRunSheetModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={groupedCustomerCards.map((g) => ({
          customer: g.customer,
          stages: g.stages.map((s) => ({
            stageNumber: s.stageNumber,
            stageName: s.stageName,
            dueDate: s.postponedUntil || s.currentDueDate,
            price: s.customPrice,
          })),
        }))}
      />

      {/* Customer Detail Profile Modal */}
      {selectedCustomerForDetail && (
        <CustomerDetailModal
          isOpen={true}
          onClose={() => setSelectedCustomerForDetail(null)}
          customer={selectedCustomerForDetail}
          onEdit={(c) => {
            setSelectedCustomerForDetail(null);
            setCustomerToEdit(c);
          }}
        />
      )}

      {/* Edit Customer Modal */}
      {customerToEdit && (
        <CustomerModal
          isOpen={true}
          onClose={() => setCustomerToEdit(null)}
          customerToEdit={customerToEdit}
        />
      )}
    </div>
  );
};
