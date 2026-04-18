/**
 * Amazon Order Details Bookmarklet
 *
 * When the user visits an Amazon order details page and clicks this bookmarklet,
 * it scrapes the DOM (runs in the authenticated Amazon session, so no CORS issues),
 * builds a JSON payload, and shows an overlay with the data in a textarea.
 *
 * The user long-presses the textarea → Select All → Copy, then goes back to the
 * Review Tracker app → Add Product → Import from Clipboard (paste box).
 *
 * This avoids clipboard.writeText() which requires permissions Android Chrome won't grant.
 *
 * Selectors verified against live Amazon order details HTML (data-component attributes
 * are stable across Amazon page redesigns).
 */

// Raw bookmarklet source (readable form — minified into the exported string below)
// This function is intentionally not called; it documents the bookmarklet logic.
// @ts-expect-error intentional documentation function
function _bookmarkletSource() {
  // --- Order date ---
  const dateEl = document.querySelector('[data-component="orderDate"] span');
  const orderDate = dateEl ? dateEl.textContent!.replace(/[^\w\s,]/g, '').trim() : '';

  // --- Order number: data-component="orderId", fallback to URL param / page text ---
  const orderIdEl = document.querySelector('[data-component="orderId"] span');
  let orderNumber = orderIdEl ? orderIdEl.textContent!.trim() : '';
  if (!orderNumber) {
    const m = location.href.match(/orderID=(\d{3}-\d{7}-\d{7})/);
    if (m) orderNumber = m[1];
  }
  if (!orderNumber) {
    const m = document.body.innerText.match(/\b(\d{3}-\d{7}-\d{7})\b/);
    if (m) orderNumber = m[1];
  }

  // --- Grand total ---
  const totalMatch = document.body.innerText.match(/Grand Total[:\s]+\$?([\d,]+\.\d{2})/i);
  const orderTotal = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null;

  // --- Product title + URL ---
  const titleLink = document.querySelector('[data-component="itemTitle"] a') as HTMLAnchorElement | null;
  const productName = titleLink ? titleLink.textContent!.trim().replace(/\s+/g, ' ') : '';
  let productUrl = '';
  if (titleLink) {
    const m = titleLink.href.match(/\/dp\/([A-Z0-9]{10})/);
    productUrl = m ? `https://www.amazon.com/dp/${m[1]}` : titleLink.href.split('?')[0];
  }

  // --- Product image ---
  const imgEl = document.querySelector('[data-component="itemImage"] img') as HTMLImageElement | null;
  const imageUrl = imgEl ? (imgEl.getAttribute('data-a-hires') || imgEl.src) : '';

  const payload = { orderDate, orderNumber, orderTotal, productName, productUrl, imageUrl };
  const json = JSON.stringify(payload);

  // Show overlay with JSON in a textarea.
  // User long-presses textarea → Select All → Copy on Android (no clipboard API needed).
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;font-family:system-ui,sans-serif;';

  const heading = document.createElement('p');
  heading.style.cssText = 'font-weight:700;font-size:15px;margin:0 0 4px;color:#1b1c19;';
  heading.textContent = 'Order data ready';

  const sub = document.createElement('p');
  sub.style.cssText = 'font-size:12px;color:#74777f;margin:0 0 12px;line-height:1.5;white-space:pre-wrap;';
  sub.textContent = (productName || '(product name not found)') + '\n' + (orderNumber || '') + (orderTotal ? '  ·  $' + orderTotal : '');

  const inst = document.createElement('p');
  inst.style.cssText = 'font-size:13px;color:#022448;font-weight:600;margin:0 0 6px;';
  inst.textContent = 'Long-press below → Select All → Copy';

  const ta = document.createElement('textarea');
  ta.value = json;
  ta.readOnly = true;
  ta.rows = 5;
  ta.style.cssText = 'width:100%;font-size:10px;font-family:monospace;border:2px solid #022448;border-radius:8px;padding:8px;box-sizing:border-box;color:#1b1c19;background:#f5f5f5;resize:none;';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.cssText = 'margin-top:12px;width:100%;padding:10px;border:none;border-radius:8px;background:#eae8e2;font-size:14px;font-weight:600;cursor:pointer;color:#1b1c19;';
  closeBtn.onclick = () => document.body.removeChild(overlay);

  box.appendChild(heading);
  box.appendChild(sub);
  box.appendChild(inst);
  box.appendChild(ta);
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  // Auto-select on desktop for quick Ctrl+C
  ta.focus();
  ta.select();
}

/**
 * Minified bookmarklet — auto-copies JSON to clipboard on desktop (shows brief toast).
 * Falls back to overlay with textarea on mobile (clipboard API not permitted).
 */
