import React from 'react';
import StatCard from './StatCard';
import { ProductStats } from '../hooks/useProductStats';

interface StatsGridProps {
  stats: ProductStats | null;
}

const StatsGrid: React.FC<StatsGridProps> = React.memo(({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-5 p-8 bg-gray-50 border-b border-gray-200">
      <StatCard 
        value={stats?.totalProducts || '-'} 
        label="Total Products" 
      />
      <StatCard 
        value={stats?.completedOrders || '-'} 
        label="Completed Orders" 
        className="text-green-600"
      />
      <StatCard 
        value={stats ? `$${stats.totalPaid.toFixed(2)}` : '-'} 
        label="Total Paid" 
        className="text-yellow-600"
      />
      <StatCard 
        value={stats ? `$${stats.totalReceived.toFixed(2)}` : '-'} 
        label="Total Received" 
        className="text-green-600"
      />
      <StatCard 
        value={stats ? `$${stats.remainingRefund.toFixed(2)}` : '-'} 
        label="Remaining Refund"
        className="text-orange-600"
      />
      <StatCard 
        value={stats ? `$${stats.netDelta.toFixed(2)}` : '-'} 
        label="Net Profit/Loss"
        className={stats && stats.netDelta >= 0 ? 'text-green-600' : 'text-red-600'}
      />
    </div>
  );
});

StatsGrid.displayName = 'StatsGrid';

export default StatsGrid;
