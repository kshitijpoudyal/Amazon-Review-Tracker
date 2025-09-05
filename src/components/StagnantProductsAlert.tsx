import React from 'react';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Product } from '../types/Product';
import { getProductStatus } from '../utils/productStatus';

interface StagnantProductsAlertProps {
  stagnantProducts: Product[];
  onDismiss?: () => void;
  className?: string;
}

const StagnantProductsAlert: React.FC<StagnantProductsAlertProps> = ({
  stagnantProducts,
  onDismiss,
  className = ''
}) => {
  if (stagnantProducts.length === 0) {
    return null;
  }

  const getDaysSinceLastChange = (product: Product): number => {
    if (!product.statusLastChanged) return 0;
    
    const statusChangeDate = new Date(product.statusLastChanged);
    const now = new Date();
    return Math.floor((now.getTime() - statusChangeDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Products Need Your Attention
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {stagnantProducts.length} product{stagnantProducts.length > 1 ? 's' : ''} 
              {stagnantProducts.length > 1 ? ' have' : ' has'} been in the same status for 2+ weeks:
            </p>
            <ul className="mt-2 space-y-1">
              {stagnantProducts.slice(0, 3).map((product) => {
                const status = getProductStatus(product);
                const daysSinceChange = getDaysSinceLastChange(product);
                
                return (
                  <li key={product.id} className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{product.item}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {status.label}
                    </span>
                    <span className="text-xs text-yellow-600">
                      {daysSinceChange} days
                    </span>
                  </li>
                );
              })}
              {stagnantProducts.length > 3 && (
                <li className="text-xs text-yellow-600 ml-6">
                  + {stagnantProducts.length - 3} more products
                </li>
              )}
            </ul>
          </div>
          <div className="mt-3 flex space-x-3">
            <button
              type="button"
              className="text-sm text-yellow-800 font-medium hover:text-yellow-900 focus:outline-none focus:underline"
              onClick={() => {
                // Scroll to the products table or filter to show only stagnant products
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Review Products
            </button>
            {onDismiss && (
              <button
                type="button"
                className="text-sm text-yellow-600 font-medium hover:text-yellow-700 focus:outline-none focus:underline"
                onClick={onDismiss}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StagnantProductsAlert;
