import React from 'react';
import { colors } from '../../utils/colors';

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
    <div className={`p-6 ${colors.status.error.bg} border-b ${colors.status.error.border}`}>
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icon}</span>
        <div>
          <h3 className={`font-semibold ${colors.status.error.text}`}>{title}</h3>
          <p className={colors.status.error.textSecondary}>{error}</p>
          {additionalInfo && (
            <div className="mt-2">{additionalInfo}</div>
          )}
        </div>
      </div>
    </div>
  );
};
