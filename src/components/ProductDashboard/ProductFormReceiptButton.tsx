import React, { useRef, useState } from 'react';
import { useImageDataExtractor } from '../../hooks/useImageDataExtractor';
import { getImportButtonClassName, ImportStatus } from './productFormUtils';

interface ProductFormReceiptButtonProps {
  onDataExtracted?: (data: unknown) => void;
}

export const ProductFormReceiptButton: React.FC<ProductFormReceiptButtonProps> = ({
  onDataExtracted,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { extractDataFromImage, isLoading, error } = useImageDataExtractor();
  const [status, setStatus] = useState<ImportStatus>('idle');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith('image/')) return;

    setStatus('idle');
    try {
      const result = await extractDataFromImage(file, 'amazon-order');
      onDataExtracted?.(result);
      setStatus(result?.orderData ? 'success' : 'error');
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const displayStatus: ImportStatus = error ? 'error' : isLoading ? 'idle' : status;
  const label =
    isLoading ? { icon: '⏳', text: 'Processing receipt…' }
    : displayStatus === 'success' ? { icon: '✅', text: 'Receipt imported!' }
    : displayStatus === 'error' ? { icon: '⚠️', text: 'Could not read receipt' }
    : { icon: '📄', text: 'Upload Receipt' };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={getImportButtonClassName(displayStatus)}
      >
        <span className="text-base">{label.icon}</span>
        <span>{label.text}</span>
      </button>
    </>
  );
};

export default ProductFormReceiptButton;
