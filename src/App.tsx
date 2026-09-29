import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppHeader from './components/Header/AppHeader';
import { VendorsProvider } from './contexts/VendorsContext';
import { PayPalTransactionsProvider } from './contexts/PayPalTransactionsContext';

/**
 * App Layout Component
 * 
 * This component serves as the main layout wrapper for all authenticated pages.
 * It provides:
 * - Common header navigation
 * - Consistent styling and layout structure
 * - User context through useAuth hook
 * 
 * Uses React Router's Outlet to render child routes
 */
const App: React.FC = () => {
  const { user, logout } = useAuth();

  // Don't render if user is null (should be handled by ProtectedRoute, but extra safety)
  if (!user) {
    return null;
  }

  return (
    <VendorsProvider userId={user.uid}>
      <PayPalTransactionsProvider userId={user.uid}>
        <div className="min-h-screen bg-[#fbf9f3]">
          <AppHeader user={user} onLogout={logout} />
          <main>
            <Outlet />
          </main>
        </div>
      </PayPalTransactionsProvider>
    </VendorsProvider>
  );
};

export default App;
