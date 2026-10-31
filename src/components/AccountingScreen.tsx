import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Printer,
  Search,
  Plus,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { formatDisplayDate, getTodayString, addDays } from '../utils/dateUtils';
import { exportInvoicesToExcel } from '../utils/excelExport';
import { PhoneNumber } from '../utils/phoneUtils';
import { InvoiceReceiptModal } from './InvoiceReceiptModal';

export const AccountingScreen: React.FC = () => {
  const { invoices, customers, addInvoice, currencySymbol, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);

  // Quick date presets
  const handlePresetToday = () => {
    const today = getTodayString();
    setStartDate(today);
    setEndDate(today);
  };

  const handlePresetThisMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    setStartDate(`${year}-${month}-01`);
    setEndDate(`${year}-${month}-${String(lastDay).padStart(2, '0')}`);
  };

  const handlePresetLast30Days = () => {
    const today = getTodayString();
    setStartDate(addDays(today, -30));
    setEndDate(today);
  };

  const handleClearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // New Invoice Modal state
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [itemDescription, setItemDescription] = useState('7-Stage Filter Cartridge Full Set Replacement');
  const [totalAmount, setTotalAmount] = useState(60);
  const [amountPaid, setAmountPaid] = useState(60);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Card' | 'Vodafone Cash / Wallet' | 'Other'>('Cash');
  const [notes, setNotes] = useState('');

  // Calculate totals (all-time)
  const totalRevenue = useMemo(() => invoices.reduce((sum, inv) => sum + inv.total, 0), [invoices]);
  const totalPaid = useMemo(() => invoices.reduce((sum, inv) => sum + inv.amountPaid, 0), [invoices]);
  const totalReceivables = useMemo(
    () => invoices.reduce((sum, inv) => sum + inv.balanceDue, 0),
    [invoices]
  );
  // Estimated cartridge cost is ~40% of revenue
  const estimatedCost = totalRevenue * 0.38;
  const estimatedProfit = totalRevenue - estimatedCost;
  const profitMargin = totalRevenue > 0 ? Math.round((estimatedProfit / totalRevenue) * 100) : 0;

  // Filter invoices by status, date range, and search query
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter === 'paid' && inv.balanceDue > 0) return false;
      if (statusFilter === 'unpaid' && inv.amountPaid > 0) return false;
      if (statusFilter === 'partial' && (inv.amountPaid === 0 || inv.balanceDue === 0)) return false;

      // Date Range Filter (from date to date)
      if (startDate && inv.date < startDate) return false;
      if (endDate && inv.date > endDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = inv.customerName.toLowerCase().includes(q);
        const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchPhone = (inv.customerPhone || '').toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchPhone) return false;
      }

      return true;
    });
  }, [invoices, statusFilter, startDate, endDate, searchQuery]);

  // Filtered totals for the selected period / criteria (shown in table footer)
  const filteredTotals = useMemo(() => {
    const total = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paid = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const due = filteredInvoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
    return {
      total,
      paid,
      due,
      count: filteredInvoices.length,
    };
  }, [filteredInvoices]);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomerId);
    if (!cust) return;

    const charged = Number(totalAmount) || 0;
    const paid = Number(amountPaid) || 0;
    const balance = Math.max(0, charged - paid);

    addInvoice({
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(5, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      date: getTodayString(),
      items: [
        {
          description: itemDescription,
          quantity: 1,
          unitPrice: charged,
          total: charged,
        },
      ],
      subtotal: charged,
      discount: 0,
      total: charged,
      amountPaid: paid,
      balanceDue: balance,
      paymentMethod,
      notes,
    });

    setIsNewInvoiceOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Billed Revenue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">{t.totalRevenue}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {totalRevenue.toLocaleString()} {currencySymbol}
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">
            {language === 'ar' ? 'المحصل نقداً:' : 'Collected:'} {totalPaid.toLocaleString()} {currencySymbol}
          </span>
        </div>

        {/* Customer Dues (Receivables) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">{t.uncollectedDues}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {totalReceivables.toLocaleString()} {currencySymbol}
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">
            {language === 'ar' ? 'مستحقات آجلة لدى العملاء' : 'Accounts Receivable'}
          </span>
        </div>

        {/* Wholesale Cartridge Costs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">{t.totalCosts}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {Math.round(estimatedCost).toLocaleString()} {currencySymbol}
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">
            {language === 'ar' ? 'تكاليف قطع الغيار والشمعات' : 'Wholesale parts cost'}
          </span>
        </div>

        {/* Gross Profit */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">{t.grossProfit}</span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {Math.round(estimatedProfit).toLocaleString()} {currencySymbol}
          </p>
          <span className="text-xs text-sky-600 font-semibold mt-1 inline-block">
            {language === 'ar' ? 'هامش ربح إجمالي:' : 'Margin:'} {profitMargin}%
          </span>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Row 1: Search, Status Filters, Export Excel & Create Button */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-3`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'ابحث برقم الفاتورة، اسم العميل، أو الهاتف...'
                  : 'Search invoices by number, client name, or phone...'
              }
              className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
                language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-2.5 text-xs text-slate-400 hover:text-slate-600`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filters & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold cursor-pointer"
            >
              <option value="all">{language === 'ar' ? 'جميع الفواتير' : 'All Invoices'}</option>
              <option value="paid">{language === 'ar' ? 'مدفوعة بالكامل' : 'Paid'}</option>
              <option value="partial">{language === 'ar' ? 'مدفوعة جزئياً' : 'Partial'}</option>
              <option value="unpaid">{language === 'ar' ? 'غير مسددة (آجلة)' : 'Unpaid'}</option>
            </select>

            <button
              type="button"
              onClick={() => exportInvoicesToExcel(filteredInvoices)}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title={t.exportExcel}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>{t.exportExcel}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsNewInvoiceOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.createInvoice}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Date Range Filter (From Date to To Date) & Quick Presets */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>{t.filterByDate}:</span>
            </div>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">{t.fromDate}:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">{t.toDate}:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Clear Dates Button */}
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition flex items-center gap-1 font-semibold cursor-pointer"
                title={t.clearDates}
              >
                <span>✕</span>
                <span>{t.clearDates}</span>
              </button>
            )}
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-medium hidden sm:inline">
              {language === 'ar' ? 'فترات سريعة:' : 'Quick ranges:'}
            </span>
            <button
              type="button"
              onClick={handlePresetToday}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                startDate === getTodayString() && endDate === getTodayString()
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.presetToday}
            </button>
            <button
              type="button"
              onClick={handlePresetThisMonth}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t.presetThisMonth}
            </button>
            <button
              type="button"
              onClick={handlePresetLast30Days}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              {t.presetLast30Days}
            </button>
            <button
              type="button"
              onClick={handleClearDates}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                !startDate && !endDate
                  ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.presetAllDates}
            </button>
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">{t.invoiceNumber}</th>
                <th className="p-3.5">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                <th className="p-3.5">{t.customerName}</th>
                <th className="p-3.5">{language === 'ar' ? 'البيان' : 'Items'}</th>
                <th className="p-3.5 text-right">{t.amount}</th>
                <th className="p-3.5 text-right">{t.paid}</th>
                <th className="p-3.5 text-right">{t.due}</th>
                <th className="p-3.5 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                <th className="p-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    {language === 'ar' ? 'لا توجد فواتير تطابق التصفية المحددة.' : 'No invoices found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-bold font-mono text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {formatDisplayDate(inv.date, language)}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      {inv.customerName}
                      <div className="mt-0.5">
                        <PhoneNumber
                          phone={inv.customerPhone}
                          align="left"
                          primaryClassName="text-[11px] font-mono text-slate-400"
                        />
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {inv.items.map((i) => i.description).join(' + ')}
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {inv.total} {currencySymbol}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {inv.amountPaid} {currencySymbol}
                    </td>
                    <td className="p-3.5 text-right font-bold text-rose-600 whitespace-nowrap">
                      {inv.balanceDue > 0 ? `${inv.balanceDue} ${currencySymbol}` : '-'}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.balanceDue === 0
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : inv.amountPaid === 0
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {inv.balanceDue === 0
                          ? t.paymentPaid
                          : inv.amountPaid === 0
                          ? t.paymentUnpaid
                          : t.paymentPartial}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoiceForPrint(inv)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[11px] inline-flex items-center gap-1 transition cursor-pointer"
                        title={t.printInvoice}
                      >
                        <Printer className="w-3.5 h-3.5 text-sky-600" />
                        <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer with Total Amounts */}
            <tfoot className="bg-slate-100/90 dark:bg-slate-800/90 border-t-2 border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
              <tr>
                <td colSpan={4} className="p-4 text-start font-black text-xs sm:text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>{t.tableTotal}</span>
                    <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                      ({filteredTotals.count} {language === 'ar' ? 'فاتورة' : 'invoices'})
                      {(startDate || endDate) && (
                        <span className="mr-1 ml-1 text-sky-600 dark:text-sky-400 font-semibold font-mono">
                          [{startDate || '...'} → {endDate || '...'}]
                        </span>
                      )}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-right font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal uppercase">
                    {language === 'ar' ? 'إجمالي المطلوب' : 'Total'}
                  </span>
                  {filteredTotals.total.toLocaleString()} {currencySymbol}
                </td>
                <td className="p-4 text-right font-black text-sm text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal uppercase">
                    {language === 'ar' ? 'إجمالي المحصل' : 'Collected'}
                  </span>
                  {filteredTotals.paid.toLocaleString()} {currencySymbol}
                </td>
                <td className="p-4 text-right font-black text-sm text-rose-600 dark:text-rose-400 whitespace-nowrap">
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal uppercase">
                    {language === 'ar' ? 'إجمالي الآجل' : 'Due'}
                  </span>
                  {filteredTotals.due.toLocaleString()} {currencySymbol}
                </td>
                <td colSpan={2} className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {filteredTotals.due === 0 && filteredTotals.total > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'تم تحصيل الكل' : 'Fully Settled'}
                    </span>
                  ) : (
                    <span>
                      {language === 'ar' ? 'نسبة التحصيل: ' : 'Collection: '}
                      <b className="text-slate-800 dark:text-slate-200">
                        {filteredTotals.total > 0
                          ? Math.round((filteredTotals.paid / filteredTotals.total) * 100)
                          : 100}
                        %
                      </b>
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Print Invoice Modal */}
      {selectedInvoiceForPrint && (
        <InvoiceReceiptModal
          isOpen={true}
          onClose={() => setSelectedInvoiceForPrint(null)}
          invoice={selectedInvoiceForPrint}
        />
      )}

      {/* Manual Invoice Creation Modal */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/20 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t.createInvoice}
              </h3>
              <button
                onClick={() => setIsNewInvoiceOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.customerName}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ar' ? 'بيان الخدمة أو الشمعات المباعة:' : 'Service / Item Description:'}
                </label>
                <input
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={totalAmount}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setTotalAmount(val);
                      setAmountPaid(val);
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'المسدد نقداً:' : 'Paid Now:'} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    step="any"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  {language === 'ar' ? 'إصدار الفاتورة' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
