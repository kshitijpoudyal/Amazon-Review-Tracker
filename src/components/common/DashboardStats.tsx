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
    <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-md shadow-gray-200/50">
      <div className="animate-pulse space-y-2">
        <div className="h-7 bg-gray-300 rounded-md"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  const StatCard = ({ value, label, className = '' }: StatItem) => (
    <div className="bg-white rounded-xl p-5 border border-gray-200/60 shadow-md shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/30 hover:-translate-y-1 transition-all duration-300 group">
      <div className={`text-2xl font-bold text-gray-900 mb-1.5 group-hover:scale-105 transition-transform duration-200 ${className}`}>
        {value}
      </div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-gray-100 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
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
