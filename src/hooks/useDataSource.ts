import { useMemo } from 'react';
import { useProductCrudFirebase } from './useProductCrudFirebase';
import { useUserData } from './useUserData';

export const useDataSource = (isPublicMode: boolean, userId: string | undefined, username: string | undefined) => {
  const privateData = useProductCrudFirebase(userId);
  const publicData = useUserData(username);

  return useMemo(() => {
    if (isPublicMode) {
      return {
        data: publicData.data,
        loading: publicData.loading,
        error: publicData.error,
        updateProduct: async () => false, // No-op in public mode
        addProduct: async () => false,    // No-op in public mode
        deleteProduct: async () => false, // No-op in public mode
        userProfile: publicData.userProfile,
      };
    }
    
    return {
      data: privateData.data,
      loading: privateData.loading,
      error: privateData.error,
      updateProduct: privateData.updateProduct,
      addProduct: privateData.addProduct,
      deleteProduct: privateData.deleteProduct,
      userProfile: null,
    };
  }, [isPublicMode, privateData, publicData]);
};
