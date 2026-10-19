import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'default' | 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'default',
  trend,
}) => {
  const schemeStyles = {
    default: {
      iconBg: 'bg-slate-100 text-slate-700',
      border: 'border-slate-200',
    },
    indigo: {
      iconBg: 'bg-indigo-50 text-indigo-700',
      border: 'border-indigo-100',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700',
      border: 'border-emerald-100',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700',
      border: 'border-amber-100',
    },
    purple: {
      iconBg: 'bg-purple-50 text-purple-700',
      border: 'border-purple-100',
    },
    rose: {
      iconBg: 'bg-rose-50 text-rose-700',
      border: 'border-rose-100',
    },
  }[colorScheme];

  return (
    <div
      className={`bg-white border ${schemeStyles.border} rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${schemeStyles.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tabular-nums font-mono">
          {value}
        </span>
        {trend && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 leading-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
};
