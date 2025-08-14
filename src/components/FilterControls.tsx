import React from 'react';
import { StatusFilter, DeltaFilter } from '../types/Product';

interface FilterControlsProps {
  searchTerm: string;
  statusFilter: StatusFilter;
  deltaFilter: DeltaFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onDeltaFilterChange: (value: DeltaFilter) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchTerm,
  statusFilter,
  deltaFilter,
  onSearchChange,
  onStatusFilterChange,
  onDeltaFilterChange,
}) => {
  return (
    <div className="bg-white p-8 border-b border-gray-200">
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="flex-1 min-w-64 px-4 py-3 border-2 border-gray-200 rounded-lg text-base 
                   focus:outline-none focus:border-primary-500 transition-colors"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white cursor-pointer
                   focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="review-not-added">Review Not Added</option>
          <option value="review-pending">Review Pending</option>
          <option value="pending-refund">Pending Refund</option>
          <option value="complete">Complete</option>
          <option value="void">Void</option>
        </select>
        
        <select
          value={deltaFilter}
          onChange={(e) => onDeltaFilterChange(e.target.value as DeltaFilter)}
          className="px-4 py-3 border-2 border-gray-200 rounded-lg text-base bg-white cursor-pointer
                   focus:outline-none focus:border-primary-500 transition-colors"
        >
          <option value="">All Deltas</option>
          <option value="positive">Profit</option>
          <option value="negative">Loss</option>
          <option value="zero">Break Even</option>
        </select>
      </div>
    </div>
  );
};

export default FilterControls;
