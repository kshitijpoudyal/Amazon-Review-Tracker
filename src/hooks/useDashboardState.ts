import { useState, useCallback } from 'react';

interface UseDashboardStateOptions {
  onShowForm?: () => void;
  onHideForm?: () => void;
}

export const useDashboardState = (options?: UseDashboardStateOptions) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const handleShowAddForm = useCallback(() => {
    setShowAddForm(true);
    options?.onShowForm?.();
  }, [options]);

  const handleHideAddForm = useCallback(() => {
    setShowAddForm(false);
    options?.onHideForm?.();
  }, [options]);

  const toggleAddForm = useCallback(() => {
    if (showAddForm) {
      handleHideAddForm();
    } else {
      handleShowAddForm();
    }
  }, [showAddForm, handleShowAddForm, handleHideAddForm]);

  return {
    showAddForm,
    setShowAddForm,
    handleShowAddForm,
    handleHideAddForm,
    toggleAddForm
  };
};
