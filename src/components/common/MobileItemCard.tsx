
import React from 'react';

interface MobileItemCardProps {
  headerContent: React.ReactNode;
  financialContent: React.ReactNode;
  actionsContent: React.ReactNode;
  className?: string;
}

export const MobileItemCard: React.FC<MobileItemCardProps> = ({
  headerContent,
  financialContent,
  actionsContent,
  className = ''
}) => {
  return (
    <div className={`rounded-lg shadow-md p-4 m-4 border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          {headerContent}
        </div>
      </div>

      {/* Financial Info */}
      <div className="border-t pt-3 mb-3">
        {financialContent}
      </div>

      {/* Actions */}
      <div className="flex justify-end relative dropdown-container">
        {actionsContent}
      </div>
    </div>
  );
};