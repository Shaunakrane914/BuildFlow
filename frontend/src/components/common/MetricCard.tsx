import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple' | 'slate';
  reqId?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  reqId,
  onClick,
}) => {
  const colorMap = {
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    blue: 'from-sky-500/20 to-transparent border-sky-500/30 text-sky-400',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
    slate: 'from-slate-500/20 to-transparent border-slate-500/30 text-slate-400',
  };

  const iconBgMap = {
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-b ${colorMap[color]} bg-slate-900/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-[1.01] hover:border-slate-600 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </span>
            {reqId && (
              <span className="text-[10px] font-mono font-medium text-amber-400/80 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                {reqId}
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold font-display text-white tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium">
              <span className={trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${iconBgMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
