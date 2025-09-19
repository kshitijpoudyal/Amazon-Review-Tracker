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
    <div>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-0">{title}</h2>
      )}
      {children}
    </div>
  );
};
