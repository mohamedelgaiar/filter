import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  MessageCircle,
  PhoneCall,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import {
  formatDisplayDate,
  getDaysDifferenceFromToday,
  getStatusBadgeInfo,
  getTodayString,
  parseDate,
} from '../utils/dateUtils';
import { PhoneNumber } from '../utils/phoneUtils';
import { CompleteMaintenanceModal } from './CompleteMaintenanceModal';
import { PostponeModal } from './PostponeModal';
import { DeleteMaintenanceModal } from './DeleteMaintenanceModal';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onEdit: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  onEdit,
}) => {
  const { currencySymbol, language, t, invoices, maintenanceTickets } = useApp();

  const [activeTab, setActiveTab] = useState<'stages' | 'history' | 'invoices'>('stages');
  
  // Modal states for actions
  const [completeTargetStages, setCompleteTargetStages] = useState<number[] | null>(null);
  const [postponeTargetStage, setPostponeTargetStage] = useState<{
    number: number;
    name: string;
    dueDate: string;
  } | null>(null);
  const [deleteTargetStage, setDeleteTargetStage] = useState<{
    number: number;
    name: string;
  } | null>(null);

  if (!isOpen) return null;

  const today = getTodayString();

  // WhatsApp reminder message
  const generateWhatsAppUrl = () => {
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const dueStages = customer.stages
      .filter((s) => getDaysDifferenceFromToday(s.postponedUntil || s.currentDueDate) <= 7)
      .map((s) => s.stageName)
      .join(', ');

    const msg =
      language === 'ar'
        ? `مرحباً ${customer.name}، نود تذكيركم بموعد صيانة فلتر المياه وتغيير (${dueStages || 'الشمعات المستحقة'}). متى يناسبكم موعد زيارة الفني؟`
        : `Hello ${customer.name}, AquaCare reminder: Your water filter maintenance for (${dueStages || 'due stages'}) is scheduled. When would be a good time for our technician visit?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Filter history tickets and invoices for this customer
  const customerTickets = maintenanceTickets.filter((t) => t.customerId === customer.id);
  const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-linear-to-r from-sky-500/10 via-teal-500/10 to-indigo-500/10 dark:from-sky-950/40 dark:to-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-sky-600/20">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {customer.name}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      {customer.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                    <span>{customer.filterModel}</span>
                    <span>•</span>
                    <span>{t.dateAdded}: {formatDisplayDate(customer.dateAdded, language)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${customer.phone}`}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                  title={t.btnCall}
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition shadow-xs"
                  title={t.btnWhatsApp}
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <button
                  onClick={() => onEdit(customer)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-50 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition"
                >
                  {t.btnEditCustomer}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Info bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">{t.phoneNumber}</span>
                <PhoneNumber
                  phone={customer.phone}
                  secondaryPhone={customer.secondaryPhone}
                  align="left"
                  primaryClassName="font-semibold text-slate-800 dark:text-slate-200 text-xs"
                  secondaryClassName="text-slate-500 text-[10px]"
                />
              </div>
              <div>
                <span className="text-slate-400 block">{t.address}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {customer.address || customer.cityOrArea || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.balance}</span>
                <span
                  className={`font-bold ${
                    customer.balance > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : customer.balance < 0
                      ? 'text-emerald-600'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {customer.balance} {currencySymbol}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">{language === 'ar' ? 'عدد المراحل' : 'Active Stages'}</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {customer.stages.length} {language === 'ar' ? 'شمعات' : 'stages'}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={() => setActiveTab('stages')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'stages'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'حالة مراحل الفلتر والعد التنازلي' : 'Filter Stages & Countdown'}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'سجل الصيانات المنفذة' : 'Maintenance History'} ({customerTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
                activeTab === 'invoices'
                  ? 'border-sky-600 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {language === 'ar' ? 'الفواتير والمدفوعات' : 'Invoices & Receipts'} ({customerInvoices.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'stages' && (
              <div className="space-y-3">
                {customer.stages.map((st) => {
                  const effectiveDueDate = st.postponedUntil || st.currentDueDate;
                  const diff = getDaysDifferenceFromToday(effectiveDueDate);
                  const isPost = !!st.postponedUntil;
                  const badge = getStatusBadgeInfo(effectiveDueDate, isPost, language);

                  // Calculate progress percentage of stage life
                  const lastServiced = parseDate(st.lastServicedDate || customer.dateAdded);
                  const due = parseDate(effectiveDueDate);
                  const todayDate = parseDate(today);
                  const totalSpan = Math.max(1, (due.getTime() - lastServiced.getTime()) / (1000 * 60 * 60 * 24));
                  const elapsed = Math.max(0, (todayDate.getTime() - lastServiced.getTime()) / (1000 * 60 * 60 * 24));
                  const percentUsed = Math.min(100, Math.round((elapsed / totalSpan) * 100));

                  return (
                    <div
                      key={st.stageNumber}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:shadow-xs transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800">
                            {st.stageNumber}
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                              {st.stageName}
                            </h4>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                              <span>
                                {t.lastServiced}: {formatDisplayDate(st.lastServicedDate, language)}
                              </span>
                              <span>•</span>
                              <span>
                                {t.intervalDays}: {st.intervalDays} {t.days}
                              </span>
                              {st.customPrice && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {st.customPrice} {currencySymbol}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar of life used */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                          <span>{language === 'ar' ? 'استهلاك عمر الشمعة:' : 'Filter Life Elapsed:'} {percentUsed}%</span>
                          <span>
                            {language === 'ar' ? 'الموعد المستحق:' : 'Due:'} <b>{effectiveDueDate}</b>
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percentUsed >= 100
                                ? 'bg-rose-500'
                                : percentUsed >= 85
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percentUsed}%` }}
                          />
                        </div>
                      </div>

                      {st.postponeReason && (
                        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                          {language === 'ar' ? 'سبب التأجيل:' : 'Postponed:'} {st.postponeReason}
                        </p>
                      )}

                      {/* Action buttons inside customer card */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setCompleteTargetStages([st.stageNumber])}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t.btnComplete}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPostponeTargetStage({
                              number: st.stageNumber,
                              name: st.stageName,
                              dueDate: effectiveDueDate,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5 transition"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {t.btnPostpone}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTargetStage({
                              number: st.stageNumber,
                              name: st.stageName,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title={t.btnDelete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {customerTickets.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">
                    {language === 'ar' ? 'لا توجد صيانات مسجلة سابقة لهذا العميل بعد.' : 'No maintenance records found for this client.'}
                  </p>
                ) : (
                  customerTickets.map((tk) => (
                    <div
                      key={tk.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            Stage {tk.stageNumber}: {tk.stageName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              tk.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tk.status === 'postponed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tk.status}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">
                          {tk.completedDate
                            ? `${language === 'ar' ? 'تاريخ الإتمام:' : 'Completed:'} ${formatDisplayDate(tk.completedDate, language)}`
                            : `${language === 'ar' ? 'التاريخ المجدول:' : 'Scheduled:'} ${tk.scheduledDueDate}`}
                          {tk.technicianName && ` • ${tk.technicianName}`}
                        </p>
                        {tk.completionNotes && (
                          <p className="text-slate-600 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
                            {tk.completionNotes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {tk.costCharged !== undefined && (
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {tk.costCharged} {currencySymbol}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 uppercase">
                          {tk.paymentStatus || 'paid'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="space-y-3">
                {customerInvoices.length === 0 ? (
                  <p className="text-center py-8 text-slate-400 text-sm">
                    {language === 'ar' ? 'لا توجد فواتير سابقة لهذا العميل.' : 'No invoices generated yet for this client.'}
                  </p>
                ) : (
                  customerInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-slate-400">
                            {formatDisplayDate(inv.date, language)}
                          </span>
                        </div>
                        <p className="text-slate-500 mt-1">
                          {inv.items.map((i) => i.description).join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">
                          {inv.total} {currencySymbol}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {language === 'ar' ? 'المسدد:' : 'Paid:'} {inv.amountPaid} {currencySymbol}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Modals for actions triggered from details */}
      {completeTargetStages && (
        <CompleteMaintenanceModal
          isOpen={true}
          onClose={() => setCompleteTargetStages(null)}
          customer={customer}
          stageNumbers={completeTargetStages}
        />
      )}

      {postponeTargetStage && (
        <PostponeModal
          isOpen={true}
          onClose={() => setPostponeTargetStage(null)}
          customerId={customer.id}
          customerName={customer.name}
          stageNumber={postponeTargetStage.number}
          stageName={postponeTargetStage.name}
          currentDueDate={postponeTargetStage.dueDate}
        />
      )}

      {deleteTargetStage && (
        <DeleteMaintenanceModal
          isOpen={true}
          onClose={() => setDeleteTargetStage(null)}
          customerId={customer.id}
          customerName={customer.name}
          stageNumber={deleteTargetStage.number}
          stageName={deleteTargetStage.name}
        />
      )}
    </>
  );
};
