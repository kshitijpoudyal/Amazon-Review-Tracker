import React, { useState } from 'react';
import { vendorService } from '../firebase/vendorService';
import { backfillProductsWithVendor } from '../utils/migrations/productVendorMigration';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../utils/colors';

/**
 * Admin utility component for managing vendor setup and migrations
 * This component provides tools to initialize vendors and migrate existing products
 */
export const VendorAdminUtils: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const showMessage = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleRunFullSetup = async () => {
    if (!user?.uid) {
      showMessage('Please log in to run the setup.', 'error');
      return;
    }

    try {
      setLoading(true);
      showMessage('Initializing vendors...', 'info');
      await vendorService.initializeVendors(user.uid);
      
      showMessage('Backfilling products with vendors...', 'info');
      await backfillProductsWithVendor(user.uid);
      
      showMessage('Vendor setup completed successfully!', 'success');
    } catch (error) {
      console.error('Error during full setup:', error);
      showMessage('Setup failed. Check console for details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMessageClasses = () => {
    const baseClasses = 'p-4 rounded-lg mb-4';
    switch (messageType) {
      case 'success':
        return `${baseClasses} bg-green-50 text-green-800 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-50 text-red-800 border border-red-200`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-50 text-blue-800 border border-blue-200`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Vendor Setup & Migration Tools</h2>
      
      {message && (
        <div className={getMessageClasses()}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">What these tools do:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li><strong>Run Full Setup:</strong> Initializes default vendors and backfills vendor info on existing products</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={handleRunFullSetup}
            disabled={loading || !user}
            className={`${colors.button.indigo} px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : 'Run Full Setup (Recommended)'}
          </button>
        </div>

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg">
            Please log in to use the migration tools.
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <strong>Note:</strong> These tools are safe to run multiple times. 
          They will not duplicate vendors or overwrite existing vendor assignments.
        </div>
      </div>
    </div>
  );
};