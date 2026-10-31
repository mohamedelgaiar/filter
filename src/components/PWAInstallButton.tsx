import React, { useState } from 'react';
import { Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { AndroidInstallModal } from './AndroidInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'mobile' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const { language } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If already running standalone on Android, suppress button
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setIsModalOpen(true);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  if (variant === 'mobile') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`py-1.5 px-2 rounded-lg flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'تطبيق أندرويد' : 'Android App'}</span>
        </button>

        <AndroidInstallModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition cursor-pointer ${className}`}
        title={language === 'ar' ? 'تثبيت تطبيق أندرويد' : 'Install Android App'}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden md:inline">
          {language === 'ar' ? 'تطبيق أندرويد' : 'Install Android App'}
        </span>
        <span className="md:hidden">
          {language === 'ar' ? 'تطبيق' : 'App'}
        </span>
      </button>

      <AndroidInstallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
