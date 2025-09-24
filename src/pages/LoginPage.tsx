import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../components/Login/LoginScreen';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    // Redirect to home page after successful login
    navigate('/');
  };

  // Don't render anything if user is already logged in (will redirect)
  if (user) {
    return null;
  }

  return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
};

export default LoginPage;
