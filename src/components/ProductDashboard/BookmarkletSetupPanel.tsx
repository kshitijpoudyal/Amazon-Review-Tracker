import React, { useState } from 'react';
import { typography } from '../../utils/typography';
import { colors } from '../../utils/colors';
import {
  BOOKMARKLET_HREF,
  WAYFAIR_BOOKMARKLET_HREF,
  WALMART_BOOKMARKLET_HREF,
} from '../../utils/bookmarklet';

export const BookmarkletSetupPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarkletCopied, setBookmarkletCopied] = useState(false);
  const [wayfairBookmarkletCopied, setWayfairBookmarkletCopied] = useState(false);
  const [walmartBookmarkletCopied, setWalmartBookmarkletCopied] = useState(false);

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={`flex items-center gap-1.5 text-xs ${colors.text.muted} hover:${colors.text.secondary} transition-colors`}
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
        Browser shortcut setup
      </button>

      {expanded && (
        <div className={`mt-3 text-xs ${colors.text.muted} space-y-3 pl-4 border-l-2 border-[rgba(196,198,207,0.3)]`}>
          <div className="hidden sm:block">
            <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>🖥️ Desktop — drag to bookmarks bar</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed">
              <li>Show bookmarks bar (Ctrl/⌘+Shift+B)</li>
              <li>Drag a button below to your bookmarks bar</li>
              <li>On the matching order page, click it → data copies → come back and click Import</li>
              <li className="text-[#74777f]">Wayfair: open <strong>View/Edit Details</strong> for the item first</li>
              <li className="text-[#74777f]">Walmart: open <strong>Purchase history → Order details</strong></li>
            </ol>
            <div className="flex flex-wrap gap-2 mt-2">
              <a
                href={BOOKMARKLET_HREF}
                draggable
                onClick={e => e.preventDefault()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${colors.border.default} ${colors.text.secondary} text-xs font-medium cursor-grab active:cursor-grabbing select-none`}
              >
                📦 Copy Amazon Order
              </a>
              <a
                href={WAYFAIR_BOOKMARKLET_HREF}
                draggable
                onClick={e => e.preventDefault()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7b189f]/30 text-[#7b189f] text-xs font-medium cursor-grab active:cursor-grabbing select-none"
              >
                🛋️ Copy Wayfair Order
              </a>
              <a
                href={WALMART_BOOKMARKLET_HREF}
                draggable
                onClick={e => e.preventDefault()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0071dc]/30 text-[#0071dc] text-xs font-medium cursor-grab active:cursor-grabbing select-none"
              >
                🛒 Copy Walmart Order
              </a>
            </div>
          </div>

          <div className={`sm:border-t sm:${colors.border.default} sm:pt-2`}>
            <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>📱 Android & iPhone — one-time setup</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed mb-2">
              <li>Bookmark any page in your browser (create one per retailer)</li>
              <li>Open Bookmarks → long-press it → Edit</li>
              <li>Clear the URL field → paste the code below → Save</li>
            </ol>
            <p className={`font-semibold text-xs ${colors.text.secondary} mb-1`}>Each time you add a product:</p>
            <ol className="list-decimal list-inside space-y-1 leading-relaxed mb-2">
              <li>Walmart: Purchase history → order details → tap bookmark</li>
              <li>Wayfair: My Orders → tap <strong>View Details</strong> → tap bookmark</li>
              <li>Amazon: open order → tap bookmark</li>
              <li>Long-press the text box → Select All → Copy</li>
              <li>Come back here → tap Import → paste in the box that appears</li>
            </ol>

            {[
              { label: 'Amazon bookmark URL:', href: BOOKMARKLET_HREF, copied: bookmarkletCopied, setCopied: setBookmarkletCopied, border: colors.border.default },
              { label: 'Wayfair bookmark URL:', href: WAYFAIR_BOOKMARKLET_HREF, copied: wayfairBookmarkletCopied, setCopied: setWayfairBookmarkletCopied, border: 'border-[#7b189f]/30' },
              { label: 'Walmart bookmark URL:', href: WALMART_BOOKMARKLET_HREF, copied: walmartBookmarkletCopied, setCopied: setWalmartBookmarkletCopied, border: 'border-[#0071dc]/30' },
            ].map(({ label, href, copied, setCopied, border }) => (
              <div key={label} className="relative mb-3 last:mb-0">
                <p className={`mb-1 text-xs ${colors.text.secondary}`}>{label}</p>
                <textarea
                  readOnly
                  value={href}
                  rows={3}
                  onFocus={e => e.target.select()}
                  className={`w-full px-2 py-2 pr-16 ${typography.caption} tabular-nums rounded-lg border ${border} bg-white ${colors.text.muted} resize-none`}
                />
                <button
                  type="button"
                  onClick={() => copyText(href, setCopied)}
                  className={`absolute top-7 right-2 px-2 py-1 rounded ${typography.captionStrong} transition-colors ${
                    copied
                      ? 'bg-[#006a68]/10 text-[#006a68]'
                      : `${colors.background.secondary} ${colors.text.secondary} hover:bg-[#e4e2dd]`
                  }`}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkletSetupPanel;
