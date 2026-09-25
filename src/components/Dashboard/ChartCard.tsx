import React from 'react';
import { typography } from '../../utils/typography';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => (
  <div
    className={`bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(2,36,72,0.07)] ${className}`}
  >
    <div className="h-0.5 bg-[#e4e2dd]" />
    <div className="p-4 sm:p-5">
      <h3 className={`${typography.bodyStrong} mb-0.5`}>{title}</h3>
      {subtitle && (
        <p className={`${typography.caption} mb-3`}>{subtitle}</p>
      )}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  </div>
);
