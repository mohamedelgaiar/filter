import React, { useState } from 'react';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addDays, formatDisplayDate, getTodayString } from '../utils/dateUtils';

interface PostponeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  stageNumber: number;
  stageName: string;
  currentDueDate: string;
}

export const PostponeModal: React.FC<PostponeModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  stageNumber,
  stageName,
  currentDueDate,
}) => {
  const { postponeMaintenance, language, t } = useApp();
  const [days, setDays] = useState<number>(7);
  const [reason, setReason] = useState<string>('');

  if (!isOpen) return null;

  const today = getTodayString();
  const calculatedNewDate = addDays(today, Number(days) || 1);

  const handlePostpone = (e: React.FormEvent) => {
    e.preventDefault();
    if (days <= 0) return;
    postponeMaintenance(customerId, stageNumber, Number(days), reason);
    onClose();
  };

  const quickOptions = [3, 7, 10, 15, 30, 45];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                {t.postponeTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {customerName} • {stageName}
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

        {/* Content */}
        <form onSubmit={handlePostpone} className="p-6 space-y-5">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{t.postponeSubtitle}</span>
          </div>

          {/* Quick Select Days */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              {t.quickDays}
            </label>
            <div className="grid grid-cols-6 gap-2">
              {quickOptions.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setDays(opt)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition ${
                    days === opt
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                  }`}
                >
                  +{opt} {t.days}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.postponeDaysLabel}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="365"
                value={days}
                onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-base"
                required
              />
              <span className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-2.5 text-sm text-slate-400 pointer-events-none`}>
                {t.days}
              </span>
            </div>
          </div>

          {/* Date Preview Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{t.postponedTo}:</span>
            </div>
            <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              {formatDisplayDate(calculatedNewDate, language)} ({calculatedNewDate})
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.postponeReasonLabel}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: العميل مسافر / طلب الزيارة الأسبوع القادم' : 'e.g. Client requested visit next Monday'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
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
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold shadow-md shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              {t.confirmPostpone}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
