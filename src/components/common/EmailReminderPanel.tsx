import React, { useState } from 'react';
import { useProductCrudFirebase } from '../../hooks/useProductCrudFirebase';
import { colors } from '../../utils/colors';

export const EmailReminderPanel: React.FC = () => {
  const { checkReturnWindowReminders, productsNeedingReminders } = useProductCrudFirebase();
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<{ sent: number; failed: number } | null>(null);

  const handleCheckReminders = async () => {
    setIsChecking(true);
    try {
      const result = await checkReturnWindowReminders();
      setLastResult(result);
    } catch (error) {
      console.error('Error checking reminders:', error);
      setLastResult({ sent: 0, failed: 1 });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Return Window Reminders</h3>
      
      <div className="space-y-3">
        {/* Status Display */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Products needing reminders:</span>
          <span className={`font-medium ${
            productsNeedingReminders.length > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {productsNeedingReminders.length}
          </span>
        </div>

        {/* Products List */}
        {productsNeedingReminders.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <h4 className="text-sm font-medium text-orange-800 mb-2">
              Products approaching return deadline:
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              {productsNeedingReminders.slice(0, 3).map((product, index) => (
                <li key={index} className="truncate">
                  • {product.item}
                </li>
              ))}
              {productsNeedingReminders.length > 3 && (
                <li className="text-orange-600">
                  ... and {productsNeedingReminders.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Manual Check Button */}
        <button
          onClick={handleCheckReminders}
          disabled={isChecking}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            isChecking
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : `${colors.button.primary} text-white hover:bg-indigo-600`
          }`}
        >
          {isChecking ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : (
            'Check & Send Reminders'
          )}
        </button>

        {/* Results Display */}
        {lastResult && (
          <div className={`p-3 rounded-md text-sm ${
            lastResult.failed === 0 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {lastResult.sent > 0 && (
              <div>✅ {lastResult.sent} reminder email(s) sent successfully</div>
            )}
            {lastResult.failed > 0 && (
              <div>❌ {lastResult.failed} email(s) failed to send</div>
            )}
            {lastResult.sent === 0 && lastResult.failed === 0 && (
              <div>ℹ️ No reminders needed at this time</div>
            )}
          </div>
        )}

        {/* Info Text */}
        <p className="text-xs text-gray-500">
          📅 Automatic reminders are sent daily at 9 AM EST. 
          Use this button to manually check and send immediate reminders.
        </p>
      </div>
    </div>
  );
};