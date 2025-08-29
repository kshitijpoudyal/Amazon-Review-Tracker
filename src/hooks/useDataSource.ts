import { useMemo } from 'react';
import { useProductCrudFirebase } from './useProductCrudFirebase';

export const useDataSource = (userId: string | undefined) => {
  const privateData = useProductCrudFirebase(userId);

  return useMemo(() => {
    return {
      data: privateData.data,
      loading: privateData.loading,
      error: privateData.error,
      updateProduct: privateData.updateProduct,
      addProduct: privateData.addProduct,
      deleteProduct: privateData.deleteProduct,
      userProfile: null,
    };
  }, [privateData]);
};
