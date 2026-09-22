import React from 'react';
import { typography } from '../../utils/typography';

interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  title
}) => {
  return (
    <div className={`px-4 md:px-6 lg:px-8 bg-[#fbf9f3]`} style={{ marginTop: '0px' }}>
      {title && (
        <h2 className={`${typography.sectionTitle} mb-0`}>{title}</h2>
      )}
      {children}
    </div>
  );
};
