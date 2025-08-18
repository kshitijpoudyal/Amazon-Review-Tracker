import React from 'react';
import { StatusFilter, DeltaFilter } from '../types/Product';

interface FilterControlsProps {
  searchTerm: string;
  statusFilter: StatusFilter;
  deltaFilter: DeltaFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onDeltaFilterChange: (value: DeltaFilter) => void;
  onClearFilters: () => void;
  showAddProduct: () => void;
  loading?: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  statusFilter,
  deltaFilter,
  onSearchChange,
  onStatusFilterChange,
  onDeltaFilterChange,
  onClearFilters,
  showAddProduct,
  loading = false,
}) => {
  const hasActiveFilters = searchTerm || statusFilter || deltaFilter;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Top Row - Actions and Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        {/* Left side - Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={showAddProduct}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Bottom Row - Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex-shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="order-placed">Order Placed</option>
            <option value="add-review">Add Review</option>
            <option value="review-pending">Review Pending</option>
            <option value="send-screenshot">Send Screenshot</option>
            <option value="refund-pending">Refund Pending</option>
            <option value="complete">Complete</option>
            <option value="void">Void</option>
          </select>
        </div>

        {/* Delta Filter */}
        <div className="flex-shrink-0">
          <select
            value={deltaFilter}
            onChange={(e) => onDeltaFilterChange(e.target.value as DeltaFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">All Deltas</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="zero">Zero</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
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

export default FilterControls;
