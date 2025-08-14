import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="text-center py-10 text-gray-500">
      <div className="spinner mx-auto mb-4"></div>
      <p>Loading data...</p>
    </div>
  );
};

export default LoadingSpinner;
