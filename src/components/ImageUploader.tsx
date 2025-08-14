import React, { useState, useRef } from 'react';
import { useImageDataExtractor } from '../hooks/useImageDataExtractor';

interface ImageUploaderProps {
  onDataExtracted?: (data: any) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onDataExtracted, 
  className = '' 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { extractDataFromImage, isLoading, error, debugInfo } = useImageDataExtractor();

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const result = await extractDataFromImage(file, 'amazon-order');
        setExtractedData(result);
        onDataExtracted?.(result);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Mobile Button Layout */}
        <div className="block md:hidden">
          {isLoading ? (
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center bg-gray-50">
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 font-medium">Processing image...</p>
                <p className="text-sm text-gray-500">Please wait while we extract the data</p>
              </div>
            </div>
          ) : (
            <button
              onClick={handleButtonClick}
              className="w-full border-2 border-blue-300 border-dashed rounded-lg p-6 text-center bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-blue-700 mb-1">📸 Upload Receipt Image</p>
                  <p className="text-sm text-blue-600">Tap to select Amazon receipt photo</p>
                </div>
                <div className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Desktop Drag & Drop Layout */}
        <div
          className={`hidden md:block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Processing image...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-gray-600">
                <p className="text-lg">Drop an image here, or</p>
                <button
                  onClick={handleButtonClick}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  click to select a file
                </button>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Results Display */}
      {extractedData && !error && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Extracted Data</h3>
          {/* Structured Data */}
          {extractedData.orderData && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Order Information:</h4>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Order Number:</strong> {extractedData.orderData.orderNumber || 'Not found'}</p>
                    <p><strong>Order Date:</strong> {extractedData.orderData.orderDate || 'Not found'}</p>
                    <p><strong>Total:</strong> ${extractedData.orderData.orderTotal || 'Not found'}</p>
                  </div>
                  <div>
                    <p><strong>Shipping Address:</strong></p>
                    <div className="ml-2 text-sm">
                      <p>{extractedData.orderData.shippingAddress.name}</p>
                      <p>{extractedData.orderData.shippingAddress.street}</p>
                      <p>{extractedData.orderData.shippingAddress.cityStateZip}</p>
                    </div>
                  </div>
                </div>
                
                {extractedData.orderData.items.length > 0 && (
                  <div className="mt-3">
                    <p><strong>Items:</strong></p>
                    <ul className="ml-2 text-sm">
                      {extractedData.orderData.items.map((item: any, index: number) => (
                        <li key={index}>
                          {item.quantity}x {item.name} - ${item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {!extractedData.orderData && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">No Amazon Order Data Found</h4>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700 text-sm">
                  The uploaded image doesn't appear to be an Amazon order receipt, or the text couldn't be extracted properly. 
                  Please make sure you're uploading a clear image of an Amazon order receipt.
                </p>
              </div>
            </div>
          )}

          {/* Debug Information */}
          {extractedData && (
            <div className="mt-4">
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
              
              {showDebug && debugInfo && (
                <div className="mt-2">
                  <h4 className="font-medium text-gray-700 mb-2">Raw OCR Text:</h4>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">{debugInfo}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
