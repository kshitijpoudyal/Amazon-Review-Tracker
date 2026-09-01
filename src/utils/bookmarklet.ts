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

/**
 * Wayfair Order Details Bookmarklet
 *
 * On My Orders list pages with multiple orders, open "View/Edit Details" for
 * the item first — the bookmarklet scopes extraction to that drawer and matches
 * the corresponding order card for date/order number.
 */
// @ts-expect-error intentional documentation function
function _wayfairBookmarkletSource() {
  const SKIP = /Wayfair Rewards|Protection Plan|Professional Assembly|Allstate|Gift Card/i;

  function findDrawerRoot(): Element | null {
    for (const dialog of document.querySelectorAll('[role="dialog"], [aria-modal="true"]')) {
      const text = dialog.textContent || '';
      if (/view\s*\/?\s*edit\s*details|your item/i.test(text)) return dialog;
    }
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span')) {
      const t = (el.textContent || '').trim();
      if (t.length > 40 || !/view\s*\/?\s*edit\s*details/i.test(t)) continue;
      let node: Element | null = el;
      for (let d = 0; d < 12 && node; d++) {
        const st = window.getComputedStyle(node);
        const r = node.getBoundingClientRect();
        if (
          r.width > 250 &&
          r.height > 300 &&
          (st.position === 'fixed' || st.position === 'absolute') &&
          r.left > window.innerWidth * 0.3
        ) {
          return node;
        }
        node = node.parentElement;
      }
    }
    return null;
  }

  function findOrderCards(): Element[] {
    const cards: Element[] = [];
    const seen = new Set<Element>();
    for (const el of document.querySelectorAll('*')) {
      const t = el.textContent || '';
      if (el.childElementCount > 4 || !/Wayfair Order #\d+/.test(t) || t.length > 120) continue;
      let card: Element | null = el;
      for (let u = 0; u < 12 && card; u++) {
        const ct = card.textContent || '';
        if (/Ordered On:/i.test(ct) && ct.length > 80 && ct.length < 12000) {
          if (!seen.has(card)) {
            seen.add(card);
            cards.push(card);
          }
          break;
        }
        card = card.parentElement;
      }
    }
    return cards;
  }

  function findOrderCardForProduct(productHint: string): Element | null {
    const cards = findOrderCards();
    if (!productHint) return cards[0] || null;
    const hint = productHint.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 30);
    for (const card of cards) {
      if ((card.textContent || '').toLowerCase().includes(hint)) return card;
    }
    return cards[0] || null;
  }

  function extractProductFromScope(scope: Element | Document) {
    let productName = '';
    let productUrl = '';
    let imageUrl = '';
    let orderTotal: number | null = null;

    const blocks: Element[] = [];
    const seen = new Set<Element>();
    scope.querySelectorAll('img').forEach((img) => {
      let el: Element | null = img.parentElement;
      for (let d = 0; d < 8 && el; d++) {
        const t = el.textContent || '';
        if (/Quantity\s*:/i.test(t) && t.length > 30 && t.length < 4000) {
          if (!seen.has(el)) {
            seen.add(el);
            blocks.push(el);
          }
          break;
        }
        el = el.parentElement;
      }
    });

    for (const block of blocks) {
      const blockText = block.textContent || '';
      if (SKIP.test(blockText)) continue;

      const lines = blockText.split('\n').map((l) => l.trim()).filter(Boolean);
      const skipLine =
        /^(Delivered|Ordered|Wayfair|Total|Quantity|Upholstery|Add |Missing|Return |Report |Track |Edit |View |By |Download|Your Item|Your Shipment|Delivery)/i;

      for (const line of lines) {
        if (line.length > 15 && !skipLine.test(line) && !/^\d+$/.test(line) && line.split(' ').length >= 3) {
          productName = line.replace(/\s+/g, ' ');
          break;
        }
      }

      block.querySelectorAll('a[href]').forEach((a) => {
        if (productUrl) return;
        const href = (a as HTMLAnchorElement).href || '';
        if (
          href.includes('wayfair.com') &&
          (href.includes('/pdp/') || href.includes('~') || /view details/i.test(a.textContent || ''))
        ) {
          productUrl = href.split('?')[0];
          if (!productName && (a.textContent || '').trim().length > 15) {
            productName = (a.textContent || '').trim().replace(/\s+/g, ' ');
          }
        }
      });

      const img = block.querySelector('img[src]') as HTMLImageElement | null;
      if (img) imageUrl = img.src || '';

      for (const line of lines) {
        if (/Assembly|Protection|Add Professional|Allstate/i.test(line)) continue;
        const priceMatch = line.match(/\$\s?([\d,]+\.\d{2})/);
        if (priceMatch) {
          orderTotal = parseFloat(priceMatch[1].replace(/,/g, ''));
          break;
        }
      }
      break;
    }

    if (!productName) {
      scope.querySelectorAll('a[href*="/pdp/"], a[href*="~"]').forEach((lk) => {
        if (productName) return;
        let par: Element | null = lk.parentElement;
        for (let u = 0; u < 6 && par; u++) {
          if (SKIP.test(par.textContent || '')) {
            par = null;
            break;
          }
          par = par.parentElement;
        }
        if (par === null) return;
        productName = (lk.textContent || '').trim().replace(/\s+/g, ' ');
        productUrl = (lk as HTMLAnchorElement).href.split('?')[0];
      });
    }

    return { productName, productUrl, imageUrl, orderTotal };
  }

  function extractTotalPrice(scope: Element | Document | null): number | null {
    if (!scope) return null;
    const text = scope === document ? document.body.innerText : (scope as HTMLElement).innerText;

    const directMatch = text.match(/Total Price[:\s]*\$?\s*([\d,]+\.\d{2})/i);
    if (directMatch) return parseFloat(directMatch[1].replace(/,/g, ''));

    if (scope !== document && 'querySelectorAll' in scope) {
      for (const el of scope.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span')) {
        const heading = (el.textContent || '').trim();
        if (!/^your order$/i.test(heading)) continue;
        let section: Element | null = el.parentElement;
        for (let u = 0; u < 6 && section; u++) {
          const sectionMatch = (section.textContent || '').match(/Total Price[:\s]*\$?\s*([\d,]+\.\d{2})/i);
          if (sectionMatch) return parseFloat(sectionMatch[1].replace(/,/g, ''));
          section = section.parentElement;
        }
      }
    }
    return null;
  }

  function extractOrderMeta(scope: Element | Document) {
    const text = scope === document ? document.body.innerText : (scope as HTMLElement).innerText;
    const dateMatch = text.match(/Ordered On:\s*([A-Za-z]+\s+\d{1,2},?\s*\d{4})/i);
    const orderNumMatch = text.match(/Wayfair Order #(\d+)/i);
    let orderNumber = orderNumMatch ? orderNumMatch[1] : '';
    if (!orderNumber) {
      const urlMatch = location.href.match(/order(?:Id|ID|Number)[=/](\d{8,})/i);
      if (urlMatch) orderNumber = urlMatch[1];
    }
    if (!orderNumber) {
      const pathMatch = location.href.match(/\/(\d{10,})(?:[/?#]|$)/);
      if (pathMatch) orderNumber = pathMatch[1];
    }
    return {
      orderDate: dateMatch ? dateMatch[1].trim() : '',
      orderNumber,
      orderTotal: extractTotalPrice(scope),
    };
  }

  const drawer = findDrawerRoot();
  const orderCount = (document.body.innerText.match(/Wayfair Order #/g) || []).length;

  if (!drawer && orderCount > 1) {
    void 'Open View/Edit Details first, then run bookmarklet';
    return;
  }

  const productScope = drawer || document;
  const { productName, productUrl, imageUrl, orderTotal: itemPrice } = extractProductFromScope(productScope);

  const orderCard = drawer
    ? findOrderCardForProduct(productName)
    : orderCount === 1
      ? findOrderCards()[0]
      : null;
  const orderMeta = extractOrderMeta(orderCard || productScope);

  let orderTotal = itemPrice;
  if (orderTotal == null) {
    orderTotal =
      extractTotalPrice(drawer) ??
      extractTotalPrice(orderCard) ??
      orderMeta.orderTotal;
  }

  const payload = {
    retailer: 'wayfair',
    orderDate: orderMeta.orderDate,
    orderNumber: orderMeta.orderNumber,
    orderTotal,
    productName,
    productUrl,
    imageUrl,
  };
  void payload;
}

/** Readable Wayfair bookmarklet body — minified into WAYFAIR_BOOKMARKLET_HREF at build time in source */
const WAYFAIR_BOOKMARKLET_BODY = `(function(){
var SKIP=/Wayfair Rewards|Protection Plan|Professional Assembly|Allstate|Gift Card/i;
function findDrawerRoot(){
  var dialogs=document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
  for(var i=0;i<dialogs.length;i++){
    var dt=dialogs[i].innerText||'';
    if(/view\\s*\\/?\\s*edit\\s*details|your item/i.test(dt))return dialogs[i];
  }
  var nodes=document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span');
  for(var j=0;j<nodes.length;j++){
    var t=(nodes[j].textContent||'').trim();
    if(t.length>40||!/view\\s*\\/?\\s*edit\\s*details/i.test(t))continue;
    var node=nodes[j];
    for(var d=0;d<12&&node;d++){
      var st=window.getComputedStyle(node);
      var r=node.getBoundingClientRect();
      if(r.width>250&&r.height>300&&(st.position==='fixed'||st.position==='absolute')&&r.left>window.innerWidth*0.3)return node;
      node=node.parentElement;
    }
  }
  return null;
}
function findOrderCards(){
  var cards=[],seen=new Set();
  document.querySelectorAll('*').forEach(function(el){
    var t=el.innerText||'';
    if(el.childElementCount>4||!/Wayfair Order #\\d+/.test(t)||t.length>120)return;
    var card=el;
    for(var u=0;u<12&&card;u++){
      var ct=card.innerText||'';
      if(/Ordered On:/i.test(ct)&&ct.length>80&&ct.length<12000){
        if(!seen.has(card)){seen.add(card);cards.push(card);}
        break;
      }
      card=card.parentElement;
    }
  });
  return cards;
}
function findOrderCardForProduct(hint){
  var cards=findOrderCards();
  if(!hint)return cards[0]||null;
  var h=hint.toLowerCase().replace(/\\s+/g,' ').trim().slice(0,30);
  for(var i=0;i<cards.length;i++){
    if((cards[i].innerText||'').toLowerCase().indexOf(h)>=0)return cards[i];
  }
  return cards[0]||null;
}
function extractProduct(scope){
  var productName='',productUrl='',imageUrl='',orderTotal=null;
  var blocks=[],seen=new Set();
  scope.querySelectorAll('img').forEach(function(img){
    var el=img.parentElement;
    for(var d=0;d<8&&el;d++){
      var tx=el.innerText||'';
      if(/Quantity\\s*:/i.test(tx)&&tx.length>30&&tx.length<4000){
        if(!seen.has(el)){seen.add(el);blocks.push(el);}
        break;
      }
      el=el.parentElement;
    }
  });
  for(var i=0;i<blocks.length;i++){
    var block=blocks[i],bt=block.innerText||'';
    if(SKIP.test(bt))continue;
    var lines=bt.split('\\n').map(function(l){return l.trim();}).filter(Boolean);
    var skipLine=/^(Delivered|Ordered|Wayfair|Total|Quantity|Upholstery|Add |Missing|Return |Report |Track |Edit |View |By |Download|Your Item|Your Shipment|Delivery)/i;
    for(var j=0;j<lines.length;j++){
      var line=lines[j];
      if(line.length>15&&!skipLine.test(line)&&!/^\\d+$/.test(line)&&line.split(' ').length>=3){productName=line.replace(/\\s+/g,' ');break;}
    }
    var links=block.querySelectorAll('a[href]');
    for(var k=0;k<links.length;k++){
      var a=links[k],href=a.href||'';
      if(href.indexOf('wayfair.com')>-1&&(href.indexOf('/pdp/')>-1||href.indexOf('~')>-1||/view details/i.test(a.textContent))){
        productUrl=href.split('?')[0];
        if(!productName&&a.textContent.trim().length>15)productName=a.textContent.trim().replace(/\\s+/g,' ');
        break;
      }
    }
    var im=block.querySelector('img[src]');
    if(im)imageUrl=im.src||'';
    for(var p=0;p<lines.length;p++){
      var pl=lines[p];
      if(/Assembly|Protection|Add Professional|Allstate/i.test(pl))continue;
      var pm=pl.match(/\\$\\s?([\\d,]+\\.\\d{2})/);
      if(pm){orderTotal=parseFloat(pm[1].replace(/,/g,''));break;}
    }
    break;
  }
  if(!productName){
    scope.querySelectorAll('a[href*="/pdp/"], a[href*="~"]').forEach(function(lk){
      if(productName)return;
      var par=lk.parentElement;
      for(var u=0;u<6&&par;u++){if(SKIP.test(par.innerText||'')){par=null;break;}par=par.parentElement;}
      if(par===null)return;
      productName=lk.textContent.trim().replace(/\\s+/g,' ');
      productUrl=lk.href.split('?')[0];
    });
  }
  return {productName:productName,productUrl:productUrl,imageUrl:imageUrl,orderTotal:orderTotal};
}
function extractTotalPrice(scope){
  if(!scope)return null;
  var text=scope===document?document.body.innerText:scope.innerText;
  var dm=text.match(/Total Price[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i);
  if(dm)return parseFloat(dm[1].replace(/,/g,''));
  if(scope!==document&&scope.querySelectorAll){
    var headers=scope.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span');
    for(var i=0;i<headers.length;i++){
      var heading=(headers[i].textContent||'').trim();
      if(!/^your order$/i.test(heading))continue;
      var section=headers[i].parentElement;
      for(var u=0;u<6&&section;u++){
        var sm=(section.innerText||'').match(/Total Price[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i);
        if(sm)return parseFloat(sm[1].replace(/,/g,''));
        section=section.parentElement;
      }
    }
  }
  return null;
}
function extractOrderMeta(scope){
  var text=scope===document?document.body.innerText:scope.innerText;
  var dm=text.match(/Ordered On:\\s*([A-Za-z]+\\s+\\d{1,2},?\\s*\\d{4})/i);
  var onm=text.match(/Wayfair Order #(\\d+)/i);
  var orderNumber=onm?onm[1]:'';
  if(!orderNumber){var um=location.href.match(/order(?:Id|ID|Number)[=\\/](\\d{8,})/i);if(um)orderNumber=um[1];}
  if(!orderNumber){var om=location.href.match(/\\/(\\d{10,})(?:[\\/?#]|$)/);if(om)orderNumber=om[1];}
  return {orderDate:dm?dm[1].trim():'',orderNumber:orderNumber,orderTotal:extractTotalPrice(scope)};
}
function showError(msg){
  var bn=document.createElement('div');
  bn.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#ba1a1a;color:#fff;padding:12px 20px;border-radius:12px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;z-index:9999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);max-width:90vw;text-align:center;line-height:1.4;';
  bn.textContent=msg;
  document.body.appendChild(bn);
  setTimeout(function(){if(bn.parentNode)bn.parentNode.removeChild(bn);},4500);
}
var drawer=findDrawerRoot();
var orderCount=(document.body.innerText.match(/Wayfair Order #/g)||[]).length;
if(!drawer&&orderCount>1){showError('Open View/Edit Details for the item first, then click the bookmark');return;}
var productScope=drawer||document;
var prod=extractProduct(productScope);
var orderCard=drawer?findOrderCardForProduct(prod.productName):(orderCount===1?findOrderCards()[0]:null);
var meta=extractOrderMeta(orderCard||productScope);
var orderTotal=prod.orderTotal;
if(orderTotal==null){orderTotal=extractTotalPrice(drawer)||extractTotalPrice(orderCard)||meta.orderTotal;}
var p={retailer:'wayfair',orderDate:meta.orderDate,orderNumber:meta.orderNumber,orderTotal:orderTotal,productName:prod.productName,productUrl:prod.productUrl,imageUrl:prod.imageUrl};
var j=JSON.stringify(p),pn=prod.productName,on=meta.orderNumber,ot=orderTotal;
function showOv(){var ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';var bx=document.createElement('div');bx.style.cssText='background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;font-family:system-ui,sans-serif;';var h=document.createElement('p');h.style.cssText='font-weight:700;font-size:15px;margin:0 0 4px;color:#1b1c19;';h.textContent='Order data ready';var s=document.createElement('p');s.style.cssText='font-size:12px;color:#74777f;margin:0 0 12px;line-height:1.5;white-space:pre-wrap;';s.textContent=(pn||'(product not found)')+'\\n'+(on||'')+(ot?'  \\u00B7  $'+ot:'');var ins=document.createElement('p');ins.style.cssText='font-size:13px;color:#7b189f;font-weight:600;margin:0 0 6px;';ins.textContent='Long-press below \\u2192 Select All \\u2192 Copy';var ta=document.createElement('textarea');ta.value=j;ta.readOnly=true;ta.rows=5;ta.style.cssText='width:100%;font-size:10px;font-family:monospace;border:2px solid #7b189f;border-radius:8px;padding:8px;box-sizing:border-box;color:#1b1c19;background:#f5f5f5;resize:none;';var cb=document.createElement('button');cb.textContent='Close';cb.style.cssText='margin-top:12px;width:100%;padding:10px;border:none;border-radius:8px;background:#eae8e2;font-size:14px;font-weight:600;cursor:pointer;color:#1b1c19;';cb.onclick=function(){document.body.removeChild(ov);};bx.appendChild(h);bx.appendChild(s);bx.appendChild(ins);bx.appendChild(ta);bx.appendChild(cb);ov.appendChild(bx);document.body.appendChild(ov);ta.focus();ta.select();}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(j).then(function(){var bn=document.createElement('div');bn.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#7b189f;color:#fff;padding:12px 24px;border-radius:12px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);white-space:nowrap;';bn.textContent='\\u2713 Copied!';document.body.appendChild(bn);setTimeout(function(){if(bn.parentNode)bn.parentNode.removeChild(bn);},2000);}).catch(showOv);}else{showOv();}
})();`;

/** Minified Wayfair bookmarklet — same clipboard/overlay pattern as Amazon */
export const WAYFAIR_BOOKMARKLET_HREF = `javascript:${WAYFAIR_BOOKMARKLET_BODY.replace(/\s*\n\s*/g, '')}`;

/**
 * Walmart Order Details Bookmarklet
 *
 * On walmart.com order details (Purchase history → View details), scrapes order
 * metadata from scoped DOM selectors inside [data-testid="orderInfoCard"], with
 * __NEXT_DATA__ / text fallbacks for order date, number, and total only.
 */
// @ts-expect-error intentional documentation function
function _walmartBookmarkletSource() {
  function parseNextData(): Record<string, unknown> | null {
    const el = document.getElementById('__NEXT_DATA__');
    if (!el?.textContent) return null;
    try {
      return JSON.parse(el.textContent);
    } catch {
      return null;
    }
  }

  function walk(obj: unknown, fn: (node: unknown) => boolean, depth = 0): boolean {
    if (!obj || depth > 18) return false;
    if (fn(obj)) return true;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (walk(item, fn, depth + 1)) return true;
      }
    } else if (typeof obj === 'object') {
      for (const val of Object.values(obj as Record<string, unknown>)) {
        if (walk(val, fn, depth + 1)) return true;
      }
    }
    return false;
  }

  /** Order meta only — product fields from __NEXT_DATA__ are unreliable on this page */
  function extractOrderMetaFromNextData(data: Record<string, unknown> | null) {
    const result = {
      orderDate: '',
      orderNumber: '',
      orderTotal: null as number | null,
    };
    if (!data) return result;

    walk(data, (node) => {
      if (!node || typeof node !== 'object' || Array.isArray(node)) return false;
      const n = node as Record<string, unknown>;

      const orderId = n.orderId ?? n.orderNumber ?? n.customerOrderId ?? n.purchaseOrderId;
      if (typeof orderId === 'string') {
        const m = orderId.match(/\d{7}-\d{8}/);
        if (m) result.orderNumber = m[0];
      }

      const orderDate = n.orderDate ?? n.placedDate ?? n.createDate ?? n.orderPlacedDate;
      if (typeof orderDate === 'string' && /\d{4}/.test(orderDate)) {
        const d = new Date(orderDate);
        if (!isNaN(d.getTime())) {
          result.orderDate = d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });
        }
      }

      const total = n.orderTotal ?? n.grandTotal ?? n.total;
      if (typeof total === 'number' && total > 0) result.orderTotal = total;
      if (total && typeof total === 'object') {
        const t = total as Record<string, unknown>;
        if (typeof t.value === 'number') result.orderTotal = t.value;
        if (typeof t.displayValue === 'string') {
          const tm = t.displayValue.match(/([\d,]+\.\d{2})/);
          if (tm) result.orderTotal = parseFloat(tm[1].replace(/,/g, ''));
        }
      }

      return false;
    });

    return result;
  }

  function extractOrderMetaFromDom() {
    const root = document.querySelector('.print-bill-body') || document;
    let orderDate = '';
    let orderNumber = '';
    let orderTotal: number | null = null;

    const dateEl = root.querySelector('.print-bill-date');
    if (dateEl) {
      const m = (dateEl.textContent || '').match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4})/);
      if (m) orderDate = m[1].replace(/,\s*/, ', ').trim();
    }

    const idEl = root.querySelector('.print-bill-bar-id');
    if (idEl) {
      const m = (idEl.textContent || '').match(/(\d{7}-\d{8})/);
      if (m) orderNumber = m[1];
    }

    const totalEl = root.querySelector('.bill-order-total-payment');
    if (totalEl) {
      const m = (totalEl.textContent || '').match(/\$([\d,]+\.\d{2})/);
      if (m) orderTotal = parseFloat(m[1].replace(/,/g, ''));
    }

    return { orderDate, orderNumber, orderTotal };
  }

  function extractFromText(text: string) {
    let orderDate = '';
    const dateMatch = text.match(/([A-Za-z]+\s+\d{1,2},?\s+\d{4})\s+order/i);
    if (dateMatch) orderDate = dateMatch[1].replace(/,\s*/, ', ').trim();

    let orderNumber = '';
    const orderNumMatch = text.match(/Order\s*#\s*(\d{7}-\d{8})/i);
    if (orderNumMatch) orderNumber = orderNumMatch[1];
    if (!orderNumber) {
      const bareMatch = text.match(/\b(\d{7}-\d{8})\b/);
      if (bareMatch) orderNumber = bareMatch[1];
    }
    if (!orderNumber) {
      const urlMatch = location.href.match(/order[=\/](\d{7}-\d{8})/i);
      if (urlMatch) orderNumber = urlMatch[1];
    }

    let orderTotal: number | null = null;
    const totalMatches = [...text.matchAll(/(?:^|\n)\s*Total\s*\$?\s*([\d,]+\.\d{2})/gim)];
    if (totalMatches.length) {
      const last = totalMatches[totalMatches.length - 1][1];
      orderTotal = parseFloat(last.replace(/,/g, ''));
    }

    return { orderDate, orderNumber, orderTotal };
  }

  function isProductImage(src: string): boolean {
    if (!src) return false;
    if (/\.svg(\?|$)/i.test(src)) return false;
    if (/logo|icon|badge|avatar|shipping-box|wplus|barcode|cards-clock/i.test(src)) return false;
    return /walmartimages|\.jpe?g|\.png|\.webp/i.test(src);
  }

  function extractProductFromDom() {
    let productName = '';
    let productUrl = '';
    let imageUrl = '';

    const orderCard = document.querySelector('[data-testid="orderInfoCard"]');
    if (!orderCard) return { productName, productUrl, imageUrl };

    const toggle = orderCard.querySelector('[data-automation-id="items-toggle-link"]');
    if (toggle?.getAttribute('aria-expanded') === 'false') {
      (toggle as HTMLElement).click();
    }

    const nameEl = orderCard.querySelector('[data-testid="productName"]');
    if (nameEl) {
      productName = (nameEl.textContent || '').trim().replace(/\s+/g, ' ');
    }

    const linkEl = orderCard.querySelector(
      '[data-testid="itemtile-stack"] a[href*="/ip/"]'
    ) as HTMLAnchorElement | null;
    if (linkEl) {
      productUrl = linkEl.href.split('?')[0];
      if (!productName) {
        const aria = linkEl.getAttribute('aria-label')?.trim();
        if (aria && aria.length > 10) productName = aria;
      }
    }

    const tileImg = orderCard.querySelector('img[data-testid="productTileImage"]') as HTMLImageElement | null;
    if (tileImg?.src && isProductImage(tileImg.src)) {
      imageUrl = tileImg.src;
    }

    if (!imageUrl) {
      const collapsedImg = orderCard.querySelector(
        '[data-testid="collapsedItemList"] img'
      ) as HTMLImageElement | null;
      if (collapsedImg?.src && isProductImage(collapsedImg.src)) {
        imageUrl = collapsedImg.src;
        if (!productName && collapsedImg.alt && collapsedImg.alt.length > 10) {
          productName = collapsedImg.alt.trim();
        }
      }
    }

    return { productName, productUrl, imageUrl };
  }

  const domOrder = extractOrderMetaFromDom();
  const nextData = extractOrderMetaFromNextData(parseNextData());
  const textMeta = extractFromText(document.body.innerText);
  const product = extractProductFromDom();

  const payload = {
    retailer: 'walmart' as const,
    orderDate: domOrder.orderDate || nextData.orderDate || textMeta.orderDate,
    orderNumber: domOrder.orderNumber || nextData.orderNumber || textMeta.orderNumber,
    orderTotal: domOrder.orderTotal ?? nextData.orderTotal ?? textMeta.orderTotal,
    productName: product.productName,
    productUrl: product.productUrl,
    imageUrl: product.imageUrl,
  };
  void payload;
}

