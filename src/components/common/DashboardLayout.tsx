import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  useFullPageLayout?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children
}) => {
  return (
    <div className="space-y-8">
      {children}
    </div>
  );
};
