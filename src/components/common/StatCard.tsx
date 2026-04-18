import React from 'react';
import { colors } from '../../utils/colors';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, className = '' }) => {
  return (
    <div className={`${colors.card.background} p-5 rounded-2xl ${colors.card.shadow} ${colors.card.border} text-center`}>
      <div className={`text-2xl font-bold ${colors.card.value} mb-1 ${className}`}>
        {value}
      </div>
      <div className={`${colors.card.label} text-xs uppercase tracking-wider font-label font-medium`}>
        {label}
      </div>
    </div>
  );
};

export default StatCard;
