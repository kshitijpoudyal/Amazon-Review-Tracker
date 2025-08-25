import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Products', icon: '📦' },
    { path: '/paypal', label: 'PayPal', icon: '💳' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4">
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
      </div>
    </nav>
  );
};
