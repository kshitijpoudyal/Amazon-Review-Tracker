import React from 'react';

interface StatItem {
  value: string | number;
  label: string;
  className?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  loading?: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  stats, 
  loading = false 
}) => {
  const StatCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(2,36,72,0.07)]">
      <div className="h-0.5 bg-[#e4e2dd]" />
      <div className="p-4 animate-pulse space-y-3">
        <div className="h-3 bg-[#e4e2dd] rounded-full w-2/3"></div>
        <div className="h-7 bg-[#eae8e2] rounded-full w-3/4"></div>
      </div>
    </div>
  );

  const StatCard = ({ value, label, className = '' }: StatItem) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(2,36,72,0.07)] hover:shadow-[0_6px_20px_rgba(2,36,72,0.11)] hover:-translate-y-0.5 transition-all duration-200">
      <div className="h-0.5 bg-[#e4e2dd]" />
      <div className="p-4">
        <div className="text-[10px] font-semibold text-[#74777f] uppercase tracking-widest font-label mb-2.5">
          {label}
        </div>
        <div className={`text-xl font-bold leading-tight ${className || 'text-[#1b1c19]'}`}>
          {value}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="px-4 sm:px-6 md:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            value={stat.value}
            label={stat.label}
            className={stat.className}
          />
        ))}
      </div>
    </div>
  );
};
