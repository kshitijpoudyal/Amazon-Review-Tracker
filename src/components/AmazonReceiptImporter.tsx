import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { useProductCrudFirebase } from '../hooks/useProductCrudFirebase';
import { Product } from '../types/Product';

interface AmazonReceiptImporterProps {
  onProductsAdded?: (count: number) => void;
  className?: string;
}

export const AmazonReceiptImporter: React.FC<AmazonReceiptImporterProps> = ({
  onProductsAdded,
  className = ''
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    items: string[];
  } | null>(null);

  const { addProduct } = useProductCrudFirebase();

  const handleReceiptDataExtracted = async (extractedData: any) => {
    if (!extractedData.orderData || !extractedData.orderData.items) {
      console.log('No Amazon order items found in the image');
      return;
    }

    setIsImporting(true);
    setImportResults(null);

    try {
      const { orderData } = extractedData;
      const results = {
        success: 0,
        failed: 0,
        items: [] as string[]
      };

      console.log('Importing products from Amazon receipt:', orderData);

      // Process each item from the receipt
      for (const item of orderData.items) {
        try {
          // Create product object with data from receipt
          const newProduct: Product = {
            item: item.name,
            orderDate: orderData.orderDate || null, // Use extracted order date
            orderPlaced: true, // Since we have a receipt, order was placed
            orderDelivered: false, // Assume not delivered yet
            reviewAdded: false,
            reviewLive: false,
            reviewSSSent: false,
            paid: item.price || null, // Use price from receipt
            received: null, // No refund received yet
            delta: null, // Will be calculated when received amount is added
            isVoid: false
          };

          const success = await addProduct(newProduct);
          
          if (success) {
            results.success++;
            results.items.push(item.name);
            console.log(`✅ Successfully added: ${item.name}`);
          } else {
            results.failed++;
            console.log(`❌ Failed to add: ${item.name}`);
          }
        } catch (error) {
          console.error(`Error adding product ${item.name}:`, error);
          results.failed++;
        }
      }

      setImportResults(results);
      onProductsAdded?.(results.success);

      console.log('Import completed:', results);
    } catch (error) {
      console.error('Error importing receipt data:', error);
      setImportResults({
        success: 0,
        failed: 1,
        items: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📱 Import from Amazon Receipt
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          Upload a photo of your Amazon order receipt to automatically add products to your dashboard. 
          The system will extract order information including item names, prices, and order date.
        </p>
        
        {isImporting && (
          <div className="bg-white border border-blue-300 rounded p-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-700">Importing products to dashboard...</span>
            </div>
          </div>
        )}

        {importResults && (
          <div className="bg-white border border-blue-300 rounded p-3 mb-3">
            <h4 className="font-medium text-blue-800 mb-2">Import Results:</h4>
            <div className="text-sm space-y-1">
              <p className="text-green-600">✅ Successfully imported: {importResults.success} products</p>
              {importResults.failed > 0 && (
                <p className="text-red-600">❌ Failed to import: {importResults.failed} products</p>
              )}
              {importResults.items.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium text-gray-700">Imported items:</p>
                  <ul className="list-disc list-inside text-gray-600 ml-2">
                    {importResults.items.map((item, index) => (
                      <li key={index} className="truncate" title={item}>
                        {item.length > 50 ? `${item.substring(0, 50)}...` : item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ImageUploader 
        onDataExtracted={handleReceiptDataExtracted}
        className="bg-white border border-gray-200 rounded-lg p-4"
      />

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-2">📋 What gets imported:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• <strong>Product Name:</strong> From receipt item description</li>
          <li>• <strong>Order Date:</strong> From receipt order date</li>
          <li>• <strong>Order Placed:</strong> Set to TRUE (since receipt exists)</li>
          <li>• <strong>Amount Paid:</strong> From receipt item price</li>
          <li>• <strong>Delta:</strong> Initially negative (shows cost)</li>
          <li>• <strong>Other fields:</strong> Set to default values for manual update</li>
        </ul>
      </div>
    </div>
  );
};
