
import React from 'react';
import { colors } from '../../utils/colors';

interface MobileItemCardProps {
  headerContent: React.ReactNode;
  financialContent: React.ReactNode;
  actionsContent: React.ReactNode;
  borderColor?: string;
  className?: string;
}

export const MobileItemCard: React.FC<MobileItemCardProps> = ({
  headerContent,
  financialContent,
  actionsContent,
  borderColor = 'border-l-blue-500',
  className = ''
}) => {
  return (
    <div className={`
      ${colors.card.background} 
      ${colors.card.shadow}
      border-l-4 ${borderColor}
      mx-0 mb-3
      overflow-hidden
      transition-all duration-200
      hover:shadow-lg
      active:scale-[0.99]
      ${className}
    `}>
      {/* Header Section */}
      <div className="px-4 pt-4 pb-2">
        <div className="w-full">
          {headerContent}
        </div>
      </div>

      {/* Financial Section */}
      <div className="px-4 py-2 bg-gray-50/50">
        {financialContent}
      </div>

      {/* Actions Section */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex justify-end items-center relative dropdown-container">
          {actionsContent}
        </div>
      </div>
    </div>
  );
};

// Mobile Card Skeleton Loading Component
export const MobileCardSkeleton: React.FC = () => (
  <div className={`
    ${colors.card.background} 
    ${colors.card.shadow}
    border-l-4 border-l-gray-300
    mx-0 mb-3
    overflow-hidden
    animate-pulse
  `}>
    {/* Header Section */}
    <div className="px-4 pt-4 pb-2">
      <div className="w-full">
        <div className={`h-6 ${colors.loading.skeleton} rounded mb-2 w-3/4`}></div>
        <div className={`h-4 ${colors.loading.skeleton} rounded w-1/3 mb-2`}></div>
        <div className="flex flex-col items-end space-y-2 mt-2">
          <div className={`h-6 ${colors.loading.skeleton} rounded-full w-16`}></div>
          <div className={`h-5 ${colors.loading.skeleton} rounded-full w-12`}></div>
        </div>
      </div>
    </div>

    {/* Financial Section */}
    <div className="px-4 py-2 bg-gray-50/50">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="text-center">
          <div className={`h-4 ${colors.loading.skeleton} rounded mb-1`}></div>
          <div className={`h-5 ${colors.loading.skeleton} rounded`}></div>
        </div>
        <div className="text-center">
          <div className={`h-4 ${colors.loading.skeleton} rounded mb-1`}></div>
          <div className={`h-5 ${colors.loading.skeleton} rounded`}></div>
        </div>
        <div className="text-center">
          <div className={`h-4 ${colors.loading.skeleton} rounded mb-1`}></div>
          <div className={`h-5 ${colors.loading.skeleton} rounded`}></div>
        </div>
      </div>
    </div>

    {/* Actions Section */}
    <div className="px-4 py-3 border-t border-gray-100 bg-white">
      <div className="flex justify-end items-center">
        <div className={`w-8 h-8 ${colors.loading.skeleton} rounded-full`}></div>
      </div>
    </div>
  </div>
);