import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, StatusFilter } from '../../types/Product';
import { getProductStatusType } from '../../utils/productStatus';
import { formatCurrency } from '../../utils/currency';

const OVERVIEW_EXPANDED_KEY = 'art_overview_expanded';

interface NextActionsStripProps {
  products: Product[];
  activeStatusFilter: StatusFilter;
  onStatusFilter: (filter: StatusFilter) => void;
  unlinkedPayPalCount: number;
  unlinkedPayPalAmount: number;
}

interface OverviewItem {
  key: string;
  label: string;
  detail: string;
  count: number;
  onClick: () => void;
  active?: boolean;
}

function readExpandedPreference(): boolean {
  try {
    return localStorage.getItem(OVERVIEW_EXPANDED_KEY) === 'true';
  } catch {
    return false;
  }
}

export const NextActionsStrip: React.FC<NextActionsStripProps> = ({
  products,
  activeStatusFilter,
  onStatusFilter,
  unlinkedPayPalCount,
  unlinkedPayPalAmount,
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(readExpandedPreference);

  const counts = useMemo(() => {
    let refundPending = 0;
    let sendScreenshot = 0;
    for (const p of products) {
      if (p.isVoid) continue;
      const status = getProductStatusType(p);
      if (status === 'refund-pending') refundPending++;
      if (status === 'send-screenshot') sendScreenshot++;
    }
    return { refundPending, sendScreenshot };
  }, [products]);

  const items: OverviewItem[] = [
    {
      key: 'refund-pending',
      label: 'Waiting for refund',
      detail: `${counts.refundPending} product${counts.refundPending !== 1 ? 's' : ''}`,
      count: counts.refundPending,
      onClick: () => onStatusFilter(activeStatusFilter === 'refund-pending' ? '' : 'refund-pending'),
      active: activeStatusFilter === 'refund-pending',
    },
    {
      key: 'paypal',
      label: 'Unlinked PayPal',
      detail:
        unlinkedPayPalCount > 0
          ? `${unlinkedPayPalCount} transaction${unlinkedPayPalCount !== 1 ? 's' : ''} · ${formatCurrency(unlinkedPayPalAmount)}`
          : '0 transactions',
      count: unlinkedPayPalCount,
      onClick: () => navigate('/paypal'),
    },
    {
      key: 'send-screenshot',
      label: 'Need screenshot',
      detail: `${counts.sendScreenshot} product${counts.sendScreenshot !== 1 ? 's' : ''}`,
      count: counts.sendScreenshot,
      onClick: () => onStatusFilter(activeStatusFilter === 'send-screenshot' ? '' : 'send-screenshot'),
      active: activeStatusFilter === 'send-screenshot',
    },
  ].filter((item) => item.count > 0);

  if (items.length === 0) {
    return null;
  }

  const collapsedSummary = items
    .map((item) => {
      if (item.key === 'paypal' && unlinkedPayPalCount > 0) {
        return `${unlinkedPayPalCount} unlinked PayPal`;
      }
      if (item.key === 'refund-pending') {
        return `${counts.refundPending} waiting for refund`;
      }
      if (item.key === 'send-screenshot') {
        return `${counts.sendScreenshot} need screenshot`;
      }
      return item.label;
    })
    .join(' · ');

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(OVERVIEW_EXPANDED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="px-4 sm:px-6 md:px-6 lg:px-8 mb-3">
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(2,36,72,0.07)] overflow-hidden">
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={expanded}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#fbf9f3]/80 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f]">
              Overview
            </p>
            {!expanded && (
              <p className="text-sm text-[#43474e] mt-0.5 truncate">{collapsedSummary}</p>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-[#74777f] flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <div className="border-t border-[rgba(196,198,207,0.2)] divide-y divide-[rgba(196,198,207,0.15)]">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                  item.active
                    ? 'bg-[#006a68]/8 hover:bg-[#006a68]/12'
                    : 'hover:bg-[#fbf9f3]'
                }`}
              >
                <div className="min-w-0">
                  <p className={`text-sm font-medium ${item.active ? 'text-[#006a68]' : 'text-[#1b1c19]'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-[#74777f] mt-0.5 truncate">{item.detail}</p>
                </div>
                <svg
                  className={`w-4 h-4 flex-shrink-0 ${item.active ? 'text-[#006a68]' : 'text-[#74777f]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NextActionsStrip;
