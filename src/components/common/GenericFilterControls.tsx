import React from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterControlConfig {
  type: 'search' | 'select' | 'custom';
  key: string;
  label?: string;
  placeholder?: string;
  options?: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface GenericFilterControlsProps {
  filters: FilterControlConfig[];
  actions?: ActionButton[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
  loading?: boolean;
  className?: string;
}

const GenericFilterControls: React.FC<GenericFilterControlsProps> = ({
  filters,
  actions = [],
  onClearFilters,
  showClearButton = true,
  loading = false,
  className = ''
}) => {
  const hasActiveFilters = filters.some(filter => filter.value && filter.value !== '');

  const getButtonClasses = (variant: ActionButton['variant'] = 'primary') => {
    const baseClasses = 'px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2';
    
    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500`;
      case 'danger':
        return `${baseClasses} bg-red-500 text-white hover:bg-red-600 focus:ring-red-500`;
      case 'primary':
      default:
        return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500`;
    }
  };

  const renderFilter = (filter: FilterControlConfig) => {
    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="flex-1 min-w-0">
            <input
              type="text"
              placeholder={filter.placeholder || 'Search...'}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'select':
        return (
          <div key={filter.key} className="flex-shrink-0">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white border-b border-gray-200 px-6 py-4 ${className}`}>
      {/* Top Row - Actions */}
      {actions.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled || loading}
                className={getButtonClasses(action.variant)}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Row - Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {filters.map(renderFilter)}

        {/* Clear Filters */}
        {showClearButton && hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="flex-shrink-0 px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default GenericFilterControls;
