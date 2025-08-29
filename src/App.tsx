import { useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppHeader from './components/AppHeader';
import ProductDashboard from './components/ProductDashboard';
import { PayPalDashboard } from './components/PayPalDashboard';
import LoginScreen from './components/LoginScreen';

function App() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // Determine which dashboard to show based on route
  const isPayPalRoute = location.pathname === '/paypal';

  return (
      <div className="max-w-8xl mx-auto glass-effect shadow-card overflow-hidden">
        {/* Shared Header */}
        <AppHeader user={user} onLogout={logout} />
        
        {/* Conditional Dashboard Rendering */}
        {isPayPalRoute ? <PayPalDashboard /> : <ProductDashboard />}
      </div>
  );
}

export default App;
