import React from 'react';

interface ProductToolbarProps {
  onAddProduct: () => void;
  onImportReceipt?: () => void;
  onResetData: () => void;
  onSaveToFirebase: () => void;
  hasLocalChanges: boolean;
  productCount: number;
}

const ProductToolbar: React.FC<ProductToolbarProps> = ({
  onAddProduct
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border-b border-gray-200">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onAddProduct}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </button>        
        
        <button
          onClick={() => window.open('https://www.amazon.com/gp/css/order-history?ref_=nav_AccountFlyout_orders', '_blank')}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Amazon Orders
        </button>
      </div>
    </div>
  );
};

export default ProductToolbar;
