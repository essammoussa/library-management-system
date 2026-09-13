import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trendText?: string;
  trendPositive?: boolean;
  iconName: string;
  accentColor?: 'teal' | 'amber' | 'blue' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  trendText,
  trendPositive = true,
  iconName,
  accentColor = 'teal',
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'amber':
        return {
          iconBg: 'bg-[#fef3c7] text-[#b45309] border-[#fde68a]',
          text: 'text-[#b45309]',
        };
      case 'blue':
        return {
          iconBg: 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]',
          text: 'text-[#2563eb]',
        };
      case 'red':
        return {
          iconBg: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
          text: 'text-[#dc2626]',
        };
      case 'teal':
      default:
        return {
          iconBg: 'bg-[#e6f4f2] text-[#0f766e] border-[#bbf7d0]',
          text: 'text-[#0f766e]',
        };
    }
  };

  const styles = getAccentStyles();

  return (
    <div className="bg-white p-5 rounded-xl border border-border-archival shadow-xs hover:shadow-md transition-all flex flex-col justify-between font-sans-ui group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            {label}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-display text-3xl font-bold text-ink-primary tracking-tight">
              {value}
            </span>
            {trendText && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  trendPositive ? 'text-[#059669]' : 'text-[#dc2626]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {trendPositive ? 'arrow_upward' : 'arrow_downward'}
                </span>
                {trendText}
              </span>
            )}
          </div>
        </div>

        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${styles.iconBg}`}>
          <span className="material-symbols-outlined text-[22px]">
            {iconName}
          </span>
        </div>
      </div>

      {subtitle && (
        <div className="mt-2 pt-2 border-t border-border-archival/50 text-[11px] font-serif-body italic text-ink-muted">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
