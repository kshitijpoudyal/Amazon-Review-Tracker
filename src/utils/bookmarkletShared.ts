/** Collapse whitespace for bookmarklet `javascript:` URLs. */
export function minifyBookmarklet(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Shared bookmarklet tail: validate, redirect to PWA, fallback overlay.
 * `__APP_ORIGIN__` is replaced when building retailer bookmarklets.
 */
export const BOOKMARKLET_HANDOFF_RUNTIME = `
function __rtShowToast(msg,color){
  var bn=document.createElement('div');
  bn.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:'+(color||'#022448')+';color:#fff;padding:12px 20px;border-radius:12px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;z-index:9999999;box-shadow:0 8px 24px rgba(0,0,0,0.3);max-width:90vw;text-align:center;line-height:1.4;';
  bn.textContent=msg;
  document.body.appendChild(bn);
  setTimeout(function(){if(bn.parentNode)bn.parentNode.removeChild(bn);},4500);
}
function __rtShowOverlay(j,p,accent,errMsg){
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.88);z-index:999999;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';
  var bx=document.createElement('div');
  bx.style.cssText='background:#fff;border-radius:16px;padding:20px;width:100%;max-width:480px;font-family:system-ui,sans-serif;max-height:90vh;overflow:auto;';
  var h=document.createElement('p');
  h.style.cssText='font-weight:700;font-size:15px;margin:0 0 4px;color:#1b1c19;';
  h.textContent=errMsg?'Import failed':'Order data ready';
  var s=document.createElement('p');
  s.style.cssText='font-size:12px;color:#74777f;margin:0 0 12px;line-height:1.5;white-space:pre-wrap;';
  s.textContent=(p.productName||'(product not found)')+'\\n'+(p.orderNumber||'')+(p.orderTotal?'  \\u00B7  $'+p.orderTotal:'');
  if(errMsg){
    var er=document.createElement('p');
    er.style.cssText='font-size:12px;color:#ba1a1a;margin:0 0 10px;line-height:1.4;';
    er.textContent=errMsg;
    bx.appendChild(h);bx.appendChild(er);bx.appendChild(s);
  }else{
    bx.appendChild(h);bx.appendChild(s);
  }
  var ins=document.createElement('p');
  ins.style.cssText='font-size:13px;color:'+(accent||'#022448')+';font-weight:600;margin:0 0 6px;';
  ins.textContent='Fallback: long-press below \\u2192 Select All \\u2192 Copy, then paste in the app';
  var ta=document.createElement('textarea');
  ta.value=j;ta.readOnly=true;ta.rows=5;
  ta.style.cssText='width:100%;font-size:10px;font-family:monospace;border:2px solid '+(accent||'#022448')+';border-radius:8px;padding:8px;box-sizing:border-box;color:#1b1c19;background:#f5f5f5;resize:none;';
  var cb=document.createElement('button');
  cb.textContent='Close';
  cb.style.cssText='margin-top:12px;width:100%;padding:10px;border:none;border-radius:8px;background:#eae8e2;font-size:14px;font-weight:600;cursor:pointer;color:#1b1c19;';
  cb.onclick=function(){document.body.removeChild(ov);};
  var cp=document.createElement('button');
  cp.textContent='Copy JSON';
  cp.style.cssText='margin-top:8px;width:100%;padding:10px;border:none;border-radius:8px;background:'+(accent||'#022448')+';font-size:14px;font-weight:600;cursor:pointer;color:#fff;';
  cp.onclick=function(){
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(j).then(function(){__rtShowToast('\\u2713 Copied!');}).catch(function(){ta.focus();ta.select();});
    }else{ta.focus();ta.select();}
  };
  bx.appendChild(ins);bx.appendChild(ta);bx.appendChild(cp);bx.appendChild(cb);
  ov.appendChild(bx);document.body.appendChild(ov);
  ta.focus();ta.select();
}
function __rtB64url(str){
  return btoa(unescape(encodeURIComponent(str))).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');
}
function __rtHandoff(p,accent){
  if(!p.orderNumber&&!p.productName&&!p.orderDate){
    __rtShowToast('Could not find order data on this page','#ba1a1a');
    __rtShowOverlay(JSON.stringify(p),p,accent,'No order data found. Open the order details page and try again.');
    return;
  }
  var j=JSON.stringify(p);
  var origin='__APP_ORIGIN__';
  if(!origin){__rtShowOverlay(j,p,accent,'App URL not configured.');return;}
  var url=origin.replace(/\\/$/,'')+'/products#import='+__rtB64url(j);
  if(url.length>7500){
    __rtShowOverlay(j,p,accent,'Order data is too large for automatic import.');
    return;
  }
  try{
    var tab=window.open(url,'_blank','noopener,noreferrer');
    if(!tab){
      __rtShowOverlay(j,p,accent,'Popup blocked. Allow popups for this site, or copy the JSON below.');
      return;
    }
  }catch(e){
    __rtShowOverlay(j,p,accent,'Could not open the import page automatically.');
  }
}
`;

export function buildBookmarkletHref(extractorBody: string, appOrigin: string): string {
  const runtime = BOOKMARKLET_HANDOFF_RUNTIME.replace(/__APP_ORIGIN__/g, appOrigin.replace(/'/g, "\\'"));
  const code = minifyBookmarklet(`(function(){${extractorBody}${runtime}})();`);
  return `javascript:${code}`;
}
