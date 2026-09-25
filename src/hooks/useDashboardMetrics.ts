import { useMemo } from 'react';
import { Product, Vendor } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';
import {
  computeDashboardMetrics,
  DashboardMetrics,
  DashboardTimeRange,
} from '../utils/dashboardMetrics';

export function useDashboardMetrics(
  products: Product[],
  transactions: PayPalTransaction[],
  vendors: Vendor[],
  timeRange: DashboardTimeRange = 'All'
): DashboardMetrics | null {
  return useMemo(() => {
    if (!products.length && !transactions.length) return null;
    return computeDashboardMetrics(products, transactions, vendors, timeRange);
  }, [products, transactions, vendors, timeRange]);
}
