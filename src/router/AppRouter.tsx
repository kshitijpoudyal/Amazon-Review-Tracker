import { Routes, Route } from 'react-router-dom';
import App from '../App';
import UserPage from '../components/UserPage';
import { PayPalDashboard } from '../components/PayPalDashboard';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/paypal" element={<PayPalDashboard />} />
      <Route path="/:username" element={<UserPage />} />
    </Routes>
  );
};

export default AppRouter;
