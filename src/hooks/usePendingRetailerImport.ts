import { useCallback, useEffect, useState } from 'react';
import { BookmarkletPayload } from '../utils/bookmarklet';
import {
  captureImportFromLocation,
  clearPendingImport,
  readPendingImport,
} from '../utils/importHandoff';

export function usePendingRetailerImport(enabled: boolean) {
  const [pendingImport, setPendingImport] = useState<BookmarkletPayload | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const captured = captureImportFromLocation() ?? readPendingImport();
    if (captured) {
      setPendingImport(captured);
      setShowPreview(true);
    }
  }, [enabled]);

  const dismissImport = useCallback(() => {
    clearPendingImport();
    setPendingImport(null);
    setShowPreview(false);
  }, []);

  const consumeImport = useCallback((): BookmarkletPayload | null => {
    const current = pendingImport;
    clearPendingImport();
    setPendingImport(null);
    setShowPreview(false);
    return current;
  }, [pendingImport]);

  return {
    pendingImport,
    showPreview,
    dismissImport,
    consumeImport,
  };
}
