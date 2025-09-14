import React from 'react';

interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  padding?: boolean;
  border?: boolean;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ 
  children, 
  title,
  className = '',
  padding = true,
  border = true
}) => {
  const sectionClasses = [
    padding ? 'p-1' : '',
    border ? 'border-b border-gray-200' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={sectionClasses}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-0">{title}</h2>
      )}
      {children}
    </div>
  );
};
