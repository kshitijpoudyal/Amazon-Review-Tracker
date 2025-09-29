import React from 'react';
import { colors } from '../../utils/colors';

interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  title
}) => {
  return (
    <div className={`px-2 md:px-4 ${colors.background.secondary}`}>
      {title && (
        <h2 className={`text-xl font-semibold ${colors.text.primary} mb-0`}>{title}</h2>
      )}
      {children}
    </div>
  );
};
