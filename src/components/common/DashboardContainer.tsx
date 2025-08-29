import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      {children}
    </div>
  );
};
