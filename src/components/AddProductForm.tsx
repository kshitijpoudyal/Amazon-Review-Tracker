import React, { useState } from "react";
import { Product } from "../types/Product";
import { ImageUploader } from "./ImageUploader";

interface AddProductFormProps {
  onAdd: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAdd, onCancel }) => {
  const [newProduct, setNewProduct] = useState<Product>({
    item: "",
    url: "",
    orderDate: null,
    orderPlaced: true,
    orderDelivered: false,
    reviewAdded: false,
    reviewLive: false,
    reviewSSSent: false,
    paid: null,
    received: null,
    delta: null,
    isVoid: false,
  });

  const handleInputChange = (field: keyof Product, value: string | number | boolean | null) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReceiptDataExtracted = (extractedData: any) => {
    // Update the form with extracted data from receipt
    if (extractedData && extractedData.orderData) {
      const orderData = extractedData.orderData;
      
      setNewProduct(prev => ({
        ...prev,
        // Fill product name from first item in the order
        item: orderData.items && orderData.items.length > 0 
          ? orderData.items[0].name 
          : prev.item,
        // Fill order date
        orderDate: orderData.orderDate 
          ? formatDateForInput(orderData.orderDate)
          : prev.orderDate,
        // Fill amount paid from order total
        paid: orderData.orderTotal || prev.paid,
        // Keep received amount as is (not available in receipt)
        received: prev.received
      }));
    }
  };

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString: string): string => {
    try {
      // Parse dates like "January 15, 2024" to "2024-01-15"
      const date = new Date(dateString + ' 12:00:00'); // Add time to avoid timezone issues
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const handleNumberChange = (field: "paid" | "received", value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    handleInputChange(field, numValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.item.trim()) {
      onAdd(newProduct);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-hidden relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Add New Product
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-1 -mr-2 sm:-mr-1"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="space-y-6">
            {/* Receipt Upload Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <span className="mr-2">📄</span>
                Import from Receipt (Optional)
              </h3>
              <ImageUploader onDataExtracted={handleReceiptDataExtracted} />
              <p className="text-xs text-gray-500 mt-2">
                Upload a receipt to automatically fill the form fields below
              </p>
            </div>

            {/* Manual Entry Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">✏️</span>
                Product Information
              </h3>
              
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.item}
                  onChange={(e) => handleInputChange("item", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter product name"
                  required
                />
              </div>

              {/* Product URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL
                </label>
                <input
                  type="url"
                  value={newProduct.url || ""}
                  onChange={(e) => handleInputChange("url", e.target.value || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  placeholder="Enter product URL (e.g., Amazon product link)"
                />
              </div>

              {/* Order Date and Amount Paid in one row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Order Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={newProduct.orderDate || ""}
                    onChange={(e) =>
                      handleInputChange("orderDate", e.target.value || null)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  />
                </div>

                {/* Amount Paid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Paid ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProduct.paid || ""}
                    onChange={(e) => handleNumberChange("paid", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    placeholder="Enter amount paid"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer with Action Buttons */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-lg">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-base"
              >
                 Add Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Render modal directly (temporarily removing portal for debugging)
  return modalContent;
};

export default AddProductForm;
