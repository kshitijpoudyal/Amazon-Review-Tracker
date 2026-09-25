/** Amazon order-page extraction (runs inside bookmarklet IIFE). */
export const AMAZON_EXTRACTOR_BODY = `
var ACCENT='#022448';
var de=document.querySelector('[data-component="orderDate"] span');
var od=de?de.textContent.replace(/[^\\w\\s,]/g,'').trim():'';
var oe=document.querySelector('[data-component="orderId"] span');
var on=oe?oe.textContent.trim():'';
if(!on){var hm=location.href.match(/orderID=(\\d{3}-\\d{7}-\\d{7})/);if(hm)on=hm[1];}
if(!on){var bm=document.body.innerText.match(/\\b(\\d{3}-\\d{7}-\\d{7})\\b/);if(bm)on=bm[1];}
function extractOrderTotal(){
  var patterns=[/Grand Total[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i,/Order total[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i,/Order Total[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i];
  function fromText(text){
    if(!text)return null;
    for(var i=0;i<patterns.length;i++){var m=text.match(patterns[i]);if(m)return parseFloat(m[1].replace(/,/g,''));}
    return null;
  }
  var totalEl=document.querySelector('[data-component="grandTotal"] span,[data-component="orderTotal"] span,[data-component="totalPrice"] span');
  if(totalEl){var dm=(totalEl.textContent||'').match(/([\\d,]+\\.\\d{2})/);if(dm)return parseFloat(dm[1].replace(/,/g,''));}
  var summary=document.querySelector('[data-component="chargeSummary"],[data-component="orderSummary"],[data-component="orderInfo"]');
  if(summary){var st=fromText(summary.innerText||'');if(st!=null)return st;}
  return fromText(document.body.innerText||'');
}
var ot=extractOrderTotal();
function isImgPlaceholder(src){
  if(!src)return true;
  return /\\.gif(\\?|$)/i.test(src)||/transparent|spacer|pixel|data:image/i.test(src);
}
function parseImageUrl(img){
  if(!img)return '';
  var hires=img.getAttribute('data-a-hires');
  if(hires&&hires.indexOf('http')===0)return hires;
  var dyn=img.getAttribute('data-a-dynamic-image');
  if(dyn){
    try{
      var parsed=JSON.parse(dyn);
      var keys=Object.keys(parsed);
      for(var ki=keys.length-1;ki>=0;ki--){
        if(keys[ki].indexOf('http')===0)return keys[ki];
      }
    }catch(e){}
  }
  var lazy=img.getAttribute('data-src')||img.getAttribute('data-old-hires');
  if(lazy&&lazy.indexOf('http')===0&&!isImgPlaceholder(lazy))return lazy;
  var src=img.src||'';
  if(src&&src.indexOf('http')===0&&!isImgPlaceholder(src))return src;
  var srcset=img.getAttribute('srcset');
  if(srcset){
    var parts=srcset.split(',').map(function(p){return p.trim().split(/\\s+/)[0];}).filter(Boolean);
    if(parts.length)return parts[parts.length-1];
  }
  return '';
}
function findItemBlock(el){
  var block=el.closest('.a-fixed-left-grid,[data-component="itemRow"],.yohtmlc-item,.item-box,.yo-enhanced-flex-card,.yo-enhanced-card');
  if(block)return block;
  var n=el;
  for(var d=0;d<12&&n;d++){
    if(n.querySelector('[data-component="itemImage"] img, img[data-a-hires], img[data-a-dynamic-image], img[src*="media-amazon"], img[src*="images-na"]'))return n;
    n=n.parentElement;
  }
  return el.parentElement;
}
function findItemImage(block){
  if(!block)return '';
  var selectors=['[data-component="itemImage"] img','.yohtmlc-item img','a img','img[data-a-hires]','img[data-a-dynamic-image]','img[src*="media-amazon"]','img[src*="images-na"]','img[src*="ssl-images-amazon"]'];
  for(var si=0;si<selectors.length;si++){
    var imgs=block.querySelectorAll(selectors[si]);
    for(var ii=0;ii<imgs.length;ii++){
      var url=parseImageUrl(imgs[ii]);
      if(url)return url;
    }
  }
  return '';
}
function normalizeProductUrl(href){
  if(!href)return '';
  var dm=href.match(/\\/dp\\/([A-Z0-9]{10})/);
  if(dm)return 'https://www.amazon.com/dp/'+dm[1];
  var gp=href.match(/\\/gp\\/product\\/([A-Z0-9]{10})/);
  if(gp)return 'https://www.amazon.com/dp/'+gp[1];
  return href.split('?')[0];
}
function pushProductFromLink(tl){
  var pn=(tl.textContent||'').trim().replace(/\\s+/g,' ');
  if(!pn||pn.length<3)return;
  var pu=normalizeProductUrl(tl.href||'');
  var block=findItemBlock(tl);
  var iu=findItemImage(block);
  products.push({productName:pn,productUrl:pu,imageUrl:iu});
}
var scope=document.querySelector('[data-component="orderCard"]')||document.querySelector('.order-card')||document;
var products=[];
var itemBlocks=scope.querySelectorAll("[data-component='purchasedItems'] .a-fixed-left-grid, .item-box, .yo-enhanced-flex-card, .yo-enhanced-card");
if(itemBlocks.length){
  for(var bi=0;bi<itemBlocks.length;bi++){
    var link=itemBlocks[bi].querySelector('[data-component="itemTitle"] a, .yohtmlc-item a[href*="/dp/"], .yohtmlc-product-title a, a[href*="/dp/"], a[href*="/gp/product/"]');
    if(link)pushProductFromLink(link);
  }
}
if(!products.length){
  var titleLinks=scope.querySelectorAll('[data-component="itemTitle"] a, .yohtmlc-item a[href*="/dp/"], .yohtmlc-product-title a');
  for(var i=0;i<titleLinks.length;i++)pushProductFromLink(titleLinks[i]);
}
if(!products.length){
  var tl2=document.querySelector('[data-component="itemTitle"] a, .yohtmlc-item a[href*="/dp/"]');
  if(tl2)pushProductFromLink(tl2);
}
var first=products[0]||{productName:'',productUrl:'',imageUrl:''};
var p={retailer:'amazon',orderDate:od,orderNumber:on,orderTotal:ot,productName:first.productName,productUrl:first.productUrl,imageUrl:first.imageUrl,products:products};
__rtHandoff(p,ACCENT);
`;

