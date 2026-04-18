import React from 'react';

interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  title
}) => {
  return (
    <div className={`px-2 md:px-4 bg-[#fbf9f3]`} style={{ marginTop: '0px' }}>
      {title && (
        <h2 className={`text-xl font-semibold text-[#1b1c19] mb-0`}>{title}</h2>
      )}
      {children}
    </div>
  );
};
