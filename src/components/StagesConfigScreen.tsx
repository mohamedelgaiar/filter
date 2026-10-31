import React, { useState } from 'react';
import { Layers, Plus, Save, Clock, DollarSign, Check, Info, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FilterStageType } from '../types';

export const StagesConfigScreen: React.FC = () => {
  const { stageDefinitions, updateStageDefinitions, currencySymbol, language, t } = useApp();

  const [stages, setStages] = useState<FilterStageType[]>(stageDefinitions);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleStageChange = (id: string, field: keyof FilterStageType, value: any) => {
    setStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleAddStage = () => {
    const nextNumber = stages.length > 0 ? Math.max(...stages.map((s) => s.stageNumber)) + 1 : 1;
    const newStage: FilterStageType = {
      id: `stage-${Date.now()}`,
      stageNumber: nextNumber,
      name: `Stage ${nextNumber}: New Custom Cartridge`,
      nameAr: `المرحلة ${nextNumber}: شمعة إضافية مخصصة`,
      defaultIntervalDays: 180,
      defaultCost: 10,
      defaultPrice: 25,
      description: 'Custom filtration stage',
      descriptionAr: 'مرحلة تنقية إضافية',
    };
    setStages([...stages, newStage]);
    setHasChanges(true);
  };

  const handleDeleteStage = (id: string) => {
    setStages(stages.filter((s) => s.id !== id));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateStageDefinitions(stages);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {language === 'ar' ? 'تعريف مراحل الفلتر ومدد التغيير والتسعير' : 'Filter Stages, Replacement Intervals & Pricing'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'تحديد عدد الأيام الفاصلة لكل مرحلة والتكلفة وسعر البيع لحساب المواعيد والأرباح تلقائياً.'
                  : 'Define the default interval days, cost, and retail price for each filter cartridge stage.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAddStage}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة مرحلة جديدة' : 'Add Stage'}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={!hasChanges && !saveSuccess}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : hasChanges
                ? 'bg-sky-600 hover:bg-sky-700 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>{language === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved!'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Tip */}
      <div className="p-4 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 rounded-2xl flex items-start gap-3 text-xs text-sky-800 dark:text-sky-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
        <div>
          <b>{language === 'ar' ? 'ملاحظة تشغيلية هامة:' : 'Operational Note:'}</b>{' '}
          {language === 'ar'
            ? 'عند إضافة أي عميل جديد، يعتمد البرنامج هذه المدد (مثل المرحلة 1 كل 90 يوم، والمرحلة 2 و3 كل 180 يوم) لحساب مواعيد التغيير القادمة فوراً والبدء في العد التنازلي.'
            : 'New clients will automatically inherit these intervals to calculate upcoming due dates and reset cycles.'}
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-4">
        {stages.map((st) => {
          const margin = (st.defaultPrice || 0) - (st.defaultCost || 0);
          const marginPercent =
            st.defaultPrice > 0 ? Math.round((margin / st.defaultPrice) * 100) : 0;

          return (
            <div
              key={st.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-sm shrink-0">
                    {st.stageNumber}
                  </span>
                  <div>
                    <input
                      type="text"
                      value={language === 'ar' ? st.nameAr : st.name}
                      onChange={(e) =>
                        handleStageChange(
                          st.id,
                          language === 'ar' ? 'nameAr' : 'name',
                          e.target.value
                        )
                      }
                      className="font-bold text-slate-900 dark:text-white text-base bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-hidden px-1"
                    />
                    <input
                      type="text"
                      value={language === 'ar' ? st.descriptionAr : st.description}
                      onChange={(e) =>
                        handleStageChange(
                          st.id,
                          language === 'ar' ? 'descriptionAr' : 'description',
                          e.target.value
                        )
                      }
                      className="block text-xs text-slate-500 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-hidden px-1 mt-0.5 w-full sm:w-96"
                    />
                  </div>
                </div>

                {stages.length > 3 && (
                  <button
                    onClick={() => handleDeleteStage(st.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition self-end sm:self-center"
                    title="Delete stage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid of parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* Interval Days */}
                <div>
                  <label className="block text-slate-500 mb-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {language === 'ar' ? 'مدة التغيير (بالأيام):' : 'Interval (Days):'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="7"
                      max="1500"
                      value={st.defaultIntervalDays}
                      onChange={(e) =>
                        handleStageChange(
                          st.id,
                          'defaultIntervalDays',
                          parseInt(e.target.value) || 30
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                    <span className="text-slate-400 text-xs">{t.days}</span>
                  </div>
                </div>

                {/* Wholesale Cost */}
                <div>
                  <label className="block text-slate-500 mb-1 flex items-center gap-1 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    {language === 'ar' ? 'سعر التكلفة (جملة):' : 'Wholesale Cost:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={st.defaultCost}
                      onChange={(e) =>
                        handleStageChange(st.id, 'defaultCost', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                    <span className="text-slate-400 text-xs">{currencySymbol}</span>
                  </div>
                </div>

                {/* Retail Price */}
                <div>
                  <label className="block text-slate-500 mb-1 flex items-center gap-1 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    {language === 'ar' ? 'سعر البيع للعميل:' : 'Retail Price:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={st.defaultPrice}
                      onChange={(e) =>
                        handleStageChange(st.id, 'defaultPrice', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                    <span className="text-slate-400 text-xs">{currencySymbol}</span>
                  </div>
                </div>

                {/* Profit Margin Preview */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 block">
                    {language === 'ar' ? 'هامش الربح المتوقع:' : 'Gross Margin:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 text-sm">
                      +{margin.toFixed(1)} {currencySymbol}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      ({marginPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
