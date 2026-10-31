import React, { useState, useEffect } from 'react';
import { CheckCircle2, RotateCcw, X, ShieldCheck, DollarSign, Calendar, User, Wrench } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, getTodayString } from '../utils/dateUtils';
import { Customer } from '../types';

interface CompleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  stageNumbers: number[];
}

export const CompleteMaintenanceModal: React.FC<CompleteMaintenanceModalProps> = ({
  isOpen,
  onClose,
  customer,
  stageNumbers,
}) => {
  const { completeMaintenance, currencySymbol, language, t } = useApp();
  const [completedDate, setCompletedDate] = useState<string>(getTodayString());
  const [costCharged, setCostCharged] = useState<number>(0);
  const [cartridgeCost, setCartridgeCost] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('paid');
  const [technicianName, setTechnicianName] = useState<string>('Eng. Mostafa (فني الصيانة)');
  const [completionNotes, setCompletionNotes] = useState<string>('');

  // Calculate default price and cost when modal opens or stageNumbers changes
  useEffect(() => {
    if (customer && stageNumbers.length > 0) {
      let totalCharge = 0;
      let totalCost = 0;
      stageNumbers.forEach((sNum) => {
        const stage = customer.stages.find((s) => s.stageNumber === sNum);
        totalCharge += stage?.customPrice || 20;
        totalCost += 8; // average cartridge cost
      });
      setCostCharged(totalCharge);
      setCartridgeCost(totalCost);
      setAmountPaid(totalCharge);
      setPaymentStatus('paid');
      setCompletedDate(getTodayString());
      setCompletionNotes(language === 'ar' ? 'تم استبدال الشمعات وفحص ضغط المياه وجودتها.' : 'Cartridges replaced. Water pressure & TDS tested.');
    }
  }, [customer, stageNumbers, language]);

  if (!isOpen) return null;

  const handlePaymentStatusChange = (status: 'paid' | 'partial' | 'unpaid') => {
    setPaymentStatus(status);
    if (status === 'paid') {
      setAmountPaid(costCharged);
    } else if (status === 'unpaid') {
      setAmountPaid(0);
    } else {
      setAmountPaid(Math.floor(costCharged / 2));
    }
  };

  const handleAmountPaidChange = (val: number) => {
    setAmountPaid(val);
    if (val >= costCharged && costCharged > 0) {
      setPaymentStatus('paid');
    } else if (val === 0) {
      setPaymentStatus('unpaid');
    } else {
      setPaymentStatus('partial');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeMaintenance(customer.id, stageNumbers, {
      completedDate,
      technicianName,
      costCharged: Number(costCharged) || 0,
      cartridgeCost: Number(cartridgeCost) || 0,
      paymentStatus,
      amountPaid: Number(amountPaid) || 0,
      completionNotes,
    });
    onClose();
  };

  const targetStages = customer.stages.filter((s) => stageNumbers.includes(s.stageNumber));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/70 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                {t.completeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {customer.name} • {customer.phone}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Automatic Reset Banner */}
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
            <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.completeSubtitle}</span>
          </div>

          {/* Stages being completed */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {language === 'ar' ? 'المراحل التي تم تغييرها الآن:' : 'Stages to be completed:'}
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {targetStages.map((st) => (
                <div
                  key={st.stageNumber}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                      {st.stageNumber}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {st.stageName}
                    </span>
                  </div>
                  <span className="text-slate-500">
                    {t.intervalDays}: {st.intervalDays} {t.days}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.servicedDateLabel}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                {t.technicianName}
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Technician name"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          {/* Financials & Accounting */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {language === 'ar' ? 'الحسابات وسند التحصيل' : 'Accounting & Payment Collection'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.stagePriceCharged} ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={costCharged}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setCostCharged(val);
                    if (paymentStatus === 'paid') setAmountPaid(val);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.cartridgeCostLabel} ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cartridgeCost}
                  onChange={(e) => setCartridgeCost(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Payment Status Buttons */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                {t.paymentStatus}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handlePaymentStatusChange('paid')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✓ {t.paymentPaid}
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentStatusChange('partial')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    paymentStatus === 'partial'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ◑ {t.paymentPartial}
                </button>
                <button
                  type="button"
                  onClick={() => handlePaymentStatusChange('unpaid')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    paymentStatus === 'unpaid'
                      ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ✕ {t.paymentUnpaid}
                </button>
              </div>
            </div>

            {/* Amount Paid & Balance Due */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {t.amountPaid} ({currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  max={costCharged}
                  step="any"
                  value={amountPaid}
                  onChange={(e) => handleAmountPaidChange(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'ar' ? 'المتبقي لمديونية العميل:' : 'Remaining Balance Added to Client:'}
                </label>
                <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold">
                  {Math.max(0, costCharged - amountPaid)} {currencySymbol}
                </div>
              </div>
            </div>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.completionNotes}
            </label>
            <textarea
              rows={2}
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="e.g. Changed Stage 1 & 2, TDS before 320 ppm, after 42 ppm, tank pressure 7 psi"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {t.confirmComplete}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