const WALMART_BOOKMARKLET_BODY = `(function(){
function parseNextData(){
  var el=document.getElementById('__NEXT_DATA__');
  if(!el||!el.textContent)return null;
  try{return JSON.parse(el.textContent);}catch(e){return null;}
}
function walk(obj,fn,depth){
  if(!obj||depth>18)return false;
  if(fn(obj))return true;
  if(Array.isArray(obj)){for(var i=0;i<obj.length;i++)if(walk(obj[i],fn,depth+1))return true;}
  else if(typeof obj==='object'){for(var k in obj)if(walk(obj[k],fn,depth+1))return true;}
  return false;
}
function extractOrderMetaFromNextData(data){
  var result={orderDate:'',orderNumber:'',orderTotal:null};
  if(!data)return result;
  walk(data,function(node){
    if(!node||typeof node!=='object'||Array.isArray(node))return false;
    var on=node.orderId||node.orderNumber||node.customerOrderId||node.purchaseOrderId;
    if(typeof on==='string'){var om=on.match(/\\d{7}-\\d{8}/);if(om)result.orderNumber=om[0];}
    var od=node.orderDate||node.placedDate||node.createDate||node.orderPlacedDate;
    if(typeof od==='string'&&/\\d{4}/.test(od)){var d=new Date(od);if(!isNaN(d.getTime()))result.orderDate=d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});}
    var total=node.orderTotal||node.grandTotal||node.total;
    if(typeof total==='number'&&total>0)result.orderTotal=total;
    if(total&&typeof total==='object'){if(typeof total.value==='number')result.orderTotal=total.value;if(typeof total.displayValue==='string'){var tm=total.displayValue.match(/([\\d,]+\\.\\d{2})/);if(tm)result.orderTotal=parseFloat(tm[1].replace(/,/g,''));}}
    return false;
  },0);
  return result;
}
function extractOrderMetaFromDom(){
  var root=document.querySelector('.print-bill-body')||document;
  var orderDate='',orderNumber='',orderTotal=null;
  var dateEl=root.querySelector('.print-bill-date');
  if(dateEl){var dm=(dateEl.textContent||'').match(/([A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4})/);if(dm)orderDate=dm[1].replace(/,\\s*/,', ').trim();}
  var idEl=root.querySelector('.print-bill-bar-id');
  if(idEl){var im=(idEl.textContent||'').match(/(\\d{7}-\\d{8})/);if(im)orderNumber=im[1];}
  var totalEl=root.querySelector('.bill-order-total-payment');
  if(totalEl){var tm=(totalEl.textContent||'').match(/\\$([\\d,]+\\.\\d{2})/);if(tm)orderTotal=parseFloat(tm[1].replace(/,/g,''));}
  return {orderDate:orderDate,orderNumber:orderNumber,orderTotal:orderTotal};
}
function extractFromText(text){
  var orderDate='',orderNumber='',orderTotal=null;
  var dm=text.match(/([A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4})\\s+order/i);
  if(dm)orderDate=dm[1].replace(/,\\s*/,', ').trim();
  var onm=text.match(/Order\\s*#\\s*(\\d{7}-\\d{8})/i);
  if(onm)orderNumber=onm[1];
  if(!orderNumber){var bm=text.match(/\\b(\\d{7}-\\d{8})\\b/);if(bm)orderNumber=bm[1];}
  if(!orderNumber){var um=location.href.match(/order[=\\/](\\d{7}-\\d{8})/i);if(um)orderNumber=um[1];}
  var totals=[...text.matchAll(/(?:^|\\n)\\s*Total\\s*\\$?\\s*([\\d,]+\\.\\d{2})/gim)];
  if(totals.length){orderTotal=parseFloat(totals[totals.length-1][1].replace(/,/g,''));}
  return {orderDate:orderDate,orderNumber:orderNumber,orderTotal:orderTotal};
}
function isProductImage(src){
  if(!src)return false;
  if(/\\.svg(\\?|$)/i.test(src))return false;
  if(/logo|icon|badge|avatar|shipping-box|wplus|barcode|cards-clock/i.test(src))return false;
  return /walmartimages|\\.jpe?g|\\.png|\\.webp/i.test(src);
}
function extractProductFromDom(){
  var productName='',productUrl='',imageUrl='';
  var orderCard=document.querySelector('[data-testid="orderInfoCard"]');
  if(!orderCard)return {productName:productName,productUrl:productUrl,imageUrl:imageUrl};
  var toggle=orderCard.querySelector('[data-automation-id="items-toggle-link"]');
  if(toggle&&toggle.getAttribute('aria-expanded')==='false')toggle.click();
  var nameEl=orderCard.querySelector('[data-testid="productName"]');
  if(nameEl)productName=(nameEl.textContent||'').trim().replace(/\\s+/g,' ');
  var linkEl=orderCard.querySelector('[data-testid="itemtile-stack"] a[href*="/ip/"]');
  if(linkEl){
    productUrl=linkEl.href.split('?')[0];
    if(!productName){var aria=linkEl.getAttribute('aria-label');if(aria&&aria.trim().length>10)productName=aria.trim();}
  }
  var tileImg=orderCard.querySelector('img[data-testid="productTileImage"]');
  if(tileImg&&tileImg.src&&isProductImage(tileImg.src))imageUrl=tileImg.src;
  if(!imageUrl){
    var collapsedImg=orderCard.querySelector('[data-testid="collapsedItemList"] img');
    if(collapsedImg&&collapsedImg.src&&isProductImage(collapsedImg.src)){
      imageUrl=collapsedImg.src;
      if(!productName&&collapsedImg.alt&&collapsedImg.alt.length>10)productName=collapsedImg.alt.trim();
    }
  }
  return {productName:productName,productUrl:productUrl,imageUrl:imageUrl};
}
var domOrder=extractOrderMetaFromDom();
var nextData=extractOrderMetaFromNextData(parseNextData());
var textMeta=extractFromText(document.body.innerText);
var prod=extractProductFromDom();
var p={retailer:'walmart',orderDate:domOrder.orderDate||nextData.orderDate||textMeta.orderDate,orderNumber:domOrder.orderNumber||nextData.orderNumber||textMeta.orderNumber,orderTotal:domOrder.orderTotal!=null?domOrder.orderTotal:(nextData.orderTotal!=null?nextData.orderTotal:textMeta.orderTotal),productName:prod.productName,productUrl:prod.productUrl,imageUrl:prod.imageUrl};
var j=JSON.stringify(p),pn=p.productName,on=p.orderNumber,ot=p.orderTotal;
function showOv(){var ov=document.createElement('div');ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';var bx=document.createElement('div');bx.style.cssText='background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;font-family:system-ui,sans-serif;';var h=document.createElement('p');h.style.cssText='font-weight:700;font-size:15px;margin:0 0 4px;color:#1b1c19;';h.textContent='Order data ready';var s=document.createElement('p');s.style.cssText='font-size:12px;color:#74777f;margin:0 0 12px;line-height:1.5;white-space:pre-wrap;';s.textContent=(pn||'(product not found)')+'\\n'+(on||'')+(ot?'  \\u00B7  $'+ot:'');var ins=document.createElement('p');ins.style.cssText='font-size:13px;color:#0071dc;font-weight:600;margin:0 0 6px;';ins.textContent='Long-press below \\u2192 Select All \\u2192 Copy';var ta=document.createElement('textarea');ta.value=j;ta.readOnly=true;ta.rows=5;ta.style.cssText='width:100%;font-size:10px;font-family:monospace;border:2px solid #0071dc;border-radius:8px;padding:8px;box-sizing:border-box;color:#1b1c19;background:#f5f5f5;resize:none;';var cb=document.createElement('button');cb.textContent='Close';cb.style.cssText='margin-top:12px;width:100%;padding:10px;border:none;border-radius:8px;background:#eae8e2;font-size:14px;font-weight:600;cursor:pointer;color:#1b1c19;';cb.onclick=function(){document.body.removeChild(ov);};bx.appendChild(h);bx.appendChild(s);bx.appendChild(ins);bx.appendChild(ta);bx.appendChild(cb);ov.appendChild(bx);document.body.appendChild(ov);ta.focus();ta.select();}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(j).then(function(){var bn=document.createElement('div');bn.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#0071dc;color:#fff;padding:12px 24px;border-radius:12px;font-family:system-ui,sans-serif;font-size:14px;font-weight:600;z-index:999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);white-space:nowrap;';bn.textContent='\\u2713 Copied!';document.body.appendChild(bn);setTimeout(function(){if(bn.parentNode)bn.parentNode.removeChild(bn);},2000);}).catch(showOv);}else{showOv();}
})();`;

