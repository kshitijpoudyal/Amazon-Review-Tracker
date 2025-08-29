import { useState, useCallback, useMemo } from 'react';

export interface FilterState {
  [key: string]: string;
}

export interface UseGenericFiltersOptions {
  initialFilters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
}

export const useGenericFilters = (options: UseGenericFiltersOptions = {}) => {
  const { initialFilters = {}, onFilterChange } = options;
  
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback((key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {} as FilterState);
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  }, [filters, onFilterChange]);

  const resetFilters = useCallback((newFilters: FilterState = initialFilters) => {
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [initialFilters, onFilterChange]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => value && value !== '');
  }, [filters]);

  const getFilterValue = useCallback((key: string): string => {
    return filters[key] || '';
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    resetFilters,
    hasActiveFilters,
    getFilterValue,
    setFilters
  };
};
