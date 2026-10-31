import React from 'react';
import {
  Droplets,
  CalendarCheck2,
  Users,
  Layers,
  Receipt,
  Globe,
  DollarSign,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDaysDifferenceFromToday } from '../utils/dateUtils';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: 'maintenance' | 'customers' | 'stages' | 'accounting';
  setCurrentTab: (tab: 'maintenance' | 'customers' | 'stages' | 'accounting') => void;
  onOpenAddCustomer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddCustomer,
}) => {
  const { customers, language, setLanguage, currency, setCurrency, resetToDemoData, t } = useApp();

  // Calculate total due stages across customers
  const dueStagesCount = customers.reduce((sum, c) => {
    return (
      sum +
      c.stages.filter(
        (s) => getDaysDifferenceFromToday(s.postponedUntil || s.currentDueDate) <= 3
      ).length
    );
  }, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-500 dark:from-sky-400 dark:via-cyan-300 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-xs select-none">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                  v2.6 Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCurrentTab('maintenance')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                currentTab === 'maintenance'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>{t.navMaintenance}</span>
              {dueStagesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {dueStagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('customers')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                currentTab === 'customers'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t.navCustomers}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {customers.length}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('stages')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                currentTab === 'stages'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t.navStagesConfig}</span>
            </button>

            <button
              onClick={() => setCurrentTab('accounting')}
              className={`px-3.5 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer ${
                currentTab === 'accounting'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>{t.navAccounting}</span>
            </button>
          </nav>

          {/* Controls: Install Android App + Quick Add Customer + Language + Currency */}
          <div className="flex items-center gap-2">
            {/* Install Android App Button */}
            <PWAInstallButton variant="header" />

            <button
              onClick={onOpenAddCustomer}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.btnAddCustomer}</span>
            </button>

            {/* Currency selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="py-1 px-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
              title="Currency"
            >
              <option value="EGP">ج.م (EGP)</option>
              <option value="SAR">ر.س (SAR)</option>
              <option value="AED">د.إ (AED)</option>
              <option value="USD">$ (USD)</option>
            </select>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={() => {
                if (window.confirm(language === 'ar' ? 'هل تريد استعادة البيانات التجريبية الأولية؟' : 'Reset to initial demo data?')) {
                  resetToDemoData();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:bg-slate-800 transition cursor-pointer"
              title={language === 'ar' ? 'إعادة ضبط البيانات التجريبية' : 'Reset demo data'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setCurrentTab('maintenance')}
            className={`py-1.5 px-2 rounded-lg flex items-center gap-1 ${
              currentTab === 'maintenance'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>{t.navMaintenance}</span>
            {dueStagesCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                {dueStagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('customers')}
            className={`py-1.5 px-2 rounded-lg flex items-center gap-1 ${
              currentTab === 'customers'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.navCustomers}</span>
          </button>

          <button
            onClick={() => setCurrentTab('stages')}
            className={`py-1.5 px-2 rounded-lg flex items-center gap-1 ${
              currentTab === 'stages'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.navStagesConfig}</span>
          </button>

          <button
            onClick={() => setCurrentTab('accounting')}
            className={`py-1.5 px-2 rounded-lg flex items-center gap-1 ${
              currentTab === 'accounting'
                ? 'text-sky-600 dark:text-sky-400 font-bold'
                : 'text-slate-500'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{t.navAccounting}</span>
          </button>

          <PWAInstallButton variant="mobile" />
        </div>
      </div>
    </header>
  );
};
