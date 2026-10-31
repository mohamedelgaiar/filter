import React from 'react';
import { Printer, X, Droplets, CheckSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDisplayDate, getTodayString } from '../utils/dateUtils';
import { Customer } from '../types';
import { PhoneNumber } from '../utils/phoneUtils';

interface PrintRunSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: {
    customer: Customer;
    stages: {
      stageNumber: number;
      stageName: string;
      dueDate: string;
      price?: number;
    }[];
  }[];
}

export const PrintRunSheetModal: React.FC<PrintRunSheetModalProps> = ({
  isOpen,
  onClose,
  items,
}) => {
  const { currencySymbol, language, t } = useApp();
  if (!isOpen) return null;

  const today = getTodayString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-sky-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {language === 'ar' ? 'معاينة كشف عمل الفني والطباعة' : 'Technician Run Sheet Preview'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {language === 'ar' ? 'طباعة الكشف الآن (Print)' : 'Print Run Sheet'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="printable-run-sheet" className="p-8 overflow-y-auto flex-1 bg-white text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  {language === 'ar' ? 'FilterMaintenance - كشف خط سير صيانة فلاتر المياه' : 'FilterMaintenance - Daily Technician Maintenance Run Sheet'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? 'جدول مواعيد تغيير شمعات الفلاتر المستحقة اليوم'
                  : 'Scheduled Filter Cartridge Replacements & Service Work Orders'}
              </p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold text-slate-800">
                {language === 'ar' ? 'تاريخ التقرير:' : 'Date:'} {formatDisplayDate(today, language)}
              </p>
              <p className="text-slate-500">
                {language === 'ar' ? 'إجمالي الزيارات:' : 'Total Visits:'} {items.length}
              </p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="border border-slate-300 p-2 text-center w-8">#</th>
                <th className="border border-slate-300 p-2 text-start">{t.customerName}</th>
                <th className="border border-slate-300 p-2 text-center w-36">{t.phoneNumber}</th>
                <th className="border border-slate-300 p-2 text-start">{t.address}</th>
                <th className="border border-slate-300 p-2 text-start">{language === 'ar' ? 'الشمعات المطلوبة' : 'Stages Due'}</th>
                <th className="border border-slate-300 p-2 text-center w-20">{language === 'ar' ? 'المبلغ' : 'Amount'}</th>
                <th className="border border-slate-300 p-2 text-center w-24">{language === 'ar' ? 'توقيع العميل' : 'Signature'}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const totalEstimated = row.stages.reduce((sum, s) => sum + (s.price || 0), 0);
                return (
                  <tr key={row.customer.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-bold text-slate-900 text-start">
                      {row.customer.name}
                      <span className="block font-normal text-[10px] text-slate-500">
                        {row.customer.filterModel}
                      </span>
                    </td>
                    <td className="border border-slate-300 p-2 text-center whitespace-nowrap">
                      <PhoneNumber
                        phone={row.customer.phone}
                        secondaryPhone={row.customer.secondaryPhone}
                        align="center"
                        primaryClassName="font-bold text-slate-900 text-xs tracking-wider"
                        secondaryClassName="text-[10px] text-slate-600 font-medium mt-0.5 tracking-wider"
                      />
                    </td>
                    <td className="border border-slate-300 p-2">
                      {row.customer.address || row.customer.cityOrArea}
                      {row.customer.notes && (
                        <span className="block text-[10px] text-slate-500 italic">
                          ({row.customer.notes})
                        </span>
                      )}
                    </td>
                    <td className="border border-slate-300 p-2">
                      <div className="space-y-1">
                        {row.stages.map((st) => (
                          <div key={st.stageNumber} className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 border border-slate-400 rounded-xs inline-block" />
                            <span className="font-semibold text-slate-800">
                              {language === 'ar' ? `شمعة ${st.stageNumber}` : `Stage ${st.stageNumber}`}:
                            </span>
                            <span className="text-slate-600">{st.stageName}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">
                      {totalEstimated > 0 ? `${totalEstimated} ${currencySymbol}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-2 text-center">
                      <div className="h-8 border-b border-dashed border-slate-400" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-500">
            <div>
              <p>{language === 'ar' ? 'اسم الفني المستلم:' : 'Assigned Technician:'} ____________________</p>
            </div>
            <div>
              <p>{language === 'ar' ? 'توقيع المشرف:' : 'Supervisor Signature:'} ____________________</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
