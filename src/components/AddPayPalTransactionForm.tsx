import React, { useState } from 'react';
import { PayPalTransaction } from '../types/PayPalTransaction';

interface AddPayPalTransactionFormProps {
  onAddTransaction: (transaction: PayPalTransaction) => Promise<boolean>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddPayPalTransactionForm: React.FC<AddPayPalTransactionFormProps> = ({
  onAddTransaction,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    time: new Date().toTimeString().split(' ')[0], // Current time in HH:MM:SS format
    timeZone: 'PST', // Default timezone
    name: '',
    type: 'General Payment',
    currency: 'USD',
    amount: '',
    fees: '',
    total: '',
    exchangeRate: '',
    receiptId: '',
    transactionId: '',
    itemTitle: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Auto-calculate total when amount or fees change
    if (name === 'amount' || name === 'fees') {
      const amount = parseFloat(name === 'amount' ? value : formData.amount) || 0;
      const fees = parseFloat(name === 'fees' ? value : formData.fees) || 0;
      const total = amount + fees;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        total: total.toFixed(2)
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.transactionId.trim()) newErrors.transactionId = 'Transaction ID is required';
    if (!formData.amount.trim()) newErrors.amount = 'Amount is required';

    // Numeric validations
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      newErrors.amount = 'Amount must be a valid number';
    }
    if (formData.fees && isNaN(parseFloat(formData.fees))) {
      newErrors.fees = 'Fees must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Skip "User Initiated Withdrawal" transactions
    if (formData.type === 'User Initiated Withdrawal') {
      alert('User Initiated Withdrawal transactions are not allowed. Please select a different transaction type.');
      return;
    }

    // Convert form data to PayPalTransaction
    const transaction: PayPalTransaction = {
      date: formData.date,
      time: formData.time,
      timeZone: formData.timeZone,
      name: formData.name.trim(),
      type: formData.type,
      currency: formData.currency,
      amount: parseFloat(formData.amount),
      fees: parseFloat(formData.fees) || 0,
      total: parseFloat(formData.total) || parseFloat(formData.amount),
      transactionId: formData.transactionId.trim()
    };

    // Add optional fields only if they have values
    if (formData.exchangeRate.trim()) {
      transaction.exchangeRate = formData.exchangeRate.trim();
    }
    if (formData.receiptId.trim()) {
      transaction.receiptId = formData.receiptId.trim();
    }
    if (formData.itemTitle.trim()) {
      transaction.itemTitle = formData.itemTitle.trim();
    }

    const success = await onAddTransaction(transaction);
    if (success) {
      onCancel(); // Close the form on success
    }
  };

  const transactionTypes = [
    'General Payment',
    'Express Checkout Payment',
    'Website Payment',
    'Mobile Payment',
    'Mass Pay Payment',
    'User Initiated Withdrawal',
    'Payment Review Hold',
    'Instant Payment Review (IPR) reversal',
    'Payment Review Release'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add PayPal Transaction</h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <input
                  type="text"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleInputChange}
                  placeholder="PST, EST, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Payer/Recipient name"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  {transactionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  placeholder="USD"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading}
                />
                {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
              </div>

              {/* Fees */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fees
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="fees"
                  value={formData.fees}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fees ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.fees && <p className="text-red-600 text-sm mt-1">{errors.fees}</p>}
              </div>

              {/* Total (auto-calculated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total (Auto-calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="total"
                  value={formData.total}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Transaction ID */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction ID *
                </label>
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="Unique PayPal transaction ID"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.transactionId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                  disabled={isLoading}
                />
                {errors.transactionId && <p className="text-red-600 text-sm mt-1">{errors.transactionId}</p>}
              </div>

              {/* Optional Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exchange Rate
                </label>
                <input
                  type="text"
                  name="exchangeRate"
                  value={formData.exchangeRate}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt ID
                </label>
                <input
                  type="text"
                  name="receiptId"
                  value={formData.receiptId}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              {/* Item Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title
                </label>
                <input
                  type="text"
                  name="itemTitle"
                  value={formData.itemTitle}
                  onChange={handleInputChange}
                  placeholder="Description of the transaction"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
