import { useEffect } from 'react';
import { captureImportFromLocation } from '../utils/importHandoff';

/** Captures `#import=` from URL into sessionStorage before auth redirects strip the hash. */
export const ImportHashCapture: React.FC = () => {
  useEffect(() => {
    captureImportFromLocation();
  }, []);
  return null;
};

export default ImportHashCapture;
