import { useLocation } from 'react-router-dom';
import App from '../App';
import LoginPage from '../components/LoginPage';
import NotFoundPage from '../components/NotFoundPage';

const AppRouter = () => {
  const location = useLocation();
  
  // Switch case routing logic
  const renderRoute = () => {
    switch (location.pathname) {
      case '/login':
        return <LoginPage />;
      case '/':
      case '/paypal':
        return <App />; // App will handle 404s internally
      default:
         return <NotFoundPage />;
    }
  };

  return renderRoute();
};

export default AppRouter;
