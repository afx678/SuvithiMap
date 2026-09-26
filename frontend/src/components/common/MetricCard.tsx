import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: string; // e.g. #D99A3D, #D96B55, #6F9B87
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  accentColor = '#D99A3D'
}) => {
  return (
    <div className="bg-[#191917] border border-[#34332F] rounded p-4 hover:border-[#D99A3D]/40 transition-colors relative overflow-hidden">
      {/* Top subtle highlight strip */}
      <div 
        className="absolute top-0 left-0 right-0 h-[2px]" 
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-[#96938B]">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-[#F2EFE8]">{value}</span>
            {trend && (
              <span className={`text-xs font-mono ${trendPositive ? 'text-[#6F9B87]' : 'text-[#D96B55]'}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-[#96938B]">{subtitle}</p>
          )}
        </div>

        <div className="p-2 rounded bg-[#22221F] border border-[#34332F] text-[#D99A3D]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
