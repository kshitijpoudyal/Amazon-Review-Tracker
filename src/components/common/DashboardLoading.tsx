import React from 'react';
import LoadingSpinner from '../LoadingSpinner';

interface DashboardLoadingProps {
  message?: string;
  fullHeight?: boolean;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = 'Loading...',
  fullHeight = false 
}) => {
  const containerClass = fullHeight 
    ? 'flex items-center justify-center h-screen'
    : 'flex items-center justify-center h-64';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <LoadingSpinner />
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};
