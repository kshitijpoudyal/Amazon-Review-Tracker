import React from 'react';
import StatCard from '../StatCard';

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
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 text-center">
      <div className="animate-pulse">
        {/* Value shimmer */}
        <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded mb-1"></div>
        {/* Label shimmer */}
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          className={stat.className}
        />
      ))}
    </div>
  );
};
