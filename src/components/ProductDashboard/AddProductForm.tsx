import React, { useState } from "react";
import { Product } from "../../types/Product";
import { ImageUploader } from "./ImageUploader";
import { colors } from "../../utils/colors";
import { Modal } from "../common";
import { useVendors } from "../../hooks/useVendors";
import { BOOKMARKLET_HREF, parseBookmarkletClipboard } from "../../utils/bookmarklet";

interface AddProductFormProps {
  isOpen: boolean;
  onAdd: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onAdd, onCancel }) => {
  const { activeVendors, DEFAULT_VENDOR_ID } = useVendors();
  const [showBookmarklet, setShowBookmarklet] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'url-only' | 'error'>('idle');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const [newProduct, setNewProduct] = useState<Product>({
    item: "",
    url: "",
    imageUrl: "",
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
    vendorId: DEFAULT_VENDOR_ID,
  });

  const handleInputChange = (field: keyof Product, value: string | number | boolean | null) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleReceiptDataExtracted = (extractedData: any) => {
    if (extractedData?.orderData) {
      const orderData = extractedData.orderData;
      setNewProduct(prev => ({
        ...prev,
        item: orderData.items?.length > 0 ? orderData.items[0].name : prev.item,
        orderDate: orderData.orderDate ? formatDateForInput(orderData.orderDate) : prev.orderDate,
        orderNumber: orderData.orderNumber || prev.orderNumber,
        paid: orderData.orderTotal || prev.paid,
      }));
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

  const handleNumberChange = (field: "paid" | "received", value: string) => {
    handleInputChange(field, value === "" ? null : parseFloat(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.item.trim()) onAdd(newProduct);
  };

  const applyPayload = (data: ReturnType<typeof parseBookmarkletClipboard>) => {
    setNewProduct(prev => ({
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
      // clipboard.readText() fails on Android (requires permission the web can't get).
      // Show a paste box — onPaste gets data from the event directly, no permission needed.
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

  // ── Custom Header ──────────────────────────────────────────────
  const modalHeader = (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[rgba(196,198,207,0.15)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#022448] to-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">New Entry</p>
          <h2 className="text-base font-bold text-[#1b1c19]">Add Product</h2>
        </div>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="w-8 h-8 flex items-center justify-center text-[#74777f] hover:text-[#1b1c19] hover:bg-[#eae8e2] rounded-full transition-colors"
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
    <form id="add-product-form" onSubmit={handleSubmit}>
      <div className="divide-y divide-[rgba(196,198,207,0.12)]">

        {/* ── Quick Import ──────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-3">
          <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
            Quick Import
          </p>

          {/* Clipboard import */}
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
              : importStatus === 'error'    ? 'Nothing found — copy an Amazon order URL first'
              : 'Import from Clipboard'}
            </span>
          </button>

          {/* Paste box fallback for Android (clipboard.readText not permitted) */}
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

          {/* Receipt upload — desktop */}
          <div className="hidden sm:block">
            <div className="rounded-xl overflow-hidden border border-[rgba(196,198,207,0.2)] bg-[#eae8e2]">
              <div className="px-4 pt-3 pb-1">
                <p className={`text-[10px] font-label uppercase tracking-widest text-[#74777f]`}>Upload Receipt</p>
              </div>
              <div className="px-4 pb-3">
                <ImageUploader onDataExtracted={handleReceiptDataExtracted} />
              </div>
            </div>
          </div>

          {/* Receipt upload — mobile */}
          <div className="sm:hidden">
            <button
              type="button"
              className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 border border-dashed border-[rgba(196,198,207,0.4)] rounded-xl ${colors.text.secondary} hover:bg-[#eae8e2] transition-colors text-sm font-medium`}
              onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            >
              <span>📄</span>
              <span>Upload Receipt</span>
            </button>
            <div className="hidden">
              <ImageUploader onDataExtracted={handleReceiptDataExtracted} />
            </div>
          </div>

          {/* Bookmarklet setup toggle — desktop only */}
          <div className="hidden sm:block">
            <button
              type="button"
              onClick={() => setShowBookmarklet(v => !v)}
              className={`flex items-center gap-1.5 text-xs ${colors.text.muted} hover:${colors.text.secondary} transition-colors`}
            >
              <svg className={`w-3 h-3 transition-transform ${showBookmarklet ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
              Browser shortcut setup
            </button>

            {showBookmarklet && (
              <div className={`mt-3 text-xs ${colors.text.muted} space-y-3 pl-4 border-l-2 border-[rgba(196,198,207,0.3)]`}>
                <div>
                  <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>🖥️ Desktop — drag to bookmarks bar</p>
                  <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                    <li>Show bookmarks bar (Ctrl/⌘+Shift+B)</li>
                    <li>Drag the button below to your bookmarks bar</li>
                    <li>On any Amazon order page, click it → data copies automatically → come back and click Import</li>
                  </ol>
                  <a
                    href={BOOKMARKLET_HREF}
                    draggable
                    onClick={e => e.preventDefault()}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-lg border ${colors.border.default} ${colors.text.secondary} text-xs font-medium cursor-grab active:cursor-grabbing select-none`}
                  >
                    📦 Copy Amazon Order
                  </a>
                </div>

                <div className={`border-t ${colors.border.default} pt-2`}>
                  <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>📱 Android & iPhone — one-time setup</p>
                  <ol className="list-decimal list-inside space-y-1 leading-relaxed mb-2">
                    <li>Bookmark any page in your browser</li>
                    <li>Open Bookmarks → long-press it → Edit</li>
                    <li>Clear the URL field → paste the code below → Save</li>
                  </ol>
                  <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>Each time you add a product:</p>
                  <ol className="list-decimal list-inside space-y-1 leading-relaxed mb-2">
                    <li>Amazon app → open order → Share → Open in Chrome / Safari</li>
                    <li>Tap your bookmark → <strong>overlay appears</strong></li>
                    <li>Long-press the text box → Select All → Copy</li>
                    <li>Come back here → tap Import → paste in the box that appears</li>
                  </ol>
                  <p className={`mb-1 text-xs ${colors.text.secondary}`}>Long-press → Select All → Copy this code for the bookmark:</p>
                  <textarea
                    readOnly
                    value={BOOKMARKLET_HREF}
                    rows={3}
                    onFocus={e => e.target.select()}
                    className={`w-full px-2 py-2 text-xs font-mono rounded-lg border ${colors.border.default} bg-white ${colors.text.muted} resize-none`}
                  />
                </div>

                <div className={`border-t ${colors.border.default} pt-2`}>
                  <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>🔗 Any phone — order # only</p>
                  <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                    <li>Amazon app → open order → Share → Copy Link</li>
                    <li>Come back here → Import from Clipboard</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Product Details ──────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
            Product Details
          </p>

          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>
              Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={newProduct.item}
              onChange={(e) => handleInputChange("item", e.target.value)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="Product name"
              required
            />
          </div>

          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Product URL</label>
            <input
              type="url"
              value={newProduct.url || ""}
              onChange={(e) => handleInputChange("url", e.target.value || null)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="https://amazon.com/..."
            />
          </div>

          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>Image URL</label>
            <input
              type="url"
              value={newProduct.imageUrl || ""}
              onChange={(e) => handleInputChange("imageUrl", e.target.value || null)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* ── Order Info ───────────────────────────────────────── */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
            Order Info
          </p>

          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>
              Vendor <span className="text-[#ba1a1a]">*</span>
            </label>
            <select
              value={newProduct.vendorId || DEFAULT_VENDOR_ID}
              onChange={(e) => handleInputChange("vendorId", e.target.value)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              required
            >
              <option value="">Select a vendor...</option>
              {activeVendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${colors.form.label} mb-1.5`}>Order Date</label>
              <input
                type="date"
                value={newProduct.orderDate || ""}
                onChange={(e) => handleInputChange("orderDate", e.target.value || null)}
                className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              />
            </div>
            <div>
              <label className={`block ${colors.form.label} mb-1.5`}>Order Number</label>
              <input
                type="text"
                value={newProduct.orderNumber || ""}
                onChange={(e) => handleInputChange("orderNumber", e.target.value || null)}
                className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
                placeholder="AMZ-..."
              />
            </div>
          </div>

          <div>
            <label className={`block ${colors.form.label} mb-1.5`}>
              Amount Paid ($) <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={newProduct.paid || ""}
              onChange={(e) => handleNumberChange("paid", e.target.value)}
              className={`w-full px-3 py-2.5 ${colors.form.input.base} rounded-xl text-sm`}
              placeholder="0.00"
              required
            />
          </div>
        </div>

      </div>
    </form>
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
        type="submit"
        form="add-product-form"
        className={`flex-1 px-4 py-3 ${colors.button.primary} rounded-full font-medium text-sm`}
      >
        Add Product
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

export default AddProductForm;
