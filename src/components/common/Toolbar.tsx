import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import React from 'react';

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
    const baseClasses = 'rounded-full p-2 text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-500 hover:bg-gray-400 focus-visible:outline-gray-500`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-400 focus-visible:outline-red-500`;
      case 'primary':
      default:
        return `${baseClasses} bg-indigo-500 hover:bg-indigo-400 focus-visible:outline-indigo-500`;
    }
  }

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
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-indigo-500"
            />
          </div>
        );

      case 'select':
        const selectedOption = filter.options?.find(option => option.value === filter.value);
        return (
          <div key={filter.key} className="flex-shrink-0">
            <Menu as="div" className="relative inline-block">
              <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-4 py-3 text-base font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {selectedOption?.label || 'Select...'}
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white border border-gray-200 shadow-lg outline outline-1 -outline-offset-1 outline-gray-200 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
              >
                <div className="py-1">
                  {filter.options?.map(option => (
                    <MenuItem key={option.value}>
                      <button
                        type="button"
                        onClick={() => filter.onChange(option.value)}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-blue-50 data-[focus]:text-blue-700 data-[focus]:outline-none hover:bg-blue-50 hover:text-blue-700"
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

  const renderAction = (actions: ActionButton[]) => {
    return (
      <div>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonClasses(action.variant)}
            disabled={action.disabled || loading}
          >
            <PlusIcon aria-hidden="true" className="size-5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
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

        {/* Action Buttons */}
        {renderAction(actions)}
      </div>
    </div>
  );
};

export default Toolbar;
