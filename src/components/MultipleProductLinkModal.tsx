import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';

interface MultipleProductLinkModalProps {
  isOpen: boolean;
  transaction: PayPalTransaction;
  products: Product[];
  onSave: (transactionId: string, productDistribution: { [productId: string]: number }) => void;
  onCancel: () => void;
}

interface ProductAllocation {
  productId: string;
  productName: string;
  amount: number;
}

const MultipleProductLinkModal: React.FC<MultipleProductLinkModalProps> = ({
  isOpen,
  transaction,
  products,
  onSave,
  onCancel
}) => {
  const [allocations, setAllocations] = useState<ProductAllocation[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize with existing allocations or empty
      const existingDistribution = transaction.productDistribution || {};
      const linkedProductIds = transaction.linkedProductIds || [];
      
      // If we have legacy single product link, convert it
      if (transaction.linkedProductId && !linkedProductIds.length) {
        linkedProductIds.push(transaction.linkedProductId);
        existingDistribution[transaction.linkedProductId] = transaction.total;
      }

      const initialAllocations = linkedProductIds.map(productId => {
        const product = products.find(p => p.id === productId);
        return {
          productId,
          productName: product?.item || 'Unknown Product',
          amount: existingDistribution[productId] || 0
        };
      });

      setAllocations(initialAllocations);
      setAvailableProducts(products.filter(p => p.id && !linkedProductIds.includes(p.id)));
      setSearchTerm('');
      setShowProductDropdown(false);
    }
  }, [isOpen, transaction, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProductDropdown(false);
    };

    if (showProductDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showProductDropdown]);

  const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);
  const remaining = transaction.total - totalAllocated;

  // Filter available products based on search term
  const filteredAvailableProducts = availableProducts.filter(product =>
    product.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product: Product) => {
    const newAllocation: ProductAllocation = {
      productId: product.id!,
      productName: product.item,
      amount: Math.max(0, remaining)
    };
    
    setAllocations([...allocations, newAllocation]);
    setAvailableProducts(availableProducts.filter(p => p.id !== product.id));
    setSearchTerm('');
    setShowProductDropdown(false);
  };

  const removeProduct = (productId: string) => {
    const removedAllocation = allocations.find(a => a.productId === productId);
    if (removedAllocation) {
      const product = products.find(p => p.id === productId);
      if (product) {
        setAvailableProducts([...availableProducts, product]);
      }
    }
    setAllocations(allocations.filter(a => a.productId !== productId));
  };

  const updateAmount = (productId: string, amount: number) => {
    setAllocations(allocations.map(allocation =>
      allocation.productId === productId
        ? { ...allocation, amount: Math.max(0, amount) }
        : allocation
    ));
  };

  const handleSave = () => {
    const productDistribution: { [productId: string]: number } = {};
    allocations.forEach(allocation => {
      if (allocation.amount > 0) {
        productDistribution[allocation.productId] = allocation.amount;
      }
    });
    
    onSave(transaction.id!, productDistribution);
  };

  const autoDistribute = () => {
    if (allocations.length === 0) return;
    
    const amountPerProduct = transaction.total / allocations.length;
    setAllocations(allocations.map(allocation => ({
      ...allocation,
      amount: Math.round(amountPerProduct * 100) / 100
    })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Link Multiple Products to Transaction
        </h2>
        
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold">Transaction Details</h3>
          <p>Amount: ${transaction.total.toFixed(2)}</p>
          <p>Date: {transaction.date}</p>
          <p>Name: {transaction.name}</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Product Allocations</h3>
            <div className="flex gap-2">
              <button
                onClick={autoDistribute}
                disabled={allocations.length === 0}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                Auto Distribute
              </button>
            </div>
          </div>

          {/* Product Search and Selection */}
          {availableProducts.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products to add..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowProductDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                {showProductDropdown && (searchTerm.length > 0 || filteredAvailableProducts.length <= 10) && (
                  <div 
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filteredAvailableProducts.length > 0 ? (
                      filteredAvailableProducts.slice(0, 10).map(product => (
                        <button
                          key={product.id}
                          onClick={() => addProduct(product)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900 truncate">
                            {product.item}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.orderDate ? `Ordered: ${product.orderDate}` : 'No order date'}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        {searchTerm ? 'No products found matching your search' : 'Start typing to search products'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {availableProducts.length > 0 && !showProductDropdown && (
                <p className="text-sm text-gray-600 mt-1">
                  {availableProducts.length} product{availableProducts.length === 1 ? '' : 's'} available to add
                </p>
              )}
            </div>
          )}

          {allocations.map((allocation) => (
            <div key={allocation.productId} className="flex items-center gap-2 mb-2 p-2 border rounded">
              <div className="flex-1">
                <span className="font-medium">{allocation.productName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={transaction.total}
                  value={allocation.amount}
                  onChange={(e) => updateAmount(allocation.productId, parseFloat(e.target.value) || 0)}
                  className="w-24 px-2 py-1 border rounded text-center"
                />
                <button
                  onClick={() => removeProduct(allocation.productId)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {allocations.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No products linked. Click "Add Product" to start.
            </p>
          )}
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="flex justify-between">
            <span>Total Transaction: ${transaction.total.toFixed(2)}</span>
            <span>Allocated: ${totalAllocated.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className={remaining < 0 ? 'text-red-600' : remaining > 0 ? 'text-orange-600' : 'text-green-600'}>
              Remaining: ${remaining.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">
              {remaining === 0 ? '✓ Fully allocated' : remaining < 0 ? '⚠ Over-allocated' : '⚠ Under-allocated'}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Links
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultipleProductLinkModal;
