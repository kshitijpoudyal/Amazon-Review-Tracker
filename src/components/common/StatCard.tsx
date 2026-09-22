import React from 'react';
import { colors } from '../../utils/colors';
import { typography } from '../../utils/typography';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, className = '' }) => {
  return (
    <div className={`${colors.card.background} p-5 rounded-2xl ${colors.card.shadow} ${colors.card.border} text-center`}>
      <div className={`${typography.statValue} mb-1 ${className}`}>
        {value}
      </div>
      <div className={`${typography.statLabel}`}>
        {label}
      </div>
    </div>
  );
};

export default StatCard;