/** Wayfair — desktop side drawer + mobile fullscreen dialog. */
export const WAYFAIR_EXTRACTOR_BODY = `
var ACCENT='#7b189f';
var SKIP=/Wayfair Rewards|Protection Plan|Professional Assembly|Allstate|Gift Card/i;
function findDrawerRoot(){
  var dialogs=document.querySelectorAll('[role="dialog"], [aria-modal="true"]');
  for(var i=0;i<dialogs.length;i++){
    var dt=dialogs[i].innerText||'';
    if(/view\\s*\\/?\\s*edit\\s*details|your item|order details|your order/i.test(dt))return dialogs[i];
  }
  var nodes=document.querySelectorAll('h1,h2,h3,h4,h5,h6,div,section,aside');
  for(var j=0;j<nodes.length;j++){
    var t=(nodes[j].textContent||'').trim();
    if(t.length>60||!/view\\s*\\/?\\s*edit\\s*details|your item|order details/i.test(t))continue;
    var node=nodes[j];
    for(var d=0;d<14&&node;d++){
      var st=window.getComputedStyle(node);
      var r=node.getBoundingClientRect();
      var vw=window.innerWidth||document.documentElement.clientWidth;
      var vh=window.innerHeight||document.documentElement.clientHeight;
      var isOverlay=(st.position==='fixed'||st.position==='absolute'||st.position==='sticky');
      var isLarge=r.width>Math.min(280,vw*0.85)&&r.height>Math.min(280,vh*0.35);
      var isRightDrawer=isOverlay&&r.left>vw*0.25&&r.width>250&&r.height>300;
      var isMobileSheet=isOverlay&&r.width>vw*0.7&&r.height>vh*0.4;
      var isFullScreen=isOverlay&&r.width>vw*0.92&&r.height>vh*0.75;
      if(isRightDrawer||isMobileSheet||isFullScreen)return node;
      node=node.parentElement;
    }
  }
  return null;
}
function findOrderCards(){
  var cards=[],seen=new Set();
  var candidates=document.querySelectorAll('div,section,article,li');
  for(var i=0;i<candidates.length;i++){
    var el=candidates[i];
    var t=el.innerText||'';
    if(el.childElementCount>6||!/Wayfair Order #\\d+/.test(t)||t.length>150)continue;
    var card=el;
    for(var u=0;u<12&&card;u++){
      var ct=card.innerText||'';
      if(/Ordered On:/i.test(ct)&&ct.length>80&&ct.length<12000){
        if(!seen.has(card)){seen.add(card);cards.push(card);}
        break;
      }
      card=card.parentElement;
    }
  }
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
  var productName='',productUrl='',imageUrl='',orderTotal=null,products=[];
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
  for(var bi=0;bi<blocks.length;bi++){
    var block=blocks[bi],bt=block.innerText||'';
    if(SKIP.test(bt))continue;
    var lines=bt.split('\\n').map(function(l){return l.trim();}).filter(Boolean);
    var skipLine=/^(Delivered|Ordered|Wayfair|Total|Quantity|Upholstery|Add |Missing|Return |Report |Track |Edit |View |By |Download|Your Item|Your Shipment|Delivery)/i;
    var pname='';
    for(var j=0;j<lines.length;j++){
      var line=lines[j];
      if(line.length>15&&!skipLine.test(line)&&!/^\\d+$/.test(line)&&line.split(' ').length>=3){pname=line.replace(/\\s+/g,' ');break;}
    }
    var purl='';
    var links=block.querySelectorAll('a[href]');
    for(var k=0;k<links.length;k++){
      var a=links[k],href=a.href||'';
      if(href.indexOf('wayfair.com')>-1&&(href.indexOf('/pdp/')>-1||href.indexOf('~')>-1||/view details/i.test(a.textContent))){
        purl=href.split('?')[0];
        if(!pname&&a.textContent.trim().length>15)pname=a.textContent.trim().replace(/\\s+/g,' ');
        break;
      }
    }
    var im=block.querySelector('img[src]');
    var iurl=im?im.src||'':'';
    var price=null;
    for(var p=0;p<lines.length;p++){
      var pl=lines[p];
      if(/Assembly|Protection|Add Professional|Allstate/i.test(pl))continue;
      var pm=pl.match(/\\$\\s?([\\d,]+\\.\\d{2})/);
      if(pm){price=parseFloat(pm[1].replace(/,/g,''));break;}
    }
    if(pname||purl){
      products.push({productName:pname,productUrl:purl,imageUrl:iurl,price:price});
      if(!productName){productName=pname;productUrl=purl;imageUrl=iurl;orderTotal=price;}
    }
  }
  if(!productName){
    scope.querySelectorAll('a[href*="/pdp/"], a[href*="~"]').forEach(function(lk){
      if(productName)return;
      var par=lk.parentElement;
      for(var u=0;u<6&&par;u++){if(SKIP.test(par.innerText||'')){par=null;break;}par=par.parentElement;}
      if(par===null)return;
      productName=lk.textContent.trim().replace(/\\s+/g,' ');
      productUrl=lk.href.split('?')[0];
      products=[{productName:productName,productUrl:productUrl,imageUrl:'',price:null}];
    });
  }
  return {productName:productName,productUrl:productUrl,imageUrl:imageUrl,orderTotal:orderTotal,products:products};
}
function extractTotalPrice(scope){
  if(!scope)return null;
  var text=scope===document?document.body.innerText:scope.innerText;
  var dm=text.match(/Total Price[:\\s]*\\$?\\s*([\\d,]+\\.\\d{2})/i);
  if(dm)return parseFloat(dm[1].replace(/,/g,''));
  if(scope!==document&&scope.querySelectorAll){
    var headers=scope.querySelectorAll('h1,h2,h3,h4,h5,h6,div,span');
    for(var i=0;i<headers.length;i++){
      if(!/^your order$/i.test((headers[i].textContent||'').trim()))continue;
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
var drawer=findDrawerRoot();
var orderCount=(document.body.innerText.match(/Wayfair Order #/g)||[]).length;
if(!drawer&&orderCount>1){
  __rtShowToast('Open View/Edit Details for the item first','#ba1a1a');
}else{
  var productScope=drawer||document;
  var prod=extractProduct(productScope);
  var orderCard=drawer?findOrderCardForProduct(prod.productName):(orderCount===1?findOrderCards()[0]:null);
  var meta=extractOrderMeta(orderCard||productScope);
  var orderTotal=prod.orderTotal;
  if(orderTotal==null){orderTotal=extractTotalPrice(drawer)||extractTotalPrice(orderCard)||meta.orderTotal;}
  var p={retailer:'wayfair',orderDate:meta.orderDate,orderNumber:meta.orderNumber,orderTotal:orderTotal,productName:prod.productName,productUrl:prod.productUrl,imageUrl:prod.imageUrl,products:prod.products};
  __rtHandoff(p,ACCENT);
}
`;

