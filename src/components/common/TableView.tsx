import React from 'react';
import { MobileItemCard, MobileCardSkeleton } from './MobileItemCard';
import { colors } from '../../utils/colors';
import { Button } from './Button';

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  className?: string;
}

export interface TableAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'danger';
}

export interface TableRow {
  id: string | number;
  data: Record<string, React.ReactNode>;
  statusColor?: string;
  borderColor?: string;
  className?: string;
  actions?: TableAction[];
}

export interface MobileCardContent {
  headerContent: React.ReactNode;
  financialContent: React.ReactNode;
  actionsContent: React.ReactNode;
  borderColor?: string;
  className?: string;
}

interface TableViewProps {
  // Desktop table props
  columns: TableColumn[];
  rows: TableRow[];
  emptyMessage?: string;
  
  // Mobile card props
  mobileCards?: MobileCardContent[];
  
  // Common props
  loading?: boolean;
  loadingRows?: number;
  onRowAction?: (rowId: string | number, action: string) => void;
  
  // Dropdown state management
  activeDropdown?: string | number | null;
  onDropdownToggle?: (rowId: string | number | null) => void;
}

// Desktop Table Shimmer Loading Components
const TableRowSkeleton: React.FC<{ columns: TableColumn[] }> = ({ columns }) => (
  <tr className="group hover:bg-gray-50/50 transition-colors duration-150">
    {columns.map((column, index) => (
      <td 
        key={`skeleton-${index}`}
        className={`px-6 py-5 ${
          column.align === 'right' ? 'text-right' : 
          column.align === 'center' ? 'text-center' : 'text-left'
        }`}
      >
        {index === 0 ? (
          // First column with status indicator
          <div className="flex items-start space-x-3">
            <div className={`w-1 h-12 rounded-full flex-shrink-0 ${colors.loading.skeleton}`}></div>
            <div className="flex-1 min-w-0">
              <div className={`h-5 ${colors.loading.skeleton} rounded w-3/4 mb-1`}></div>
              <div className={`h-3 ${colors.loading.skeleton} rounded w-1/2`}></div>
            </div>
          </div>
        ) : column.key === 'actions' ? (
          // Actions column
          <div className="flex justify-center">
            <div className={`w-8 h-8 ${colors.loading.skeleton} rounded-lg`}></div>
          </div>
        ) : (
          // Regular columns
          <div className={`h-5 ${colors.loading.skeleton} rounded ${
            column.align === 'right' ? 'w-16 ml-auto' : 'w-3/4'
          }`}></div>
        )}
      </td>
    ))}
  </tr>
);

const TableLoadingView: React.FC<{ columns: TableColumn[]; loadingRows?: number }> = ({ 
  columns, 
  loadingRows = 6 
}) => (
  <>
    {/* Mobile Loading Layout */}
    <div className="block md:hidden space-y-2">
      {Array.from({ length: loadingRows }).map((_, index) => (
        <MobileCardSkeleton key={`mobile-skeleton-${index}`} />
      ))}
    </div>

    {/* Desktop Loading Layout */}
    <div className="hidden md:block">
      <div className="overflow-hidden border border-gray-200/50 bg-white shadow-sm">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hidden">
          <table className="w-full">
            {/* Table Header */}
            <thead className={`${colors.background.gradient} border-b border-gray-200/50 sticky top-0 z-10`}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={`header-${column.key}`}
                    className={`px-6 py-4 text-white font-medium text-sm tracking-wide ${
                      column.align === 'right' ? 'text-right' : 
                      column.align === 'center' ? 'text-center' : 'text-left'
                    } ${column.width || ''} ${column.className || ''}`}
                  >
                    <div className={`h-4 ${colors.loading.skeleton} rounded w-3/4 ${
                      column.align === 'right' ? 'ml-auto' : 
                      column.align === 'center' ? 'mx-auto' : ''
                    }`}></div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100">
              {Array.from({ length: loadingRows }).map((_, index) => (
                <TableRowSkeleton key={`row-skeleton-${index}`} columns={columns} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </>
);

export const TableView: React.FC<TableViewProps> = ({
  columns,
  rows,
  mobileCards,
  emptyMessage = "No data found matching your criteria.",
  loading = false,
  loadingRows = 6,
  activeDropdown,
  onDropdownToggle,
}) => {
  if (loading) {
    return <TableLoadingView columns={columns} loadingRows={loadingRows} />;
  }

  if (rows.length === 0 && (!mobileCards || mobileCards.length === 0)) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-2">
        {mobileCards?.map((card, index) => (
          <MobileItemCard
            key={index}
            headerContent={card.headerContent}
            financialContent={card.financialContent}
            actionsContent={card.actionsContent}
            borderColor={card.borderColor}
            className={card.className}
          />
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block">
        <div className={`overflow-hidden border border-gray-200/50 ${colors.background.primary} shadow-sm`}>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hidden">
            <table className="w-full">
              {/* Table Header */}
              <thead className={`${colors.background.gradient} border-b border-gray-200/50 sticky top-0 z-10`}>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-4 text-white font-medium text-sm tracking-wide ${
                        column.align === 'right' ? 'text-right' : 
                        column.align === 'center' ? 'text-center' : 'text-left'
                      } ${column.width || ''} ${column.className || ''}`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`group hover:bg-gray-50/50 transition-colors duration-150 ${row.className || ''}`}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={`${row.id}-${column.key}`}
                        className={`${
                          column.align === 'right' ? 'text-right' : 
                          column.align === 'center' ? 'text-center' : 'text-left'
                        }`}
                      >
                        {/* Status indicator bar for first column */}
                        {colIndex === 0 && row.borderColor && (
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 flex-shrink-0 border-l-4 ${row.borderColor}`}></div>
                            <div className="flex-1 min-w-0 my-4">
                              {row.data[column.key]}
                            </div>
                          </div>
                        )}
                        
                        {/* Regular content */}
                        {colIndex !== 0 && row.data[column.key]}
                        
                        {/* Actions dropdown */}
                        {column.key === 'actions' && row.actions && (
                          <div className="relative dropdown-container">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onDropdownToggle?.(row.id)}
                              icon={
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              }
                              title="More actions"
                            />

                            {activeDropdown === row.id && (
                              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                                {row.actions.map((action, actionIndex) => (
                                  <button
                                    key={actionIndex}
                                    onClick={() => {
                                      action.onClick();
                                      onDropdownToggle?.(null);
                                    }}
                                    className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                                      action.variant === 'danger'
                                        ? 'text-red-600 hover:bg-red-50'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    } ${action.className || ''}`}
                                  >
                                    {action.icon && (
                                      <span className={`w-4 h-4 mr-3 ${action.variant === 'danger' ? 'text-red-400' : 'text-gray-400'}`}>
                                        {action.icon}
                                      </span>
                                    )}
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};