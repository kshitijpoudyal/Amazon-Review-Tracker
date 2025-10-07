import React, { useState } from "react";
import { Product } from "../../types/Product";
import { ImageUploader } from "./ImageUploader";
import { colors } from "../../utils/colors";
import { Modal } from "../common";
import { useVendors } from "../../hooks/useVendors";

interface AddProductFormProps {
  isOpen: boolean;
  onAdd: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onAdd, onCancel }) => {
  const { activeVendors, DEFAULT_VENDOR_ID } = useVendors();
  
  const [newProduct, setNewProduct] = useState<Product>({
    item: "",
    url: "",
    orderDate: null,
    orderNumber: "",
    orderPlaced: true,
    orderDelivered: false,
    reviewAdded: false,
    reviewLive: false,
    reviewSSSent: false,
    paid: null,
    received: null,
    delta: null,
    isVoid: false,
    vendorId: DEFAULT_VENDOR_ID, // Default to MD Bro
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
        // Fill order number from extracted data
        orderNumber: orderData.orderNumber || prev.orderNumber,
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

  const modalBody = (
    <div className="p-6 space-y-6">
      {/* Receipt Upload Section - Desktop */}
      <div className={`hidden sm:block ${colors.background.secondary} rounded-lg p-4 ${colors.border.default}`}>
        <h3 className={`text-sm ${colors.form.label} mb-3 flex items-center`}>
          <span className="mr-2">📄</span>
          Import from Receipt (Optional)
        </h3>
        <ImageUploader onDataExtracted={handleReceiptDataExtracted} />
        <p className={`text-xs ${colors.text.muted} mt-2`}>
          Upload a receipt to automatically fill the form fields below
        </p>
      </div>

      {/* Receipt Upload Button - Mobile */}
      <div className="sm:hidden">
        <button
          type="button"
          className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed ${colors.border.default} rounded-lg ${colors.text.secondary} ${colors.modal.item.hover} transition-colors`}
          onClick={() => {
            // Trigger the hidden ImageUploader
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.click();
          }}
        >
          <span className="mr-2">📄</span>
          <span className="text-base font-medium">Upload Receipt</span>
        </button>
        {/* Hidden ImageUploader for mobile */}
        <div className="hidden">
          <ImageUploader onDataExtracted={handleReceiptDataExtracted} />
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="space-y-4">
        <h3 className={`text-sm ${colors.form.label} flex items-center`}>
          <span className="mr-2">✏️</span>
          Product Information
        </h3>
        
        {/* Product Name */}
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>
            Product Name *
          </label>
          <input
            type="text"
            value={newProduct.item}
            onChange={(e) => handleInputChange("item", e.target.value)}
            className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Product URL */}
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>
            Product URL
          </label>
          <input
            type="url"
            value={newProduct.url || ""}
            onChange={(e) => handleInputChange("url", e.target.value || null)}
            className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
            placeholder="Enter product URL (e.g., Amazon product link)"
          />
        </div>

        {/* Vendor Selection */}
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>
            Vendor *
          </label>
          <select
            value={newProduct.vendorId || DEFAULT_VENDOR_ID}
            onChange={(e) => handleInputChange("vendorId", e.target.value)}
            className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
            required
          >
            <option value="">Select a vendor...</option>
            {activeVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Order Date and Amount Paid in one row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Order Date */}
          <div>
            <label className={`block text-sm ${colors.form.label} mb-2`}>
              Order Date
            </label>
            <input
              type="date"
              value={newProduct.orderDate || ""}
              onChange={(e) =>
                handleInputChange("orderDate", e.target.value || null)
              }
              className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
            />
          </div>

          {/* Amount Paid */}
          <div>
            <label className={`block text-sm ${colors.form.label} mb-2`}>
              Amount Paid ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={newProduct.paid || ""}
              onChange={(e) => handleNumberChange("paid", e.target.value)}
              className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
              placeholder="Enter amount paid"
              required
            />
          </div>
        </div>

        {/* Order Number - Hidden field for search purposes */}
        <div>
          <label className={`block text-sm ${colors.form.label} mb-2`}>
            Order Number
          </label>
          <input
            type="text"
            value={newProduct.orderNumber || ""}
            onChange={(e) => handleInputChange("orderNumber", e.target.value || null)}
            className={`w-full px-4 py-3 ${colors.form.input.base} rounded-lg text-base`}
            placeholder="Enter order number for search purposes"
          />
        </div>
      </div>
    </div>
  );

  const modalFooter = (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className={`flex-1 px-4 py-3 ${colors.button.secondary} rounded-lg font-medium text-base`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-3 ${colors.button.primary} rounded-lg font-medium text-base`}
        >
          Add Product
        </button>
      </div>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Add New Product"
      size="md"
      body={modalBody}
      footer={modalFooter}
    />
  );
};

export default AddProductForm;
