// Vendors are fetched once per session via VendorsProvider (see src/contexts/VendorsContext.tsx)
// and shared across every component that needs them, instead of each hook call
// re-reading the vendors collection from Firestore independently.
export { useVendors } from '../contexts/VendorsContext';
