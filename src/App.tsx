import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AppHeader from './components/AppHeader';
import ProductDashboard from './components/ProductDashboard';
import { PayPalDashboard } from './components/PayPalDashboard';
import NotFoundPage from './components/NotFoundPage';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Redirect to login page if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Determine which screen to show based on route
  const renderScreen = () => {
    switch (location.pathname) {
      case '/paypal':
        return <PayPalDashboard />;
      case '/':
        return <ProductDashboard />;
      default:
        return <NotFoundPage />;
    }
  };

  // Check if current route is a 404
  const is404Route = !['/', '/paypal'].includes(location.pathname);

  // For 404 pages, render without the main layout
  if (is404Route) {
    return renderScreen();
  }

  return (
      <div className="max-w-8xl mx-auto glass-effect shadow-card overflow-hidden">
        <AppHeader user={user} onLogout={logout} />
        {renderScreen()}
      </div>
  );
}

export default App;
