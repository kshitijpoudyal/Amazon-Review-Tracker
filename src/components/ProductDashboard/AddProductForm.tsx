import React, { useState } from "react";
import { Product, DEFAULT_REVIEW_MEDIA_TYPE, ReviewMediaType } from "../../types/Product";
import { typography } from '../../utils/typography';
import { colors } from "../../utils/colors";
import { Modal } from "../common";
import { useVendors } from "../../hooks/useVendors";
import { parseBookmarkletClipboard } from "../../utils/bookmarklet";
import {
  applyBookmarkletPayload,
  formatDateForInput,
  ImportStatus,
} from "./productFormUtils";
import { ProductFormQuickImportSection } from "./ProductFormQuickImportSection";
import { BookmarkletSetupPanel } from "./BookmarkletSetupPanel";
import { ProductFormProductDetailsSection } from "./ProductFormProductDetailsSection";
import { ProductFormFinancialsSection } from "./ProductFormFinancialsSection";

interface AddProductFormProps {
  isOpen: boolean;
  onAdd: (product: Product) => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ isOpen, onAdd, onCancel }) => {
  const { activeVendors, DEFAULT_VENDOR_ID } = useVendors();
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle');
  const [showPasteBox, setShowPasteBox] = useState(false);

  const emptyProduct = (): Product => ({
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
    reviewMediaType: DEFAULT_REVIEW_MEDIA_TYPE,
  });

  const [newProduct, setNewProduct] = useState<Product>(emptyProduct);

  const handleInputChange = (field: keyof Product, value: string | number | boolean | null | ReviewMediaType) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailsChange = (field: keyof Product, value: string | null) => {
    handleInputChange(field, value);
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

  const resetForm = () => {
    setNewProduct(emptyProduct());
    setImportStatus('idle');
    setShowPasteBox(false);
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.item.trim()) {
      onAdd(newProduct);
      resetForm();
    }
  };

  const applyPayload = (data: ReturnType<typeof parseBookmarkletClipboard>) => {
    setNewProduct(prev => applyBookmarkletPayload(prev, data));
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

  const modalHeader = (
    <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-[rgba(196,198,207,0.15)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#022448] to-[#1e3a5f] flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className={`${typography.sectionTitle}`}>Add Product</h2>
      </div>
      <button
        type="button"
        onClick={handleCancel}
        className="w-8 h-8 flex items-center justify-center text-[#74777f] hover:text-[#1b1c19] hover:bg-[#eae8e2] rounded-full transition-colors"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  const modalBody = (
    <form id="add-product-form" onSubmit={handleSubmit}>
      <div className="divide-y divide-[rgba(196,198,207,0.12)]">
        <ProductFormQuickImportSection
          importStatus={importStatus}
          onClipboardImport={handleClipboardImport}
          showPasteBox={showPasteBox}
          onPasteBoxPaste={handlePasteBoxPaste}
          onPasteBoxClose={() => setShowPasteBox(false)}
          showReceiptUpload
          onReceiptDataExtracted={handleReceiptDataExtracted}
          footer={<BookmarkletSetupPanel />}
        />

        <ProductFormProductDetailsSection
          product={newProduct}
          activeVendors={activeVendors}
          defaultVendorId={DEFAULT_VENDOR_ID}
          onChange={handleDetailsChange}
          nameRequired
        />

        <ProductFormFinancialsSection
          product={newProduct}
          mode="add"
          paidRequired
          onPaidChange={(value) => handleInputChange('paid', value === '' ? null : parseFloat(value))}
          onReviewMediaTypeChange={(value: ReviewMediaType) => setNewProduct(prev => ({ ...prev, reviewMediaType: value }))}
        />
      </div>
    </form>
  );

  const modalFooter = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleCancel}
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
      onClose={handleCancel}
      header={modalHeader}
      body={modalBody}
      footer={modalFooter}
      showCloseButton={false}
      size="md"
    />
  );
};

export default AddProductForm;
