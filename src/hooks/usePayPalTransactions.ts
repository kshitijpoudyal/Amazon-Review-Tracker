// PayPal transactions are fetched once per session via PayPalTransactionsProvider
// (see src/contexts/PayPalTransactionsContext.tsx) and shared across every component
// that needs them, instead of each hook call re-reading the collection independently.
export { usePayPalTransactions } from '../contexts/PayPalTransactionsContext';
