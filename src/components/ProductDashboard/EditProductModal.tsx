import React, { useState, useEffect } from 'react';
import { Product } from '../../types/Product';
import { colors } from '../../utils/colors';
import { Modal, ProductThumbnail } from '../common';
import { useVendors } from '../../hooks/useVendors';
import { formatCurrency } from '../../utils/currency';
import { getProductStatus } from '../../utils/productStatus';
import { parseBookmarkletClipboard } from '../../utils/bookmarklet';

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const REVIEW_STEPS: { field: keyof Product; label: string }[] = [
  { field: 'orderPlaced',    label: 'Placed' },
  { field: 'orderDelivered', label: 'Delivered' },
  { field: 'reviewAdded',    label: 'Reviewed' },
  { field: 'reviewLive',     label: 'Live' },
  { field: 'reviewSSSent',   label: 'Screenshot' },
];

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onSave,
  onCancel
}) => {
  const { activeVendors, DEFAULT_VENDOR_ID, getVendorName } = useVendors();
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'url-only' | 'error'>('idle');
  const [showPasteBox, setShowPasteBox] = useState(false);

  useEffect(() => {
    setEditedProduct({ ...product });
  }, [product]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setEditedProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field: 'paid' | 'received', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    const newProduct = { ...editedProduct, [field]: numValue };
    if (newProduct.paid !== null && newProduct.received !== null) {
      newProduct.delta = newProduct.received - newProduct.paid;
    } else if (newProduct.paid !== null && newProduct.received === null) {
      newProduct.delta = -newProduct.paid;
    } else if (newProduct.paid === null && newProduct.received !== null) {
      newProduct.delta = newProduct.received;
    } else {
      newProduct.delta = null;
    }
    setEditedProduct(newProduct);
  };

  // Unchecking a step cascades to uncheck all subsequent steps
  const handleStepToggle = (field: keyof Product, newValue: boolean) => {
    const idx = REVIEW_STEPS.findIndex(s => s.field === field);
    if (!newValue) {
      const updates: Partial<Product> = {};
      for (let i = idx; i < REVIEW_STEPS.length; i++) {
        (updates as any)[REVIEW_STEPS[i].field] = false;
      }
      setEditedProduct(prev => ({ ...prev, ...updates }));
    } else {
      setEditedProduct(prev => ({ ...prev, [field]: true }));
    }
  };

  const formatDateForInput = (dateString: string): string => {
    try {
      const MONTHS: Record<string, string> = {
        january: '01', february: '02', march: '03', april: '04',
        may: '05', june: '06', july: '07', august: '08',
        september: '09', october: '10', november: '11', december: '12',
      };
      const match = dateString.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s*(\d{4})$/);
      if (match) {
        const month = MONTHS[match[1].toLowerCase()];
        if (month) return `${match[3]}-${month}-${match[2].padStart(2, '0')}`;
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const applyPayload = (data: ReturnType<typeof parseBookmarkletClipboard>) => {
    setEditedProduct(prev => ({
      ...prev,
      item: data.productName || prev.item,
      url: data.productUrl || prev.url,
      imageUrl: data.imageUrl || prev.imageUrl,
      orderNumber: data.orderNumber || prev.orderNumber,
      paid: data.orderTotal ?? prev.paid,
      orderDate: data.orderDate ? formatDateForInput(data.orderDate) : prev.orderDate,
    }));
    const isUrlOnly = !data.productName && !data.orderDate && !!data.orderNumber;
    setImportStatus(isUrlOnly ? 'url-only' : 'success');
    setShowPasteBox(false);
    setTimeout(() => setImportStatus('idle'), 4000);
  };

  const handleClipboardImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = parseBookmarkletClipboard(text);
      applyPayload(data);
    } catch {
      setShowPasteBox(true);
      setImportStatus('idle');
    }
  };

  const handlePasteBoxPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    try {
      const data = parseBookmarkletClipboard(text);
      applyPayload(data);
    } catch {
      setImportStatus('error');
      setShowPasteBox(false);
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleSave = () => onSave(editedProduct);

  const status = getProductStatus(editedProduct);
  const vendorName = getVendorName(editedProduct.vendorId);
  const allStepsDone = REVIEW_STEPS.every(s => !!editedProduct[s.field]);

  // ── Custom Header ──────────────────────────────────────────────
  const modalHeader = (
    <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[rgba(196,198,207,0.15)]">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <ProductThumbnail
          imageUrl={editedProduct.imageUrl}
          productName={editedProduct.item}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-[#1b1c19] line-clamp-2 leading-snug">
            {editedProduct.item || 'Untitled Product'}
          </h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-label font-semibold uppercase tracking-wider ${colors.status[status.type].bg} ${colors.status[status.type].text}`}>
              {status.label}
            </span>
            {vendorName && (
              <span className="text-[11px] text-[#74777f]">{vendorName}</span>
            )}
          </div>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#74777f] hover:text-[#1b1c19] hover:bg-[#eae8e2] rounded-full transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  // ── Body ───────────────────────────────────────────────────────
  const modalBody = (
    <div className="divide-y divide-[rgba(196,198,207,0.12)]">

      {/* ── Quick Import ──────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-3">
        <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
          Quick Import
        </p>
        <button
          type="button"
          onClick={handleClipboardImport}
          className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
            importStatus === 'success'  ? 'bg-[#006a68]/10 text-[#006a68]'
            : importStatus === 'url-only' ? 'bg-amber-50 text-amber-700'
            : importStatus === 'error'    ? 'bg-[#ffdad6] text-[#ba1a1a]'
            : `${colors.background.secondary} ${colors.text.secondary} hover:bg-[#e4e2dd]`
          }`}
        >
          <span className="text-base">
            {importStatus === 'success' ? '✅' : importStatus === 'url-only' ? '🔢' : importStatus === 'error' ? '⚠️' : '📋'}
          </span>
          <span>
            {importStatus === 'success'   ? 'All fields filled!'
            : importStatus === 'url-only' ? 'Order # filled — add other fields manually'
            : importStatus === 'error'    ? 'Nothing found — copy an Amazon or Wayfair order first'
            : 'Import from Clipboard'}
          </span>
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
              onPaste={handlePasteBoxPaste}
              className="w-full text-xs font-mono bg-white border border-[rgba(196,198,207,0.4)] rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#022448]/30 text-[#1b1c19] placeholder:text-[#c4c6cf]"
            />
            <button
              type="button"
              onClick={() => setShowPasteBox(false)}
              className="text-xs text-[#74777f] hover:text-[#1b1c19]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Void banner */}
      {editedProduct.isVoid && (
        <div className="mx-5 mt-5 flex items-center gap-3 px-4 py-3 bg-[#9e9e9e]/10 border border-[#9e9e9e]/30 rounded-xl">
          <svg className="w-4 h-4 text-[#74777f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <p className="text-sm text-[#43474e]">
            This product is <strong>Void</strong>. Use the ⋮ menu in the table to un-void it.
          </p>
        </div>
      )}

      {/* ── Review Journey ──────────────────────────────────────── */}
      {!editedProduct.isVoid && (
        <div className="px-6 py-5">
          <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f] mb-4">
            Review Journey
          </p>
          <div className="flex items-start">
            {REVIEW_STEPS.map((step, i) => {
              const done = !!editedProduct[step.field];
              const nextDone = i < REVIEW_STEPS.length - 1 && !!editedProduct[REVIEW_STEPS[i + 1].field];
              return (
                <React.Fragment key={step.field}>
                  <button
                    type="button"
                    onClick={() => handleStepToggle(step.field, !done)}
                    className="flex flex-col items-center flex-1 gap-1.5 focus:outline-none group"
                    title={done ? `Unmark ${step.label}` : `Mark as ${step.label}`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-150 ${
                      done
                        ? 'bg-[#006a68] border-[#006a68] text-white group-hover:bg-[#005856]'
                        : 'bg-white border-[#c4c6cf] text-[#74777f] group-hover:border-[#006a68] group-hover:text-[#006a68]'
                    }`}>
                      {done ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-[10px] font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-label uppercase tracking-wider text-center leading-tight transition-colors ${
                      done ? 'text-[#006a68] font-semibold' : 'text-[#74777f]'
                    }`}>
                      {step.label}
                    </span>
                  </button>
                  {i < REVIEW_STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 mt-[18px] transition-colors duration-300 ${
                      done && nextDone ? 'bg-[#006a68]' : 'bg-[#e4e2dd]'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {allStepsDone && (
            <p className="text-xs text-[#006a68] font-medium mt-3 text-center">
              🎉 All steps complete!
            </p>
          )}
        </div>
      )}

      {/* ── Product Details ─────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-4">
        <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
          Product Details
        </p>

        <div>
          <label className={`block ${colors.form.label} mb-1.5`}>Name</label>
          <textarea
            value={editedProduct.item}
            onChange={(e) => handleInputChange('item', e.target.value)}
            className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl resize-none text-sm`}
            rows={2}
            placeholder="Product name"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Order Date</label>
            <input
              type="date"
              value={editedProduct.orderDate || ''}
              onChange={(e) => handleInputChange('orderDate', e.target.value || null)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
            />
          </div>
          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Order Number</label>
            <input
              type="text"
              value={editedProduct.orderNumber || ''}
              onChange={(e) => handleInputChange('orderNumber', e.target.value || undefined)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="AMZ-..."
            />
          </div>
        </div>

        <div>
          <label className={`block ${colors.form.label} mb-1.5`}>Vendor</label>
          <select
            value={editedProduct.vendorId || DEFAULT_VENDOR_ID}
            onChange={(e) => handleInputChange('vendorId', e.target.value)}
            className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
          >
            <option value="">Select a vendor...</option>
            {activeVendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block ${colors.form.label} mb-1.5`}>Product URL</label>
          <input
            type="url"
            value={editedProduct.url || ''}
            onChange={(e) => handleInputChange('url', e.target.value || null)}
            className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
            placeholder="https://amazon.com/..."
          />
        </div>

        <div>
          <label className={`block ${colors.form.label} mb-1.5`}>Image URL</label>
          <input
            type="url"
            value={editedProduct.imageUrl || ''}
            onChange={(e) => handleInputChange('imageUrl', e.target.value || null)}
            className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* ── Financials ──────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-4">
        <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
          Financials
        </p>

        {/* Live summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#ffdad6]/40 rounded-xl p-3 text-center">
            <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Paid</p>
            <p className="text-lg font-bold text-[#ba1a1a]">{formatCurrency(editedProduct.paid)}</p>
          </div>
          <div className="bg-[#006a68]/10 rounded-xl p-3 text-center">
            <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Received</p>
            <p className="text-lg font-bold text-[#006a68]">{formatCurrency(editedProduct.received)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${
            editedProduct.delta === null
              ? 'bg-[#eae8e2]'
              : editedProduct.delta >= 0
                ? 'bg-[#006a68]/10'
                : 'bg-[#ba1a1a]/10'
          }`}>
            <p className="text-[9px] font-label uppercase tracking-widest text-[#74777f] mb-1">Delta</p>
            <p className={`text-lg font-bold ${
              editedProduct.delta === null
                ? 'text-[#74777f]'
                : editedProduct.delta >= 0
                  ? 'text-[#006a68]'
                  : 'text-[#ba1a1a]'
            }`}>
              {editedProduct.delta !== null ? formatCurrency(editedProduct.delta) : '—'}
            </p>
          </div>
        </div>

        {/* Editable inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Amount Paid ($)</label>
            <input
              type="number"
              step="0.01"
              value={editedProduct.paid ?? ''}
              onChange={(e) => handleNumberChange('paid', e.target.value)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Amount Received ($)</label>
            <input
              type="number"
              step="0.01"
              value={editedProduct.received ?? ''}
              onChange={(e) => handleNumberChange('received', e.target.value)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="0.00"
            />
          </div>
        </div>

        {editedProduct.delta !== null && (
          <button
            type="button"
            onClick={() => setEditedProduct(prev => ({ ...prev, delta: null, received: null }))}
            className="text-xs text-[#74777f] hover:text-[#1b1c19] underline transition-colors"
          >
            Reset delta to null
          </button>
        )}
      </div>
    </div>
  );

  // ── Footer ─────────────────────────────────────────────────────
  const modalFooter = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onCancel}
        className={`flex-1 px-4 py-3 ${colors.button.secondary} rounded-full font-medium text-sm`}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className={`flex-1 px-4 py-3 ${colors.button.primary} rounded-full font-medium text-sm`}
      >
        Update Product
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      header={modalHeader}
      body={modalBody}
      footer={modalFooter}
      showCloseButton={false}
      size="md"
    />
  );
};

export default EditProductModal;

