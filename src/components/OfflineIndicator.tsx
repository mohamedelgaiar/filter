import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useApp } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useApp();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center justify-between gap-3 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-xl border border-amber-500/30 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span>
          {language === 'ar'
            ? 'وضع عدم الاتصال — يمكنك استخدام التطبيق والبيانات المحفوظة بدون إنترنت.'
            : 'Offline Mode — You can continue using cached data without internet.'}
        </span>
      </div>
    </div>
  );
};
