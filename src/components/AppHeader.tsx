import React from 'react';
import { User } from 'firebase/auth';
import { Link, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  user: User;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  const displayName = user.displayName || user.email || 'User';
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Products', icon: '📦' },
    { path: '/paypal', label: 'PayPal', icon: '💳' },
  ];

  return (
    <div className="gradient-bg text-white">
      <div className="p-8">
        {/* Mobile Layout - Stack vertically */}
        <div className="md:hidden">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-shadow-lg text-left">
              Review Tracker Dashboard
            </h1>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-left">
              <p className="text-sm text-blue-100">Welcome back,</p>
              <p className="font-medium">{displayName}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium border border-white/30"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Desktop Layout - Side by side */}
        <div className="hidden md:flex justify-between items-center">
          <div className="text-left">
            <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
              Review Tracker Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-blue-100">Welcome back,</p>
              <p className="font-medium">{displayName}</p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium border border-white/30"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-t-lg transition-all
                  ${location.pathname === item.path
                    ? 'bg-white/20 text-white font-semibold border-b-2 border-white'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
      </nav>
    </div>
  );
};

export default AppHeader;
