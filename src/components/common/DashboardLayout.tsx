import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  useFullPageLayout?: boolean;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  useFullPageLayout = false 
}) => {
  if (useFullPageLayout) {
    return (
      <div className="min-h-screen gradient-bg-1 p-5">
        <div className="max-w-8xl mx-auto glass-effect rounded-2xl shadow-card overflow-hidden">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {children}
    </div>
  );
};
