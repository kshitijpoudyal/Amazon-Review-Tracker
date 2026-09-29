import { useCallback, useEffect, useState } from 'react';
import { BookmarkletPayload } from '../utils/bookmarklet';
import {
  captureImportFromLocation,
  clearPendingImport,
  readPendingImport,
} from '../utils/importHandoff';

export function usePendingRetailerImport(enabled: boolean) {
  const [pendingImport, setPendingImport] = useState<BookmarkletPayload | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const captured = captureImportFromLocation() ?? readPendingImport();
    if (captured) {
      setPendingImport(captured);
    }
  }, [enabled]);

  const dismissImport = useCallback(() => {
    clearPendingImport();
    setPendingImport(null);
  }, []);

  const consumeImport = useCallback((): BookmarkletPayload | null => {
    const current = pendingImport;
    clearPendingImport();
    setPendingImport(null);
    return current;
  }, [pendingImport]);

  return {
    pendingImport,
    dismissImport,
    consumeImport,
  };
}
