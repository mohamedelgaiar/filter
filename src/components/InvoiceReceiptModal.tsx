import React from 'react';
import { Printer, X, Droplets, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';
import { PhoneNumber } from '../utils/phoneUtils';

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const InvoiceReceiptModal: React.FC<InvoiceReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { currencySymbol, language, t } = useApp();
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {language === 'ar' ? 'معاينة وطباعة الفاتورة' : 'Invoice & Receipt Preview'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {language === 'ar' ? 'طباعة الفاتورة (Print)' : 'Print Receipt'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt */}
        <div id="printable-invoice" className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-6 border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                  <Droplets className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {language === 'ar' ? 'FilterMaintenance لمعالجة وتكنولوجيا المياه' : 'FilterMaintenance Water Solutions & Maintenance'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'ar'
                  ? 'خدمات صيانة وتركيب وتغيير شمعات الفلاتر المنزلية والصناعية'
                  : 'Professional Water Filter Maintenance, Cartridges & Sanitization'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                {language === 'ar' ? 'فاتورة صيانة معتمدة' : 'Official Receipt'}
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1">
                {invoice.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500">
                {formatDisplayDate(invoice.date, language)}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 my-6 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block font-semibold">{t.customerName}:</span>
              <span className="font-bold text-slate-900 text-sm">{invoice.customerName}</span>
              <div className="mt-1">
                <PhoneNumber
                  phone={invoice.customerPhone}
                  align="left"
                  primaryClassName="text-slate-700 font-mono text-xs font-semibold"
                />
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold">{t.address}:</span>
              <span className="text-slate-700 block">{invoice.customerAddress || '-'}</span>
              <span className="text-slate-500 block mt-1">
                {language === 'ar' ? 'طريقة الدفع:' : 'Payment:'} {invoice.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs border-collapse border border-slate-200 mb-6">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <th className="border border-slate-200 p-2 text-center w-8">#</th>
                <th className="border border-slate-200 p-2">{language === 'ar' ? 'بيان الصيانة والشمعة المستبدلة' : 'Description'}</th>
                <th className="border border-slate-200 p-2 text-center w-16">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                <th className="border border-slate-200 p-2 text-center w-24">{language === 'ar' ? 'السعر' : 'Unit Price'}</th>
                <th className="border border-slate-200 p-2 text-right w-24">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="border border-slate-200 p-2.5 text-center font-bold">{idx + 1}</td>
                  <td className="border border-slate-200 p-2.5 font-semibold text-slate-800">
                    {item.description}
                  </td>
                  <td className="border border-slate-200 p-2.5 text-center">{item.quantity}</td>
                  <td className="border border-slate-200 p-2.5 text-center">
                    {item.unitPrice} {currencySymbol}
                  </td>
                  <td className="border border-slate-200 p-2.5 text-right font-bold text-slate-900">
                    {item.total} {currencySymbol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>{language === 'ar' ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                <span className="font-semibold">{invoice.subtotal} {currencySymbol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-sm text-slate-900">
                <span>{language === 'ar' ? 'الإجمالي المطلوب:' : 'Total Amount:'}</span>
                <span>{invoice.total} {currencySymbol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700 font-bold">
                <span>{language === 'ar' ? 'المبلغ المسدد نقداً:' : 'Amount Paid:'}</span>
                <span>{invoice.amountPaid} {currencySymbol}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-700 font-bold">
                <span>{language === 'ar' ? 'الرصيد المتبقي:' : 'Balance Due:'}</span>
                <span className={invoice.balanceDue > 0 ? 'text-rose-600' : 'text-slate-600'}>
                  {invoice.balanceDue} {currencySymbol}
                </span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 mb-6">
              <b>{t.notes}:</b> {invoice.notes}
            </div>
          )}

          {/* Warranty stamp & signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'تعليمات ما بعد الصيانة:' : 'Post-Service Advice:'}
              </p>
              <p className="text-[11px] leading-relaxed">
                {language === 'ar'
                  ? 'يرجى ترك صنبور الفلتر مفتوحاً لمدة 5 دقائق بعد تغيير الشمعات قبل الاستخدام لأول مرة.'
                  : 'Please let water run from faucet for 5 minutes after replacement before drinking.'}
              </p>
            </div>
            <div className="text-right">
              <p>{language === 'ar' ? 'ختم وتوقيع مهندس الصيانة' : 'Technician Stamp & Signature'}</p>
              <div className="h-12" />
              <p className="font-mono text-[11px]">AquaCare Quality Assurance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
