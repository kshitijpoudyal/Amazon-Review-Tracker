import { PlusIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import React from 'react';
import { colors } from '../../utils/colors';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterControlConfig {
  type: 'search' | 'select';
  key: string;
  label?: string;
  placeholder?: string;
  options?: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string | React.ReactElement;
  disabled?: boolean;
}

interface ToolbarProps {
  filters: FilterControlConfig[];
  actions: ActionButton[];
  onClearFilters?: () => void;
  showClearButton?: boolean;
  loading?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  filters,
  actions,
  onClearFilters,
  showClearButton = true,
  loading = false,
}) => {
  const hasActiveFilters = filters.some(filter => filter.value && filter.value !== '');

  const getButtonClasses = (variant: ActionButton['variant'] = 'primary') => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizeClasses = 'px-4 py-3 text-sm rounded-xl shadow-sm hover:shadow-md';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} ${sizeClasses} ${colors.button.secondary} py-4`;
      case 'danger':
        return `${baseClasses} ${sizeClasses} ${colors.button.danger} py-4`;
      case 'primary':
      default:
        return `${baseClasses} ${sizeClasses} ${colors.button.primary} py-4`;
    }
  };

  const renderFilter = (filter: FilterControlConfig) => {
    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.key} className="flex-1 min-w-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={filter.placeholder || 'Search...'}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="block w-full pl-10 pr-4 py-4 text-sm border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
              />
              {filter.value && (
                <button
                  type="button"
                  onClick={() => filter.onChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              )}
            </div>
          </div>
        );

      case 'select':
        const selectedOption = filter.options?.find(option => option.value === filter.value);
        return (
          <div key={filter.key} className="flex-shrink-0">
            <Menu as="div" className="relative">
              <MenuButton className="inline-flex items-center justify-center gap-x-2 px-4 py-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 min-w-[140px]">
                <span className="truncate">
                  {selectedOption?.label || filter.label || 'Select...'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </MenuButton>

              <MenuItems className="absolute left-0 sm:right-0 z-20 mt-2 w-56 origin-top-left sm:origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75">
                <div className="py-2">
                  {filter.options?.map((option, index) => (
                    <MenuItem key={option.value}>
                      <button
                        type="button"
                        onClick={() => filter.onChange(option.value)}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors duration-150 ${colors.modal.menuItem} ${
                          option.value === filter.value
                            ? `${colors.modal.item.selected} font-medium`
                            : `${colors.text.primary} ${colors.modal.item.hover}`
                        } ${index === 0 ? 'rounded-t-lg' : ''} ${
                          index === (filter.options?.length || 0) - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        {option.label}
                      </button>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
          </div>
        );

      default:
        return null;
    }
  };

  const renderActions = (actions: ActionButton[]) => {
    return (
      <div className="flex items-center gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonClasses(action.variant)}
            disabled={action.disabled || loading}
            title={action.label}
          >
            {action.icon && typeof action.icon === 'string' ? (
              <span className="mr-2">{action.icon}</span>
            ) : action.icon ? (
              <span className="mr-2">{action.icon}</span>
            ) : (
              <PlusIcon className="h-4 w-4 mr-2" />
            )}
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-4">
          {/* Search and Clear */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              {filters
                .filter(f => f.type === 'search')
                .map(renderFilter)}
            </div>
            {showClearButton && hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className={getButtonClasses('secondary')}
                title="Clear filters"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {filters
              .filter(f => f.type === 'select')
              .map(renderFilter)}
            <div className="ml-auto">
              {renderActions(actions)}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:gap-6">
          {/* Filters */}
          <div className="flex items-center gap-4 flex-1">
            {filters.map(renderFilter)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {showClearButton && hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className={getButtonClasses('secondary')}
                title="Clear all filters"
              >
                <XMarkIcon className="h-4 w-4 mr-2" />
                Clear
              </button>
            )}
            {renderActions(actions)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
