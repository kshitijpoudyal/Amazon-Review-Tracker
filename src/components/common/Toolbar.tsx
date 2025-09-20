import { PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
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
    const baseClasses = 'rounded-full p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} ${colors.button.secondary}`;
      case 'danger':
        return `${baseClasses} ${colors.button.dangerSolid}`;
      case 'primary':
      default:
        return `${baseClasses} ${colors.button.indigo}`;
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
              className={`w-full px-4 py-3 text-base rounded-md ${colors.form.input.base} ${colors.form.input.text}`}
            />
          </div>
        );

      case 'select':
        const selectedOption = filter.options?.find(option => option.value === filter.value);
        return (
          <div key={filter.key} className="flex-shrink-0">
            <Menu as="div" className="relative inline-block">
              <MenuButton className={`inline-flex w-full justify-center gap-x-1.5 rounded-md px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.modal.menuButton}`}>
                {selectedOption?.label || 'Select...'}
                <ChevronDownIcon aria-hidden="true" className={`-mr-1 size-5 ${colors.text.disabled}`} />
              </MenuButton>

              <MenuItems
                transition
                className={`absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md ${colors.menu.background} ${colors.menu.border} ${colors.menu.shadow} ${colors.menu.outline} transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in`}
              >
                <div className="py-1">
                  {filter.options?.map(option => (
                    <MenuItem key={option.value}>
                      <button
                        type="button"
                        onClick={() => filter.onChange(option.value)}
                        className={`block w-full px-4 py-2 text-left text-sm ${colors.modal.menuItem} data-[focus]:outline-none`}
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
            className={`flex-shrink-0 px-3 py-2 rounded-md transition-colors ${colors.button.secondary}`}
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
