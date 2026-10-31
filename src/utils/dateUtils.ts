/**
 * Water Filter Maintenance Date Utilities
 */

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  const now = new Date();
  return formatDateString(now);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateString(date);
}

/**
 * Calculates due date given last serviced date and interval in days
 */
export function calculateDueDate(lastServicedDate: string, intervalDays: number): string {
  return addDays(lastServicedDate, intervalDays);
}

/**
 * Difference in days between target date and today.
 * Negative means overdue by Math.abs(x) days.
 * 0 means due today.
 * Positive means due in X days.
 */
export function getDaysDifferenceFromToday(targetDateStr: string): number {
  const target = parseDate(targetDateStr);
  const today = parseDate(getTodayString());
  
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(targetDateStr: string): boolean {
  return getDaysDifferenceFromToday(targetDateStr) < 0;
}

export function isDueToday(targetDateStr: string): boolean {
  return getDaysDifferenceFromToday(targetDateStr) === 0;
}

export function isDueSoon(targetDateStr: string, thresholdDays: number = 7): boolean {
  const diff = getDaysDifferenceFromToday(targetDateStr);
  return diff >= 0 && diff <= thresholdDays;
}

export function formatDisplayDate(dateStr: string, lang: 'en' | 'ar' = 'en'): string {
  if (!dateStr) return '-';
  try {
    const date = parseDate(dateStr);
    const locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeInfo(dueDateStr: string, isPostponed: boolean = false, lang: 'en' | 'ar' = 'en') {
  if (isPostponed) {
    const daysLeft = getDaysDifferenceFromToday(dueDateStr);
    return {
      label: lang === 'ar' ? `مؤجل (${daysLeft > 0 ? `بعد ${daysLeft} يوم` : 'حان موعده'})` : `Postponed (${daysLeft > 0 ? `in ${daysLeft}d` : 'Now due'})`,
      color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      type: 'postponed' as const,
    };
  }

  const diff = getDaysDifferenceFromToday(dueDateStr);

  if (diff < 0) {
    const overdueDays = Math.abs(diff);
    return {
      label: lang === 'ar' ? `متأخر (${overdueDays} يوم)` : `Overdue (${overdueDays} days)`,
      color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
      type: 'overdue' as const,
    };
  } else if (diff === 0) {
    return {
      label: lang === 'ar' ? 'مستحق اليوم' : 'Due Today',
      color: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
      type: 'today' as const,
    };
  } else if (diff <= 7) {
    return {
      label: lang === 'ar' ? `خلال ${diff} أيام` : `Due in ${diff} days`,
      color: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      type: 'upcoming' as const,
    };
  } else {
    return {
      label: lang === 'ar' ? `بعد ${diff} يوم` : `In ${diff} days`,
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      type: 'future' as const,
    };
  }
}