/** Walmart order details — mobile-friendly data-testid selectors. */
export const WALMART_EXTRACTOR_BODY = `
var ACCENT='#0071dc';
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
  var root=document.querySelector('.print-bill-body')||document.querySelector('[data-testid="orderInfoCard"]')||document;
  var orderDate='',orderNumber='',orderTotal=null;
  var dateEl=root.querySelector('.print-bill-date,[data-testid="orderDate"]');
  if(dateEl){var dm=(dateEl.textContent||'').match(/([A-Za-z]+\\s+\\d{1,2},?\\s+\\d{4})/);if(dm)orderDate=dm[1].replace(/,\\s*/,', ').trim();}
  var idEl=root.querySelector('.print-bill-bar-id,[data-testid="orderNumber"]');
  if(idEl){var im=(idEl.textContent||'').match(/(\\d{7}-\\d{8})/);if(im)orderNumber=im[1];}
  var totalEl=root.querySelector('.bill-order-total-payment,[data-testid="orderTotal"]');
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
function extractProductsFromDom(){
  var products=[];
  var orderCard=document.querySelector('[data-testid="orderInfoCard"]');
  if(!orderCard)return products;
  var toggle=orderCard.querySelector('[data-automation-id="items-toggle-link"],[data-testid="items-toggle"]');
  if(toggle&&toggle.getAttribute('aria-expanded')==='false')toggle.click();
  var tiles=orderCard.querySelectorAll('[data-testid="itemtile-stack"],[data-testid="productName"]');
  if(tiles.length){
    orderCard.querySelectorAll('[data-testid="itemtile-stack"]').forEach(function(tile){
      var nameEl=tile.querySelector('[data-testid="productName"]');
      var pn=nameEl?(nameEl.textContent||'').trim().replace(/\\s+/g,' '):'';
      var linkEl=tile.querySelector('a[href*="/ip/"]');
      var pu=linkEl?linkEl.href.split('?')[0]:'';
      if(!pn&&linkEl){var aria=linkEl.getAttribute('aria-label');if(aria&&aria.trim().length>10)pn=aria.trim();}
      var img=tile.querySelector('img[data-testid="productTileImage"],img[src*="walmartimages"]');
      var iu=img&&isProductImage(img.src)?img.src:'';
      if(pn||pu)products.push({productName:pn,productUrl:pu,imageUrl:iu});
    });
  }
  if(!products.length){
    var nameEl=orderCard.querySelector('[data-testid="productName"]');
    var pn=nameEl?(nameEl.textContent||'').trim().replace(/\\s+/g,' '):'';
    var linkEl=orderCard.querySelector('[data-testid="itemtile-stack"] a[href*="/ip/"],a[href*="/ip/"]');
    var pu=linkEl?linkEl.href.split('?')[0]:'';
    var tileImg=orderCard.querySelector('img[data-testid="productTileImage"]');
    var iu=tileImg&&tileImg.src&&isProductImage(tileImg.src)?tileImg.src:'';
    if(!iu){
      var collapsedImg=orderCard.querySelector('[data-testid="collapsedItemList"] img');
      if(collapsedImg&&collapsedImg.src&&isProductImage(collapsedImg.src)){
        iu=collapsedImg.src;
        if(!pn&&collapsedImg.alt&&collapsedImg.alt.length>10)pn=collapsedImg.alt.trim();
      }
    }
    if(pn||pu)products.push({productName:pn,productUrl:pu,imageUrl:iu});
  }
  return products;
}
var domOrder=extractOrderMetaFromDom();
var nextData=extractOrderMetaFromNextData(parseNextData());
var textMeta=extractFromText(document.body.innerText);
var prods=extractProductsFromDom();
var first=prods[0]||{productName:'',productUrl:'',imageUrl:''};
var p={retailer:'walmart',orderDate:domOrder.orderDate||nextData.orderDate||textMeta.orderDate,orderNumber:domOrder.orderNumber||nextData.orderNumber||textMeta.orderNumber,orderTotal:domOrder.orderTotal!=null?domOrder.orderTotal:(nextData.orderTotal!=null?nextData.orderTotal:textMeta.orderTotal),productName:first.productName,productUrl:first.productUrl,imageUrl:first.imageUrl,products:prods};
__rtHandoff(p,ACCENT);
`;
