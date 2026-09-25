import { BookmarkletPayload, normalizeBookmarkletPayload } from './bookmarkletPayload';

/** Fragment key — not sent to server (privacy). */
export const IMPORT_HASH_PREFIX = '#import=';

/** sessionStorage key for import surviving auth redirects */
export const PENDING_IMPORT_STORAGE_KEY = 'pendingRetailerImport';

/** Conservative limit — mobile browsers vary (~2k–8k). */
export const MAX_IMPORT_URL_LENGTH = 7500;

export function getAppOrigin(): string {
  // In the browser, always use the page you're on — bookmarklets are generated client-side.
  // VITE_APP_ORIGIN is only a build-time fallback (e.g. if env was set to localhost during deploy).
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  const fromEnv = import.meta.env.VITE_APP_ORIGIN as string | undefined;
  if (fromEnv?.trim()) return fromEnv.replace(/\/$/, '');
  return '';
}

/** Base64url encode UTF-8 JSON (browser-safe). */
export function encodeImportPayload(payload: BookmarkletPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode base64url import fragment. Throws on invalid data. */
export function decodeImportPayload(encoded: string): BookmarkletPayload {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + '='.repeat(padLen);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json);
  return normalizeBookmarkletPayload(parsed);
}

export function buildImportUrl(origin: string, payload: BookmarkletPayload): string {
  const base = origin.replace(/\/$/, '');
  const encoded = encodeImportPayload(payload);
  return `${base}/products${IMPORT_HASH_PREFIX}${encoded}`;
}

export function isImportUrlTooLong(url: string): boolean {
  return url.length > MAX_IMPORT_URL_LENGTH;
}

/** Read `#import=` from current URL, persist to sessionStorage, strip from history. */
export function captureImportFromLocation(): BookmarkletPayload | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (hash.startsWith(IMPORT_HASH_PREFIX)) {
    try {
      const encoded = hash.slice(IMPORT_HASH_PREFIX.length);
      const payload = decodeImportPayload(encoded);
      sessionStorage.setItem(PENDING_IMPORT_STORAGE_KEY, JSON.stringify(payload));
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return payload;
    } catch {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return null;
    }
  }

  return readPendingImport();
}

export function readPendingImport(): BookmarkletPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_IMPORT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeBookmarkletPayload(JSON.parse(raw));
  } catch {
    sessionStorage.removeItem(PENDING_IMPORT_STORAGE_KEY);
    return null;
  }
}

export function clearPendingImport(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(PENDING_IMPORT_STORAGE_KEY);
  }
}

export function storePendingImport(payload: BookmarkletPayload): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(PENDING_IMPORT_STORAGE_KEY, JSON.stringify(payload));
  }
}
