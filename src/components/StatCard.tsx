import React from 'react';

interface StatCardProps {
  value: string | number;
  label: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, className = '' }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-200 text-center">
      <div className={`text-2xl font-bold text-gray-900 mb-1 ${className}`}>
        {value}
      </div>
      <div className="text-gray-600 text-sm uppercase tracking-wide font-medium">
        {label}
      </div>
    </div>
  );
};

export default StatCard;
