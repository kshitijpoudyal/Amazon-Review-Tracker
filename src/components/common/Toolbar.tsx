import { PlusIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import React, { useState } from 'react';
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
  mobileHidden?: boolean;
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const getButtonClasses = (variant: ActionButton['variant'] = 'primary') => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const sizeClasses = 'px-4 py-4 text-sm rounded-full shadow-[0_2px_8px_rgba(2,36,72,0.06)] hover:shadow-[0_4px_16px_rgba(2,36,72,0.10)]';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} ${sizeClasses} ${colors.button.secondary}`;
      case 'danger':
        return `${baseClasses} ${sizeClasses} ${colors.button.danger}`;
      case 'primary':
      default:
        return `${baseClasses} ${sizeClasses} ${colors.button.primary}`;
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
                className="block w-full pl-10 pr-4 py-4 text-sm rounded-full bg-[#e4e2dd] border-0 placeholder-[#74777f] text-[#1b1c19] focus:outline-none focus:ring-2 focus:ring-[#022448] transition-all duration-200 shadow-[0_2px_8px_rgba(2,36,72,0.04)]"
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
              <MenuButton className="inline-flex items-center justify-center gap-x-2 px-4 py-4 text-sm font-medium text-[#1b1c19] bg-[#e4e2dd] border-0 rounded-full shadow-[0_2px_8px_rgba(2,36,72,0.04)] hover:bg-[#eae8e2] hover:shadow-[0_4px_16px_rgba(2,36,72,0.08)] focus:outline-none focus:ring-2 focus:ring-[#022448] focus:ring-offset-2 transition-all duration-200 min-w-[140px]">
                <span className="truncate">
                  {selectedOption?.label || filter.label || 'Select...'}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </MenuButton>

              <MenuItems className="absolute left-0 sm:right-0 z-20 mt-2 w-48 origin-top-left sm:origin-top-right rounded-2xl bg-[#fbf9f3] shadow-[0_12px_32px_rgba(2,36,72,0.08)] ring-1 ring-[rgba(196,198,207,0.2)] focus:outline-none transform transition-all duration-200 data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75">
                <div className="py-2">
                  {filter.options?.map((option, index) => (
                    <MenuItem key={option.value}>
                      <button
                        type="button"
                        onClick={() => filter.onChange(option.value)}
                        className={`block w-full px-4 py-3 text-left text-sm transition-colors duration-150 ${colors.modal.menuItem} ${
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
      <div className="flex items-center">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonClasses(action.variant)}
            disabled={action.disabled || loading}
            title={action.label}
          >
            {action.icon && typeof action.icon === 'string' ? (
              <span>{action.icon}</span>
            ) : action.icon ? (
              <span>{action.icon}</span>
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{action.label}</span>
          </button>
        ))}
      </div>
    );
  };

  const ToolbarShimmer = () => (
    <div className="bg-[#fbf9f3]">
      <div className="px-3 sm:px-4 lg:px-6 py-4">
        <div className="block lg:hidden space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="h-11 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            </div>
            <div className="h-11 w-11 bg-[#e4e2dd] rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="h-11 w-32 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            <div className="h-11 w-28 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            <div className="ml-auto">
              <div className="h-11 w-11 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-1 max-w-md h-11 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            <div className="h-11 w-36 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            <div className="h-11 w-32 bg-[#e4e2dd] rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-11 w-20 bg-[#e4e2dd] rounded-full animate-pulse"></div>
            <div className="h-11 w-28 bg-[#e4e2dd] rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <ToolbarShimmer />;
  }

  return (
    <div className="bg-[#fbf9f3]" style={{ marginTop: '0px' }}>
      <div className="px-3 sm:px-2 lg:px-4 py-4">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-3">
          {/* Search + filter toggle + clear */}
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {filters
                .filter(f => f.type === 'search')
                .map(renderFilter)}
            </div>
            <button
              onClick={() => setShowMobileFilters(v => !v)}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-colors flex-shrink-0 ${
                showMobileFilters || hasActiveFilters
                  ? 'bg-[#022448] text-white border-[#022448]'
                  : `${colors.background.secondary} ${colors.text.secondary} border-transparent`
              }`}
              title="Toggle filters"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              {hasActiveFilters && !showMobileFilters && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#006a68]" />
              )}
            </button>
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

          {/* Collapsible select filters */}
          {showMobileFilters && (
            <div className="flex flex-wrap items-center gap-2">
              {filters
                .filter(f => f.type === 'select')
                .map(renderFilter)}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:gap-4">
          {/* Filters */}
          <div className="flex items-center gap-3 flex-1">
            {filters.map(renderFilter)}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {showClearButton && hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                title="Clear all filters"
                className="inline-flex items-center justify-center px-3 py-4 rounded-full bg-[#e4e2dd] text-[#1b1c19] hover:bg-[#eae8e2] shadow-[0_2px_8px_rgba(2,36,72,0.04)] hover:shadow-[0_4px_16px_rgba(2,36,72,0.08)] focus:outline-none focus:ring-2 focus:ring-[#022448] transition-all duration-200"
              >
                <XMarkIcon className="h-4 w-4" />
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
