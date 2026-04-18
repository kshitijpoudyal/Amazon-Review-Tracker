import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product } from '../types/Product';
import { PayPalTransaction } from '../types/PayPalTransaction';
import { Modal, ProductThumbnail } from './common';
import { getProductStatus, isVoid, isRefundPending } from '../utils/productStatus';
import { formatCurrency } from '../utils/currency';

interface ProductLinkModalProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelect: (productIds: string[]) => void;
  linkedProductIds?: string[];
  transaction?: PayPalTransaction;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductLinkModal: React.FC<ProductLinkModalProps> = ({
  products,
  selectedProductIds,
  onProductSelect,
  linkedProductIds = [],
  transaction,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(selectedProductIds);
  const [hideLinked, setHideLinked] = useState(true);
  const [hideVoid, setHideVoid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempSelectedIds(selectedProductIds);
  }, [selectedProductIds]);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  const closeModal = () => {
    setSearchTerm('');
    setTempSelectedIds(selectedProductIds);
    onClose();
  };

  const handleToggle = (productId: string) => {
    setTempSelectedIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onProductSelect(tempSelectedIds);
    closeModal();
  };

  const sortPriority = (product: Product): number => {
    if (isVoid(product)) return 3;
    if (isRefundPending(product)) return 0;
    const status = getProductStatus(product);
    return status.type === 'complete' ? 2 : 1;
  };

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return products
      .filter(p => {
        if (hideLinked && (linkedProductIds.includes(p.id || '') || getProductStatus(p).type === 'complete')) return false;
        if (hideVoid && isVoid(p)) return false;
        if (!q) return true;
        return [p.item?.toLowerCase(), p.paid?.toString(), p.orderNumber?.toLowerCase()]
          .some(f => f?.includes(q));
      })
      .sort((a, b) => sortPriority(a) - sortPriority(b));
  }, [products, searchTerm, linkedProductIds, hideLinked, hideVoid]);

  const linkedCount = products.filter(p => linkedProductIds.includes(p.id || '') || getProductStatus(p).type === 'complete').length;
  const voidCount = products.filter(p => isVoid(p)).length;

  // Sum of selected products' received amounts (for match indicator)
  const selectedProducts = products.filter(p => p.id && tempSelectedIds.includes(p.id));
  const totalSelectedReceived = selectedProducts.reduce((sum, p) => sum + (p.received ?? 0), 0);
  const totalSelectedPaid = selectedProducts.reduce((sum, p) => sum + (p.paid ?? 0), 0);
  const matchDiff = transaction ? totalSelectedReceived - transaction.total : null;
  const isMatched = matchDiff !== null && Math.abs(matchDiff) < 0.01;

  const formatDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ── Product Row ──────────────────────────────────────────────────────────
  const ProductRow = ({ product }: { product: Product }) => {
    const id = product.id || '';
    const isSelected = tempSelectedIds.includes(id);
    const isAlreadyLinked = linkedProductIds.includes(id);
    const status = getProductStatus(product);

    return (
      <li
        onClick={() => id && handleToggle(id)}
        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all rounded-2xl mx-2 my-1 ${
          isSelected ? 'bg-[#006a68]/10 ring-1 ring-[#006a68]/30' : 'hover:bg-[#fbf9f3]'
        }`}
      >
        {/* Checkbox */}
        <div className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
          isSelected ? 'bg-[#006a68] border-[#006a68]' : 'border-[#c4c6cf]'
        }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Thumbnail */}
        <ProductThumbnail imageUrl={product.imageUrl} productName={product.item} size="sm" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-snug line-clamp-1 ${
              isSelected ? 'text-[#022448]' : 'text-[#1b1c19]'
            }`}>
              {product.item}
            </p>
            <span className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-label uppercase tracking-wider ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Date + already-linked badge */}
          <div className="flex items-center gap-2 mt-0.5 text-xs text-[#74777f]">
            {product.orderDate && <span>{formatDate(product.orderDate)}</span>}
            {isAlreadyLinked && (
              <span className="inline-flex items-center gap-1 text-[#006a68] font-medium">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l-1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                linked
              </span>
            )}
          </div>

          {/* Paid / Received / Delta */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-label uppercase tracking-widest text-[#74777f]">Paid</span>
              <span className="text-xs font-semibold text-[#ba1a1a]">
                {product.paid != null ? formatCurrency(product.paid) : '—'}
              </span>
            </div>
            <div className="w-px h-3 bg-[#c4c6cf]" />
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-label uppercase tracking-widest text-[#74777f]">Received</span>
              <span className="text-xs font-semibold text-[#006a68]">
                {product.received != null ? formatCurrency(product.received) : '—'}
              </span>
            </div>
            {product.delta != null && (
              <>
                <div className="w-px h-3 bg-[#c4c6cf]" />
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-label uppercase tracking-widest text-[#74777f]">Δ</span>
                  <span className={`text-xs font-semibold ${product.delta >= 0 ? 'text-[#006a68]' : 'text-[#ba1a1a]'}`}>
                    {formatCurrency(product.delta)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </li>
    );
  };

  // ── Modal pieces ─────────────────────────────────────────────────────────
  const header = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#1b1c19]">Link Products</h3>
      </div>

      {/* Transaction context card */}
      {transaction && (
        <div className="bg-[#006a68]/8 border border-[#006a68]/20 rounded-2xl px-4 py-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-label uppercase tracking-widest text-[#006a68] mb-0.5">PayPal Transaction</p>
              <p className="text-sm font-semibold text-[#1b1c19] truncate">{transaction.name}</p>
              {transaction.itemTitle && (
                <p className="text-xs text-[#74777f] truncate mt-0.5">{transaction.itemTitle}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-[#006a68]">{formatCurrency(transaction.total)}</p>
              <p className="text-[10px] text-[#74777f]">{transaction.date}</p>
            </div>
          </div>
          {/* Gross / fees breakdown */}
          {transaction.fees !== 0 && (
            <div className="flex items-center gap-3 text-[10px] text-[#74777f] border-t border-[#006a68]/10 pt-2">
              <span>Gross <span className="font-semibold text-[#43474e]">{formatCurrency(transaction.amount)}</span></span>
              <span>Fees <span className="font-semibold text-[#ba1a1a]">−{formatCurrency(Math.abs(transaction.fees))}</span></span>
              <span>Net <span className="font-semibold text-[#006a68]">{formatCurrency(transaction.total)}</span></span>
            </div>
          )}
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#74777f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by name, amount, or order #…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-[#fbf9f3] rounded-full text-sm text-[#1b1c19] placeholder-[#74777f] focus:outline-none focus:ring-2 focus:ring-[#006a68]/40 transition-all"
          autoComplete="off"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#74777f] hover:text-[#1b1c19]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter toggles */}
      <div className="flex flex-wrap gap-2">
        {linkedCount > 0 && (
          <button
            onClick={() => setHideLinked(v => !v)}
            className={`text-xs font-label uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
              hideLinked ? 'bg-[#022448] text-white' : 'bg-[#eae8e2] text-[#43474e] hover:bg-[#e4e2dd]'
            }`}
          >
            {hideLinked ? '✓ Hiding' : 'Hide'} Complete & Linked
          </button>
        )}
        {voidCount > 0 && (
          <button
            onClick={() => setHideVoid(v => !v)}
            className={`text-xs font-label uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
              hideVoid ? 'bg-[#022448] text-white' : 'bg-[#eae8e2] text-[#43474e] hover:bg-[#e4e2dd]'
            }`}
          >
            {hideVoid ? '✓ Hiding' : 'Hide'} Void
          </button>
        )}
      </div>
    </div>
  );

  const body = (
    <div>
      {/* Selected summary bar */}
      {tempSelectedIds.length > 0 && (
        <div className="px-4 py-2.5 bg-[#006a68]/10 border-b border-[#006a68]/10 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#006a68]">
              {tempSelectedIds.length} product{tempSelectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setTempSelectedIds([])}
              className="text-xs text-[#006a68] underline underline-offset-2 hover:text-[#022448]"
            >
              Clear all
            </button>
          </div>

          {/* Financial summary + match indicator */}
          <div className="flex items-center gap-3 text-xs text-[#43474e] flex-wrap">
            <span>Paid <span className="font-semibold text-[#ba1a1a]">{formatCurrency(totalSelectedPaid)}</span></span>
            <span className="text-[#c4c6cf]">·</span>
            <span>Received <span className="font-semibold text-[#006a68]">{formatCurrency(totalSelectedReceived)}</span></span>
            {transaction && matchDiff !== null && (
              <>
                <span className="text-[#c4c6cf]">·</span>
                {isMatched ? (
                  <span className="inline-flex items-center gap-1 text-[#006a68] font-semibold">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    Matches transaction
                  </span>
                ) : (
                  <span className={`font-semibold ${matchDiff > 0 ? 'text-[#006a68]' : 'text-[#ba1a1a]'}`}>
                    {matchDiff > 0 ? '+' : ''}{formatCurrency(matchDiff)} vs transaction
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Product list */}
      <div className="max-h-[50vh] overflow-y-auto py-2">
        {filteredProducts.length > 0 ? (
          <ul className="space-y-0.5">
            {filteredProducts.map(product => (
              <ProductRow key={product.id} product={product} />
            ))}
          </ul>
        ) : searchTerm ? (
          <div className="text-center py-14">
            <svg className="mx-auto mb-3 w-10 h-10 text-[#c4c6cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[#74777f] text-sm mb-3">No products match "<strong>{searchTerm}</strong>"</p>
            <button onClick={() => setSearchTerm('')} className="text-xs px-4 py-2 rounded-full bg-[#eae8e2] text-[#43474e] hover:bg-[#e4e2dd] transition-colors">
              Clear search
            </button>
          </div>
        ) : (
          <div className="text-center py-14">
            <svg className="mx-auto mb-3 w-10 h-10 text-[#c4c6cf]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-[#74777f] text-sm">No products available to link.</p>
          </div>
        )}
      </div>
    </div>
  );

  const footer = (
    <form onSubmit={handleSave} className="flex gap-3">
      <button
        type="button"
        onClick={closeModal}
        className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-full border border-[rgba(196,198,207,0.4)] text-[#43474e] bg-[#fbf9f3] hover:bg-[#e4e2dd] transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={tempSelectedIds.length === 0}
        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white shadow-[0_4px_12px_rgba(2,36,72,0.15)] hover:shadow-[0_6px_16px_rgba(2,36,72,0.22)] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l-1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        {tempSelectedIds.length > 0
          ? `Link ${tempSelectedIds.length} Product${tempSelectedIds.length !== 1 ? 's' : ''}`
          : 'Link Products'}
      </button>
    </form>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      header={header}
      body={body}
      footer={footer}
      size="md"
    />
  );
};

export default ProductLinkModal;

