import React from 'react';
import {
  getClipboardImportLabel,
  getImportButtonClassName,
  ImportStatus,
} from './productFormUtils';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import { ProductFormReceiptButton } from './ProductFormReceiptButton';

interface ProductFormQuickImportSectionProps {
  importStatus: ImportStatus;
  onClipboardImport: () => void;
  showPasteBox: boolean;
  onPasteBoxPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onPasteBoxClose: () => void;
  showReceiptUpload?: boolean;
  onReceiptDataExtracted?: (data: unknown) => void;
  footer?: React.ReactNode;
}

export const ProductFormQuickImportSection: React.FC<ProductFormQuickImportSectionProps> = ({
  importStatus,
  onClipboardImport,
  showPasteBox,
  onPasteBoxPaste,
  onPasteBoxClose,
  showReceiptUpload = false,
  onReceiptDataExtracted,
  footer,
}) => {
  const clipboardLabel = getClipboardImportLabel(importStatus);

  return (
    <div className="px-6 py-5 space-y-3">
      <ProductFormSectionHeader title="Quick Import" className="mb-3" />

      <div className={`grid gap-3 ${showReceiptUpload ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="space-y-3">
          <button
            type="button"
            onClick={onClipboardImport}
            className={getImportButtonClassName(importStatus)}
          >
            <span className="text-base">{clipboardLabel.icon}</span>
            <span>{clipboardLabel.text}</span>
          </button>

          {showPasteBox && (
            <div className="rounded-xl border border-[rgba(196,198,207,0.4)] bg-[#eae8e2] p-3 space-y-2">
              <p className="text-xs text-[#74777f] font-medium">
                📱 Long-press below and tap <strong>Paste</strong>
              </p>
              <textarea
                autoFocus
                rows={3}
                placeholder="Paste bookmarklet data here…"
                onPaste={onPasteBoxPaste}
                className="w-full text-xs font-mono bg-white border border-[rgba(196,198,207,0.4)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#022448]/30 text-[#1b1c19] placeholder:text-[#c4c6cf]"
              />
              <button
                type="button"
                onClick={onPasteBoxClose}
                className="text-xs text-[#74777f] hover:text-[#1b1c19]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {showReceiptUpload && (
          <ProductFormReceiptButton onDataExtracted={onReceiptDataExtracted} />
        )}
      </div>

      {footer}
    </div>
  );
};

export default ProductFormQuickImportSection;
