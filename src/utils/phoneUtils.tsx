import React from 'react';

/**
 * Formats a phone number string to guarantee it renders Left-to-Right
 * and never gets reversed or scrambled in RTL (Arabic) contexts or print engines.
 */
export function formatPhoneLtr(phone?: string): string {
  if (!phone) return '-';
  // Strip any invisible bad directional marks
  const clean = phone.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim();
  // Wrap with Left-to-Right Mark (LRM) \u200E
  return `\u200E${clean}\u200E`;
}

interface PhoneNumberProps {
  phone?: string;
  secondaryPhone?: string;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export const PhoneNumber: React.FC<PhoneNumberProps> = ({
  phone,
  secondaryPhone,
  className = '',
  primaryClassName = 'font-bold text-slate-900 text-xs',
  secondaryClassName = 'text-[10px] text-slate-500 font-medium mt-0.5',
  align = 'center',
}) => {
  if (!phone && !secondaryPhone) {
    return <span>-</span>;
  }

  // Parse any multiple numbers separated by slash or comma
  const parsePhones = (val?: string) => {
    if (!val) return [];
    return val
      .split(/[/,]/)
      .map((p) => p.replace(/[\u200E\u200F\u202A-\u202E]/g, '').trim())
      .filter(Boolean);
  };

  const primaryList = parsePhones(phone);
  const secondaryList = parsePhones(secondaryPhone).filter(
    (p) => !primaryList.includes(p)
  );

  const alignClass =
    align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

  return (
    <div
      dir="ltr"
      className={`phone-container inline-flex flex-col font-mono ${alignClass} ${className}`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: align }}
    >
      {primaryList.map((p, idx) => (
        <bdi
          key={`prim-${idx}`}
          dir="ltr"
          className={`phone-number whitespace-nowrap block ${primaryClassName}`}
          style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'left' }}
        >
          {`\u200E${p}\u200E`}
        </bdi>
      ))}

      {secondaryList.map((p, idx) => (
        <bdi
          key={`sec-${idx}`}
          dir="ltr"
          className={`phone-number whitespace-nowrap block ${secondaryClassName}`}
          style={{ direction: 'ltr', unicodeBidi: 'isolate', textAlign: 'left' }}
        >
          {`\u200E${p}\u200E`}
        </bdi>
      ))}
    </div>
  );
};
