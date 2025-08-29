import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <svg 
            className="w-24 h-24 mx-auto text-gray-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.01-6-2.708V9a6 6 0 1112 0v3.293z" 
            />
          </svg>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
          <p className="text-gray-600 text-lg mb-4">
            Oops! The page you're looking for doesn't exist.
          </p>
          <p className="text-gray-500 text-sm">
            The page might have been moved, deleted, or you may have entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            to="/" 
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base transition-colors inline-block"
          >
            🏠 Go to Homepage
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="w-full px-6 py-3 text-blue-500 hover:text-blue-600 font-medium text-base transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
