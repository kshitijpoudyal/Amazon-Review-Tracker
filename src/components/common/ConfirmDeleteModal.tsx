import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-[#fbf9f3] rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] w-full max-w-sm overflow-hidden">
        {/* Icon + title */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-[#ffdad6] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[#ba1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[#1b1c19] mb-2">{title}</h2>
          <p className="text-sm text-[#43474e] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold rounded-full border border-[rgba(196,198,207,0.6)] text-[#43474e] bg-[#fbf9f3] hover:bg-[#e4e2dd] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-semibold rounded-full bg-[#ba1a1a] text-white hover:bg-[#9e1515] active:scale-95 transition-all shadow-[0_4px_12px_rgba(186,26,26,0.25)]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
