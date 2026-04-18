import React from 'react';
import Modal from './Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Delete Item',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
}) => {
  const footer = (
    <div className="flex justify-end gap-3">
      <button
        onClick={onCancel}
        className="px-5 py-2.5 text-sm font-semibold rounded-full border border-[rgba(196,198,207,0.4)] text-[#43474e] bg-[#fbf9f3] hover:bg-[#e4e2dd] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        className="px-5 py-2.5 text-sm font-semibold rounded-full bg-[#ba1a1a] text-white hover:bg-[#9e1515] active:scale-95 transition-all shadow-[0_4px_12px_rgba(186,26,26,0.25)]"
      >
        Delete
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      footer={footer}
    >
      <div className="flex items-start gap-4 py-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center">
          <svg className="w-5 h-5 text-[#ba1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <p className="text-[#43474e] text-sm leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
