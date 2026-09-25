import React from 'react';
import { DashboardTimeRange } from '../../utils/dashboardMetrics';
import { typography } from '../../utils/typography';

const OPTIONS: { value: DashboardTimeRange; label: string }[] = [
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: 'YTD', label: 'YTD' },
  { value: 'All', label: 'All' },
];

interface TimeRangeToggleProps {
  value: DashboardTimeRange;
  onChange: (range: DashboardTimeRange) => void;
}

export const TimeRangeToggle: React.FC<TimeRangeToggleProps> = ({ value, onChange }) => (
  <div className="inline-flex rounded-full bg-white shadow-[0_2px_8px_rgba(2,36,72,0.06)] p-0.5">
    {OPTIONS.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`${typography.captionStrong} px-3 py-1.5 rounded-full transition-all ${
          value === opt.value
            ? 'bg-[#006a68] text-white'
            : 'text-[#74777f] hover:text-[#1b1c19]'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
