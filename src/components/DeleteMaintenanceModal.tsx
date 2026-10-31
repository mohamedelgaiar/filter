import React, { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DeleteMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  stageNumber: number;
  stageName: string;
}

export const DeleteMaintenanceModal: React.FC<DeleteMaintenanceModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  stageNumber,
  stageName,
}) => {
  const { deleteMaintenance, language, t } = useApp();
  const [reason, setReason] = useState<string>('');

  if (!isOpen) return null;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    deleteMaintenance(customerId, stageNumber, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-rose-50/70 dark:bg-rose-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                {t.deleteTitle}
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
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{t.deleteConfirm}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t.deleteReasonLabel}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'مثال: قام العميل بتغيير الشمعة بنفسه أو ألغى الصيانة'
                  : 'e.g. Customer replaced cartridge themselves'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              autoFocus
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
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t.confirmDelete}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
