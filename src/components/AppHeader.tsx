import React from 'react';
import { User } from 'firebase/auth';

interface AppHeaderProps {
  user: User;
  onLogout: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ user, onLogout }) => {
  const displayName = user.displayName || user.email || 'User';

  return (
    <div className="gradient-bg text-white p-8">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h1 className="text-4xl font-bold mb-3 text-shadow-lg">
            Amazon Review Products Dashboard
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
  );
};

export default AppHeader;
