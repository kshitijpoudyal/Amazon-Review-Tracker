import React from 'react';

interface DashboardErrorProps {
  error: string;
  title?: string;
  icon?: string;
  additionalInfo?: React.ReactNode;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ 
  error, 
  title = 'Error',
  icon = '❌',
  additionalInfo 
}) => {
  return (
    <div className="p-6 bg-red-50 border-b border-red-200">
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <div>
          <h3 className="font-semibold text-red-800">{title}</h3>
          <p className="text-red-700">{error}</p>
          {additionalInfo && (
            <div className="mt-2">{additionalInfo}</div>
          )}
        </div>
      </div>
    </div>
  );
};
