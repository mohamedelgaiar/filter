import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const { language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicAppUrl = window.location.origin.replace('ais-dev-', 'ais-pre-');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header with Android banner */}
        <div className="relative px-6 py-6 bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-600 text-white overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white inline-block mb-1">
                  Android App & PWA
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {language === 'ar'
                    ? 'تطبيق أندرويد — FilterMaintenance'
                    : 'Android App — FilterMaintenance'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-sky-100 mt-2 relative z-10 leading-relaxed">
            {language === 'ar'
              ? 'تطبيق متكامل وسريع لهواتف أندرويد يعمل بدون شريط المتصفح ويدعم العمل في وضع عدم الاتصال (Offline).'
              : 'Full-featured, standalone Android app that runs without browser bars and supports offline usage.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Direct 1-Tap Install Button (if browser prompt is ready) */}
          {isInstallable && !isInstalled && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block text-sm">
                    {language === 'ar' ? 'التثبيت الفوري متاح الآن!' : '1-Click Install Available!'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {language === 'ar'
                      ? 'اضغط للتثبيت مباشرة على شاشة هاتفك'
                      : 'Tap to add directly to your home screen'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDirectInstall}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تثبيت التطبيق الآن' : 'Install App Now'}</span>
              </button>
            </div>
          )}

          {/* Already installed banner */}
          {isInstalled && (
            <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center gap-2 text-sky-800 dark:text-sky-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'التطبيق مثبت بالفعل ويعمل كبرنامج أندرويد مستقل!'
                  : 'The app is already installed and running as a standalone app!'}
              </span>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                {language === 'ar'
                  ? 'خطوات التثبيت على هاتف أندرويد (Google Chrome)'
                  : 'How to Install on Android via Chrome'}
              </span>
            </h4>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  {language === 'ar'
                    ? 'افتح رابط التطبيق في متصفح Google Chrome على هاتفك الأندرويد.'
                    : 'Open the app URL in Google Chrome on your Android smartphone.'}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  {language === 'ar' ? (
                    <>
                      اضغط على قائمة الثلاث نقاط <b>(⋮)</b> في أعلى يمين المتصفح.
                    </>
                  ) : (
                    <>
                      Tap the three-dot menu <b>(⋮)</b> in the top right corner.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  {language === 'ar' ? (
                    <>
                      اختر <b>"تثبيت التطبيق" (Install app)</b> أو <b>"إضافة إلى الشاشة الرئيسية" (Add to Home screen)</b>.
                    </>
                  ) : (
                    <>
                      Select <b>"Install app"</b> or <b>"Add to Home screen"</b>.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {language === 'ar'
                    ? 'سيظهر تطبيق FilterMaintenance في قائمة التطبيقات بهاتفك بأيقونته الخاصة ويعمل كبرنامج كامل وسريع!'
                    : 'FilterMaintenance will appear in your app drawer with its native icon and full-screen experience!'}
                </p>
              </div>
            </div>
          </div>

          {/* Copy URL bar */}
          <div className="space-y-1.5">
            <span className="text-slate-500 font-medium text-[11px] block">
              {language === 'ar'
                ? 'رابط التطبيق لفتحه على هاتفك:'
                : 'App link to open on your Android phone:'}
            </span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                readOnly
                value={publicAppUrl}
                className="bg-transparent flex-1 text-slate-700 dark:text-slate-300 font-mono text-[11px] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرابط' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Convert to APK via PWABuilder */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-bold text-xs">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>
                {language === 'ar'
                  ? 'تريد ملف APK قابل للتحميل أو النشر على متجر Google Play؟'
                  : 'Want a downloadable APK file or Google Play package?'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'ar'
                ? 'هذا التطبيق متوافق 100% مع معايير PWA و Trusted Web Activities (TWA). يمكنك إدخال رابط التطبيق في موقع PWABuilder (أداة مجانية من مايكروسوفت وجوجل) لتحميل ملف APK جاهز للتثبيت المباشر أو النشر على متجر Google Play.'
                : 'This app is 100% compliant with PWA & Trusted Web Activity (TWA) standards. You can input your app URL into PWABuilder to generate a ready-to-install signed APK or Google Play Store bundle.'}
            </p>
            <a
              href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(publicAppUrl)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              <span>{language === 'ar' ? 'فتح أداة تحويل APK (PWABuilder)' : 'Open PWABuilder APK Generator'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
