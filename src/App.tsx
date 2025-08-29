import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppHeader from './components/AppHeader';
import ProductDashboard from './components/ProductDashboard';
import { PayPalDashboard } from './components/PayPalDashboard';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Determine which screen to show based on route
  const renderScreen = () => {
    switch (location.pathname) {
      case '/paypal':
        return <PayPalDashboard user={user} />;
      case '/dashboard':
      default:
         return <ProductDashboard user={user} />;
    }
  };

  return (
      <div className="max-w-8xl mx-auto glass-effect shadow-card overflow-hidden">
        <AppHeader user={user} onLogout={logout} />
        {renderScreen()}
      </div>
  );
}

export default App;
