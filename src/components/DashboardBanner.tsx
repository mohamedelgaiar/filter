import React from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2, UserPlus, Droplets, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDaysDifferenceFromToday, isDueToday, isOverdue } from '../utils/dateUtils';

interface DashboardBannerProps {
  onOpenAddCustomer: () => void;
  onSelectTab: (tabName: 'due' | 'postponed' | 'completed') => void;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  onOpenAddCustomer,
  onSelectTab,
}) => {
  const { customers, maintenanceTickets, language, t } = useApp();

  let dueTodayCount = 0;
  let overdueCount = 0;
  let upcomingWeekCount = 0;

  customers.forEach((c) => {
    c.stages.forEach((s) => {
      const targetDate = s.postponedUntil || s.currentDueDate;
      const diff = getDaysDifferenceFromToday(targetDate);
      if (diff < 0) overdueCount++;
      else if (diff === 0) dueTodayCount++;
      else if (diff <= 7) upcomingWeekCount++;
    });
  });

  const postponedCount = maintenanceTickets.filter((t) => t.status === 'postponed').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 print:hidden">
      {/* Overdue Card */}
      <div
        onClick={() => onSelectTab('due')}
        className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/40 shadow-xs hover:border-rose-300 transition cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            {t.statOverdue}
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
            {overdueCount}
          </span>
          <span className="text-[11px] text-slate-400 group-hover:text-rose-500 flex items-center">
            {language === 'ar' ? 'عرض المتأخرات' : 'View overdue'}
          </span>
        </div>
      </div>

      {/* Due Today Card */}
      <div
        onClick={() => onSelectTab('due')}
        className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 shadow-xs hover:border-amber-300 transition cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            {t.statDueToday}
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {dueTodayCount}
          </span>
          <span className="text-[11px] text-slate-400 group-hover:text-amber-500 flex items-center">
            {language === 'ar' ? 'مستحق اليوم' : 'Due today'}
          </span>
        </div>
      </div>

      {/* Upcoming 7 Days Card */}
      <div
        onClick={() => onSelectTab('due')}
        className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-sky-200/80 dark:border-sky-900/40 shadow-xs hover:border-sky-300 transition cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {t.statUpcoming}
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
            <Droplets className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {upcomingWeekCount}
          </span>
          <span className="text-[11px] text-slate-400 group-hover:text-sky-500 flex items-center">
            {language === 'ar' ? 'خلال الأسبوع' : 'Next 7 days'}
          </span>
        </div>
      </div>

      {/* Postponed Card */}
      <div
        onClick={() => onSelectTab('postponed')}
        className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 transition cursor-pointer flex flex-col justify-between group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t.statPostponed}
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center group-hover:scale-110 transition">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white">
            {postponedCount}
          </span>
          <span className="text-[11px] text-slate-400 group-hover:text-slate-600 flex items-center">
            {language === 'ar' ? 'عرض المؤجلات' : 'View postponed'}
          </span>
        </div>
      </div>
    </div>
  );
};
