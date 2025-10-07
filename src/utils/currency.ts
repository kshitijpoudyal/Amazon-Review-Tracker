/**
 * Currency Utilities
 * 
 * Centralized utilities for currency formatting, parsing, and calculations.
 * Provides consistent currency handling across the application.
 */

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type CurrencyLocale = 'en-US' | 'en-GB' | 'en-CA' | 'en-AU';

export interface CurrencyFormatOptions {
  currency?: CurrencyCode;
  locale?: CurrencyLocale;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showSymbol?: boolean;
  showCode?: boolean;
}

// Default currency settings
const DEFAULT_CURRENCY: CurrencyCode = 'USD';
const DEFAULT_LOCALE: CurrencyLocale = 'en-US';

/**
 * Format a number as currency with full Intl.NumberFormat support
 */
export const formatCurrency = (
  amount: number | null | undefined, 
  options: CurrencyFormatOptions = {}
): string => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }

  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSymbol = true,
    showCode = false
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: showSymbol ? 'currency' : 'decimal',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      currencyDisplay: showCode ? 'code' : 'symbol'
    });

    return formatter.format(amount);
  } catch (error) {
    console.warn('Currency formatting error:', error);
    // Fallback to simple formatting
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Simple currency formatter (legacy compatibility)
 * Formats as $XX.XX without locale support
 */
export const formatSimpleCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Format currency without symbol (just the number)
 */
export const formatCurrencyValue = (
  amount: number | null | undefined, 
  decimals: number = 2
): string => {
  if (amount === null || amount === undefined) {
    return '0.00';
  }
  return amount.toFixed(decimals);
};

/**
 * Parse currency string to number
 * Handles various currency formats: $123.45, 123.45, $123,45 (European), etc.
 */
export const parseCurrency = (currencyString: string): number | null => {
  if (!currencyString || typeof currencyString !== 'string') {
    return null;
  }

  // Remove currency symbols, spaces, and convert commas to dots for European formats
  const cleanString = currencyString
    .replace(/[$£€¥₹₽¢]/g, '') // Remove common currency symbols
    .replace(/[^\d.,-]/g, '') // Keep only digits, dots, commas, and minus
    .trim();

  if (!cleanString) {
    return null;
  }

  // Handle different decimal separators
  let normalizedString = cleanString;
  
  // If there are multiple dots or commas, assume the last one is decimal separator
  const lastDotIndex = cleanString.lastIndexOf('.');
  const lastCommaIndex = cleanString.lastIndexOf(',');
  
  if (lastDotIndex > -1 && lastCommaIndex > -1) {
    // Both exist, use the rightmost one as decimal separator
    if (lastDotIndex > lastCommaIndex) {
      // Dot is decimal separator, remove commas
      normalizedString = cleanString.replace(/,/g, '');
    } else {
      // Comma is decimal separator, convert to dot and remove other dots
      normalizedString = cleanString.replace(/\./g, '').replace(',', '.');
    }
  } else if (lastCommaIndex > -1 && lastCommaIndex > cleanString.length - 4) {
    // Comma near end, likely decimal separator
    normalizedString = cleanString.replace(',', '.');
  }

  const parsed = parseFloat(normalizedString);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Round currency to standard precision (2 decimal places)
 */
export const roundCurrency = (amount: number): number => {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

/**
 * Add two currency amounts with proper rounding
 */
export const addCurrency = (
  amount1: number | null, 
  amount2: number | null
): number => {
  const a = amount1 || 0;
  const b = amount2 || 0;
  return roundCurrency(a + b);
};

/**
 * Subtract two currency amounts with proper rounding
 */
export const subtractCurrency = (
  amount1: number | null, 
  amount2: number | null
): number => {
  const a = amount1 || 0;
  const b = amount2 || 0;
  return roundCurrency(a - b);
};

/**
 * Check if currency amount is positive
 */
export const isCurrencyPositive = (amount: number | null): boolean => {
  return amount !== null && amount > 0;
};

/**
 * Check if currency amount is negative
 */
export const isCurrencyNegative = (amount: number | null): boolean => {
  return amount !== null && amount < 0;
};

/**
 * Check if currency amount is zero
 */
export const isCurrencyZero = (amount: number | null): boolean => {
  return amount === null || amount === 0;
};

/**
 * Get absolute value of currency amount
 */
export const absoluteCurrency = (amount: number | null): number => {
  return amount === null ? 0 : Math.abs(amount);
};

/**
 * Format currency for display in tables (consistent width)
 */
export const formatTableCurrency = (amount: number | null): string => {
  return formatCurrency(amount, { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

/**
 * Format currency for compact display (e.g., in cards)
 */
export const formatCompactCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) {
    return '$0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (abs >= 1000000) {
    return `${sign}$${(abs / 1000000).toFixed(1)}M`;
  } else if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount);
  }
};

/**
 * Validate currency input string
 */
export const isValidCurrencyInput = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  // Allow digits, dots, commas, currency symbols, and minus sign
  const currencyPattern = /^-?[$£€¥₹₽¢]?\s*\d{1,3}(,?\d{3})*(\.\d{1,2})?$/;
  const cleanInput = input.trim();
  
  return currencyPattern.test(cleanInput) || /^\d+(\.\d{1,2})?$/.test(cleanInput);
};

// Legacy export aliases for backward compatibility
export const formatCurrencyAmount = formatCurrency;
export const parseCurrencyString = parseCurrency;