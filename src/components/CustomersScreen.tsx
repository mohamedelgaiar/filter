import React, { useState, useMemo } from 'react';
import {
  Search,
  UserPlus,
  FileSpreadsheet,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatDisplayDate, getDaysDifferenceFromToday, getStatusBadgeInfo } from '../utils/dateUtils';
import { exportCustomersToExcel } from '../utils/excelExport';
import { PhoneNumber } from '../utils/phoneUtils';
import { CustomerModal } from './CustomerModal';
import { CustomerDetailModal } from './CustomerDetailModal';

export const CustomersScreen: React.FC = () => {
  const { customers, deleteCustomer, currencySymbol, language, t } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.secondaryPhone && c.secondaryPhone.includes(q)) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.cityOrArea && c.cityOrArea.toLowerCase().includes(q)) ||
        c.filterModel.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleExport = () => {
    exportCustomersToExcel(filteredCustomers, 'water_filter_customers');
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-3`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ar'
                ? 'ابحث باسم العميل، رقم الهاتف، أو المنطقة...'
                : 'Search customers by name, phone, or area...'
            }
            className={`w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
              language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'
            }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{t.exportExcel}</span>
          </button>

          <button
            onClick={() => {
              setCustomerToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.btnAddCustomer}</span>
          </button>
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 text-sm">
              {language === 'ar' ? 'لم يتم العثور على عملاء يطابقون بحثك.' : 'No customers found.'}
            </p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            // Find earliest due stage
            const sortedStages = [...cust.stages].sort((a, b) => {
              const dueA = getDaysDifferenceFromToday(a.postponedUntil || a.currentDueDate);
              const dueB = getDaysDifferenceFromToday(b.postponedUntil || b.currentDueDate);
              return dueA - dueB;
            });
            const nextStage = sortedStages[0];
            const nextBadge = nextStage
              ? getStatusBadgeInfo(nextStage.postponedUntil || nextStage.currentDueDate, !!nextStage.postponedUntil, language)
              : null;

            return (
              <div
                key={cust.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-700/60 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-base shrink-0">
                        {cust.name.charAt(0)}
                      </div>
                      <div>
                        <button
                          onClick={() => setSelectedCustomerForDetail(cust)}
                          className="font-bold text-slate-900 dark:text-white text-base hover:text-sky-600 transition text-left cursor-pointer"
                        >
                          {cust.name}
                        </button>
                        <div className="mt-0.5">
                          <PhoneNumber
                            phone={cust.phone}
                            secondaryPhone={cust.secondaryPhone}
                            align="left"
                            primaryClassName="text-xs text-slate-500 font-mono"
                            secondaryClassName="text-[10px] text-slate-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {cust.id}
                    </span>
                  </div>

                  {/* Address & Model */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.address || cust.cityOrArea || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cust.filterModel}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{t.dateAdded}: {formatDisplayDate(cust.dateAdded, language)}</span>
                    </div>
                  </div>

                  {/* Next maintenance stage indicator */}
                  {nextStage && nextBadge && (
                    <div className="mt-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {language === 'ar' ? 'أقرب صيانة مستحقة:' : 'Next Stage Due:'}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Stage {nextStage.stageNumber}: {nextStage.stageName}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${nextBadge.color}`}>
                        {nextBadge.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {language === 'ar' ? 'الرصيد:' : 'Balance:'}{' '}
                    <b
                      className={
                        cust.balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }
                    >
                      {cust.balance} {currencySymbol}
                    </b>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedCustomerForDetail(cust)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                      title={t.btnViewDetails}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCustomerToEdit(cust)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition"
                      title={t.btnEditCustomer}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCustomerToDelete(cust)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                      title={t.btnDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || customerToEdit) && (
        <CustomerModal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setCustomerToEdit(null);
          }}
          customerToEdit={customerToEdit}
        />
      )}

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

      {/* Confirm Delete Customer Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'ar' ? 'حذف العميل نهائياً؟' : 'Delete Customer?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {customerToDelete.name}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t.btnCancel}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                {t.btnDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
