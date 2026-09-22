import { typography } from '../../utils/typography';
import React from 'react';
import {
  getClipboardImportLabel,
  getImportButtonClassName,
  ImportStatus,
} from './productFormUtils';
import { ProductFormSectionHeader } from './ProductFormSectionHeader';
import { ProductFormReceiptButton } from './ProductFormReceiptButton';
import { importButtonLabelClass } from './productFormStyles';

interface ProductFormQuickImportSectionProps {
  importStatus: ImportStatus;
  onClipboardImport: () => void;
  showPasteBox: boolean;
  onPasteBoxPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onPasteBoxClose: () => void;
  showReceiptUpload?: boolean;
  onReceiptDataExtracted?: (data: unknown) => void;
  footer?: React.ReactNode;
  /** Compact styling for Edit Product — same behavior, lower visual weight */
  variant?: 'default' | 'compact';
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
  variant = 'default',
}) => {
  const clipboardLabel = getClipboardImportLabel(importStatus);
  const isCompact = variant === 'compact';

  return (
    <div className={`px-6 ${isCompact ? 'py-4 bg-[#eae8e2]/40' : 'py-5'} space-y-3`}>
      <ProductFormSectionHeader
        title="Quick import"
        className={isCompact ? 'mb-2' : 'mb-3'}
      />

      <div className="space-y-3">
        <div className={`grid gap-2 ${showReceiptUpload ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <button
            type="button"
            onClick={onClipboardImport}
            className={getImportButtonClassName(importStatus)}
          >
            <span className="text-base shrink-0">{clipboardLabel.icon}</span>
            <span className={importButtonLabelClass}>{clipboardLabel.text}</span>
          </button>

          {showReceiptUpload && (
            <ProductFormReceiptButton onDataExtracted={onReceiptDataExtracted} />
          )}
        </div>

        {showPasteBox && (
          <div className="rounded-xl border border-[rgba(196,198,207,0.4)] bg-white p-3 space-y-2">
            <p className={`${typography.caption} text-[#74777f]`}>
              Long-press below and tap <strong>Paste</strong>
            </p>
            <textarea
              autoFocus
              rows={3}
              placeholder="Paste bookmarklet data here…"
              onPaste={onPasteBoxPaste}
              className={`w-full ${typography.caption} tabular-nums bg-white border border-[rgba(196,198,207,0.4)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#022448]/20 text-[#1b1c19] placeholder:text-[#c4c6cf]`}
            />
            <button
              type="button"
              onClick={onPasteBoxClose}
              className={`${typography.caption} text-[#74777f] hover:text-[#1b1c19]`}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {!isCompact && footer}
      {isCompact && footer && (
        <div className="opacity-90">{footer}</div>
      )}
    </div>
  );
};

export default ProductFormQuickImportSection;
