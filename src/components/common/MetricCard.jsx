import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const MetricCard = ({
  title,
  value,
  changeText,
  changePercentage,
  isPositive = true,
  icon: Icon,
  colorScheme = 'orange', // 'orange', 'blue', 'purple', 'red'
  onClick,
  badgeText
}) => {
  const colorStyles = {
    orange: {
      bgIcon: 'bg-orange-50 text-orange-600 border border-orange-200/60',
      badge: 'bg-orange-500/10 text-orange-600',
      arrowBg: 'bg-orange-500 text-white',
      accentGlow: 'hover:border-orange-200'
    },
    blue: {
      bgIcon: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      badge: 'bg-blue-500/10 text-blue-600',
      arrowBg: 'bg-blue-500 text-white',
      accentGlow: 'hover:border-blue-200'
    },
    purple: {
      bgIcon: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      badge: 'bg-indigo-500/10 text-indigo-600',
      arrowBg: 'bg-indigo-500 text-white',
      accentGlow: 'hover:border-indigo-200'
    },
    red: {
      bgIcon: 'bg-rose-50 text-rose-600 border border-rose-200/60',
      badge: 'bg-rose-500/10 text-rose-600',
      arrowBg: 'bg-rose-500 text-white',
      accentGlow: 'hover:border-rose-200'
    }
  };

  const scheme = colorStyles[colorScheme] || colorStyles.orange;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-slate-200/80 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + scheme.accentGlow : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scheme.bgIcon}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
          <span className="text-sm font-semibold text-slate-500">{title}</span>
        </div>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${scheme.arrowBg} opacity-90 shadow-sm`}>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between mt-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          {badgeText ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
              {badgeText}
            </span>
          ) : (
            <span className="text-slate-500">{changeText}</span>
          )}
        </div>
        {changePercentage && (
          <div className={`flex items-center font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />}
            {changePercentage}
          </div>
        )}
      </div>
    </div>
  );
};
