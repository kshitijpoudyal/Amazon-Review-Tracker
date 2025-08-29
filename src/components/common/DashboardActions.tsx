import React from 'react';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: string | React.ReactElement;
  disabled?: boolean;
}

interface DashboardActionsProps {
  actions: ActionButton[];
  loading?: boolean;
}

export const DashboardActions: React.FC<DashboardActionsProps> = ({ 
  actions, 
  loading = false 
}) => {
  const getButtonClasses = (variant: ActionButton['variant'] = 'primary') => {
    const baseClasses = 'px-6 py-3 rounded-lg transition-colors font-semibold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    switch (variant) {
      case 'secondary':
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`;
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700`;
      case 'primary':
      default:
        return `${baseClasses} bg-green-600 text-white hover:bg-green-700`;
    }
  };

  return (
    <div className="p-4">
      <div>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={getButtonClasses(action.variant)}
            disabled={action.disabled || loading}
          >
            {action.icon && <span>{action.icon}</span>}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
