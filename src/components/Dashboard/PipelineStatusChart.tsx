import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineStatusCount } from '../../utils/dashboardMetrics';
import { colors, getBadgeClasses, StatusType } from '../../utils/colors';
import { typography } from '../../utils/typography';
import { ChartCard } from './ChartCard';

interface PipelineStatusChartProps {
  counts: PipelineStatusCount[];
}

const STATUS_FILTER_MAP: Record<string, string> = {
  'order-placed': 'order-placed',
  'add-review': 'add-review',
  'review-pending': 'review-pending',
  'send-screenshot': 'send-screenshot',
  'refund-pending': 'refund-pending',
  complete: 'complete',
  void: 'void',
};

export const PipelineStatusChart: React.FC<PipelineStatusChartProps> = ({ counts }) => {
  const navigate = useNavigate();
  const total = counts.reduce((s, c) => s + c.count, 0);

  const handleClick = (status: string) => {
    const filter = STATUS_FILTER_MAP[status];
    if (filter) navigate(`/products?status=${filter}`);
  };

  return (
    <ChartCard title="Product pipeline" subtitle="Products by workflow stage">
      {total === 0 ? (
        <div className="h-[120px] flex items-center justify-center text-[#74777f] text-sm">
          No products yet
        </div>
      ) : (
        <>
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            {counts.map((item) => (
              <div
                key={item.status}
                className={colors.status[item.status as StatusType]?.bg ?? 'bg-[#e4e2dd]'}
                style={{ width: `${(item.count / total) * 100}%` }}
                title={`${item.label}: ${item.count}`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {counts.map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => handleClick(item.status)}
                className={`text-left px-3 py-2 rounded-xl border border-[#e4e2dd] hover:border-[#006a68]/30 hover:bg-[#006a68]/5 transition-colors ${getBadgeClasses(item.status as StatusType)}`}
              >
                <div className={`${typography.numericStrong} text-lg`}>{item.count}</div>
                <div className={`${typography.caption} mt-0.5`}>{item.label}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </ChartCard>
  );
};