export const BOOKMARKLET_HREF = `javascript:(function(){const de=document.querySelector('[data-component="orderDate"] span');const od=de?de.textContent.replace(/[^\\w\\s,]/g,'').trim():'';const oe=document.querySelector('[data-component="orderId"] span');let on=oe?oe.textContent.trim():'';if(!on){const m=location.href.match(/orderID=(\\d{3}-\\d{7}-\\d{7})/);if(m)on=m[1];}if(!on){const m=document.body.innerText.match(/\\b(\\d{3}-\\d{7}-\\d{7})\\b/);if(m)on=m[1];}const tm=document.body.innerText.match(/Grand Total[:\\s]+\\$?([\\d,]+\\.\\d{2})/i);const ot=tm?parseFloat(tm[1].replace(/,/g,'')):null;const tl=document.querySelector('[data-component="itemTitle"] a');const pn=tl?tl.textContent.trim().replace(/\\s+/g,' '):'';let pu='';if(tl){const m=tl.href.match(/\\/dp\\/([A-Z0-9]{10})/);pu=m?'https://www.amazon.com/dp/'+m[1]:tl.href.split('?')[0];}const ie=document.querySelector('[data-component="itemImage"] img');const iu=ie?(ie.getAttribute('data-a-hires')||ie.src):'';const p={orderDate:od,orderNumber:on,orderTotal:ot,productName:pn,productUrl:pu,imageUrl:iu};const j=JSON.stringify(p);function showOv(){const ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';const bx=document.createElement('div');bx.style.cssText='background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;font-family:system-ui,sans-serif;';const h=document.createElement('p');h.style.cssText='font-weight:700;font-size:15px;margin:0 0 4px;color:#1b1c19;';h.textContent='Order data ready';const s=document.createElement('p');s.style.cssText='font-size:12px;color:#74777f;margin:0 0 12px;line-height:1.5;white-space:pre-wrap;';s.textContent=(pn||'(product not found)')+'\\n'+(on||'')+(ot?'  \\u00B7  $'+ot:'');const ins=document.createElement('p');ins.style.cssText='font-size:13px;color:#022448;font-weight:600;margin:0 0 6px;';ins.textContent='Long-press below \\u2192 Select All \\u2192 Copy';const ta=document.createElement('textarea');ta.value=j;ta.readOnly=true;ta.rows=5;ta.style.cssText='width:100%;font-size:10px;font-family:monospace;border:2px solid #022448;border-radius:8px;padding:8px;box-sizing:border-box;color:#1b1c19;background:#f5f5f5;resize:none;';const cb=document.createElement('button');cb.textContent='Close';cb.style.cssText='margin-top:12px;width:100%;padding:10px;border:none;border-radius:8px;background:#eae8e2;font-size:14px;font-weight:600;cursor:pointer;color:#1b1c19;';cb.onclick=function(){document.body.removeChild(ov);};bx.appendChild(h);bx.appendChild(s);bx.appendChild(ins);bx.appendChild(ta);bx.appendChild(cb);ov.appendChild(bx);document.body.appendChild(ov);ta.focus();ta.select();}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(j).then(function(){const bn=document.createElement('div');bn.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#022448;color:#fff;padding:12px 24px;border-radius:12px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);white-space:nowrap;';bn.textContent='\\u2713 Copied!';document.body.appendChild(bn);setTimeout(function(){if(bn.parentNode)bn.parentNode.removeChild(bn);},2000);}).catch(showOv);}else{showOv();}})();`;

/** Schema for the JSON the bookmarklet puts on the clipboard */
export interface BookmarkletPayload {
  orderDate: string;
  orderNumber: string;
  orderTotal: number | null;
  productName: string;
  productUrl: string;
  imageUrl: string;
}

/** Parse clipboard text as a bookmarklet payload; throws if invalid */
export function parseBookmarkletClipboard(text: string): BookmarkletPayload {
  const trimmed = text.trim();

  // Case 1: Full JSON from the desktop bookmarklet
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null) throw new Error('Not an object');
    if (!parsed.orderNumber && !parsed.productName && !parsed.orderDate) {
      throw new Error('Missing required fields');
    }
    return parsed as BookmarkletPayload;
  }

  // Case 2: Amazon order URL pasted directly (e.g. copied from mobile app Share sheet)
  // e.g. https://www.amazon.com/your-orders/order-details?orderID=111-4351533-8979462&ref=...
  const orderIdMatch = trimmed.match(/orderID=(\d{3}-\d{7}-\d{7})/i);
  if (orderIdMatch) {
    return {
      orderDate: '',
      orderNumber: orderIdMatch[1],
      orderTotal: null,
      productName: '',
      productUrl: '',
      imageUrl: '',
    };
  }

  throw new Error('Not a recognised Amazon data format');
}

