import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Calendar, Layers, FileText, X, Check, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer, CustomerStageConfig } from '../types';
import { calculateDueDate, getTodayString } from '../utils/dateUtils';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer, systemPresets, stageDefinitions, currencySymbol, language, t } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [address, setAddress] = useState('');
  const [cityOrArea, setCityOrArea] = useState('');
  const [dateAdded, setDateAdded] = useState(getTodayString());
  const [selectedPresetId, setSelectedPresetId] = useState('7-stage-ro');
  const [filterModel, setFilterModel] = useState('');
  const [notes, setNotes] = useState('');
  const [stages, setStages] = useState<CustomerStageConfig[]>([]);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setSecondaryPhone(customerToEdit.secondaryPhone || '');
      setAddress(customerToEdit.address);
      setCityOrArea(customerToEdit.cityOrArea || '');
      setDateAdded(customerToEdit.dateAdded);
      setFilterModel(customerToEdit.filterModel);
      setNotes(customerToEdit.notes || '');
      setStages(customerToEdit.stages);
    } else {
      // New Customer initial setup from selected preset
      const preset = systemPresets.find((p) => p.id === selectedPresetId) || systemPresets[0];
      setFilterModel(language === 'ar' ? preset.nameAr : preset.name);
      
      const newStages: CustomerStageConfig[] = preset.stages.map((st) => ({
        stageNumber: st.stageNumber,
        stageName: language === 'ar' ? st.nameAr : st.name,
        intervalDays: st.intervalDays,
        lastServicedDate: dateAdded,
        currentDueDate: calculateDueDate(dateAdded, st.intervalDays),
        customPrice: st.price,
      }));
      setStages(newStages);
    }
  }, [customerToEdit, isOpen]);

  // When dateAdded changes on a new customer, re-calculate due dates for stages that haven't been customized
  const handleDateAddedChange = (newDate: string) => {
    setDateAdded(newDate);
    if (!customerToEdit) {
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          lastServicedDate: newDate,
          currentDueDate: calculateDueDate(newDate, s.intervalDays),
        }))
      );
    }
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = systemPresets.find((p) => p.id === presetId);
    if (!preset) return;

    setFilterModel(language === 'ar' ? preset.nameAr : preset.name);
    const newStages: CustomerStageConfig[] = preset.stages.map((st) => ({
      stageNumber: st.stageNumber,
      stageName: language === 'ar' ? st.nameAr : st.name,
      intervalDays: st.intervalDays,
      lastServicedDate: dateAdded,
      currentDueDate: calculateDueDate(dateAdded, st.intervalDays),
      customPrice: st.price,
    }));
    setStages(newStages);
  };

  const handleStageIntervalChange = (stageNumber: number, newInterval: number) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.stageNumber === stageNumber) {
          const baseDate = s.lastServicedDate || dateAdded;
          return {
            ...s,
            intervalDays: newInterval,
            currentDueDate: calculateDueDate(baseDate, newInterval),
          };
        }
        return s;
      })
    );
  };

  const handleStagePriceChange = (stageNumber: number, newPrice: number) => {
    setStages((prev) =>
      prev.map((s) => (s.stageNumber === stageNumber ? { ...s, customPrice: newPrice } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (customerToEdit) {
      updateCustomer({
        ...customerToEdit,
        name: name.trim(),
        phone: phone.trim(),
        secondaryPhone: secondaryPhone.trim(),
        address: address.trim(),
        cityOrArea: cityOrArea.trim(),
        dateAdded,
        filterModel,
        stages,
        notes: notes.trim(),
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        secondaryPhone: secondaryPhone.trim(),
        address: address.trim(),
        cityOrArea: cityOrArea.trim(),
        dateAdded,
        filterModel,
        stages,
        notes: notes.trim(),
        balance: 0,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-sky-50/70 dark:bg-sky-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                {customerToEdit ? t.btnEditCustomer : t.btnAddCustomer}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'تسجيل بيانات العميل ومراحل الفلتر والمدد لحساب مواعيد الصيانة'
                  : 'Customer profile, filter model, and stage replacement intervals'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Customer Personal Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-sky-500" />
              {language === 'ar' ? 'البيانات الشخصية وبيانات الاتصال' : 'Customer & Contact Details'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.customerName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'ar' ? 'أحمد محمد علي' : 'Full Customer Name'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.phoneNumber} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+20 101 234 5678"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.secondaryPhone}
                </label>
                <input
                  type="tel"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="+20 122 333 4455"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.cityOrArea}
                </label>
                <input
                  type="text"
                  value={cityOrArea}
                  onChange={(e) => setCityOrArea(e.target.value)}
                  placeholder={language === 'ar' ? 'التجمع الخامس / المعادي / الشيخ زايد' : 'New Cairo / Downtown'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'عمارة 15، شارع النصر، الدور الثالث، شقة 12' : 'Full street address, building, floor, apt'}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Installation Date & Model */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              {language === 'ar' ? 'تاريخ الإضافة وموديل الفلتر' : 'Installation Date & System Model'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.dateAdded} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={dateAdded}
                  onChange={(e) => handleDateAddedChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'من هذا التاريخ، يقوم البرنامج بحساب مواعيد تغيير كل شمعة تلقائياً.'
                    : 'System calculates stage replacement dates forward from this date.'}
                </p>
              </div>

              {!customerToEdit && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'ar' ? 'اختيار نوع الفلتر الجاهز:' : 'Select Filter System Preset:'}
                  </label>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                  >
                    {systemPresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {language === 'ar' ? p.nameAr : p.name} ({p.stagesCount} {language === 'ar' ? 'مراحل' : 'stages'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.filterModel}
                </label>
                <input
                  type="text"
                  value={filterModel}
                  onChange={(e) => setFilterModel(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Stages & Durations (Intervals) */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-500" />
                {language === 'ar'
                  ? 'مراحل الفلتر ومدة كل شمعة (بالأيام) وتاريخ الاستحقاق'
                  : 'Filter Stages, Intervals (Days) & Calculated Due Dates'}
              </h4>
            </div>

            <div className="space-y-2">
              {stages.map((st) => (
                <div
                  key={st.stageNumber}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
                      {st.stageNumber}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {st.stageName}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {language === 'ar' ? 'تاريخ الاستحقاق المحسوب:' : 'Calculated Due Date:'}{' '}
                        <span className="font-medium text-sky-600 dark:text-sky-400">{st.currentDueDate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">{t.days}:</span>
                      <input
                        type="number"
                        min="10"
                        max="1200"
                        value={st.intervalDays}
                        onChange={(e) =>
                          handleStageIntervalChange(st.stageNumber, parseInt(e.target.value) || 30)
                        }
                        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-center"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">{currencySymbol}:</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={st.customPrice || 0}
                        onChange={(e) =>
                          handleStagePriceChange(st.stageNumber, parseFloat(e.target.value) || 0)
                        }
                        className="w-18 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t.notes}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'ar' ? 'مثال: تفضيلات مواعيد الزيارة، قياس ضغط المياه، موقع المحبس الرئيسي' : 'Technician notes, preferred visit times, pump details'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition"
            >
              {t.btnCancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {customerToEdit ? t.btnSave : t.btnAddCustomer}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