/** Minified Walmart bookmarklet — same clipboard/overlay pattern as Amazon */
export const WALMART_BOOKMARKLET_HREF = `javascript:${WALMART_BOOKMARKLET_BODY.replace(/\s*\n\s*/g, '')}`;

/** Schema for the JSON the bookmarklet puts on the clipboard */
export interface BookmarkletPayload {
  retailer?: 'amazon' | 'wayfair' | 'walmart';
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

  // Case 3: Wayfair order URL pasted directly
  if (/wayfair\.com/i.test(trimmed)) {
    const wayfairOrderMatch =
      trimmed.match(/order(?:Id|ID|Number)[=/](\d{8,})/i) ||
      trimmed.match(/\/(\d{10,})(?:[/?#]|$)/);
    if (wayfairOrderMatch) {
      return {
        retailer: 'wayfair',
        orderDate: '',
        orderNumber: wayfairOrderMatch[1],
        orderTotal: null,
        productName: '',
        productUrl: '',
        imageUrl: '',
      };
    }
  }

  // Case 4: Walmart order URL or bare order number (7-8 digits with dash)
  if (/walmart\.com/i.test(trimmed)) {
    const walmartOrderMatch = trimmed.match(/\b(\d{7}-\d{8})\b/);
    if (walmartOrderMatch) {
      return {
        retailer: 'walmart',
        orderDate: '',
        orderNumber: walmartOrderMatch[1],
        orderTotal: null,
        productName: '',
        productUrl: '',
        imageUrl: '',
      };
    }
  }

  const bareWalmartMatch = trimmed.match(/^(\d{7}-\d{8})$/);
  if (bareWalmartMatch) {
    return {
      retailer: 'walmart',
      orderDate: '',
      orderNumber: bareWalmartMatch[1],
      orderTotal: null,
      productName: '',
      productUrl: '',
      imageUrl: '',
    };
  }

  // Case 5: Bare Wayfair order number (10+ digits)
  const bareWayfairMatch = trimmed.match(/^\d{10,}$/);
  if (bareWayfairMatch) {
    return {
      retailer: 'wayfair',
      orderDate: '',
      orderNumber: bareWayfairMatch[0],
      orderTotal: null,
      productName: '',
      productUrl: '',
      imageUrl: '',
    };
  }

  throw new Error('Not a recognised Amazon, Wayfair, or Walmart data format');
}

