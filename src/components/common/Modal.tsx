import React, { ReactNode } from 'react';
import { colors } from '../../utils/colors';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
    children?: ReactNode;
    header?: ReactNode;
    body?: ReactNode;
    footer?: ReactNode;
    className?: string;
}

/**
 * Reusable Modal Component
 * 
 * A flexible modal component that can be used across the application.
 * Supports custom header, body, and footer content with responsive design.
 * 
 * @param isOpen - Whether the modal is visible
 * @param onClose - Function to call when modal should be closed
 * @param title - Optional title for the header (used if header prop not provided)
 * @param size - Size of the modal (sm, md, lg, xl)
 * @param showCloseButton - Whether to show the X close button in header
 * @param header - Custom header content
 * @param body - Custom body content
 * @param footer - Custom footer content
 * @param className - Additional CSS classes for the modal container
 */
const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    showCloseButton = true,
    header,
    body,
    footer,
    className = ''
}) => {
    if (!isOpen) return null;

    // Size classes for responsive modal widths
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl'
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div
            className={`fixed inset-0 ${colors.modal.overlay} flex items-start justify-center p-2 pt-4 sm:p-4 sm:pt-8 z-50`}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
        >
            <div
                className={`
                bg-[#fbf9f3]/95 backdrop-blur-[12px]
                rounded-2xl
                ${colors.modal.shadow} 
                ${sizeClasses[size]} 
                w-full 
                max-h-[90svh]
                overflow-hidden 
                relative 
                flex 
                flex-col
                ${className}
                `}
            >
                {/* Header — custom headers manage their own padding/border */}
                {header ? (
                    <div className="flex-shrink-0">
                        {header}
                    </div>
                ) : (title || showCloseButton) ? (
                    <div className={`flex-shrink-0 p-4 sm:p-6 border-b ${colors.border.default}`}>
                        <div className="flex justify-between items-center">
                            {title && (
                                <h2 className={`text-xl sm:text-2xl font-bold ${colors.text.primary}`}>
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className={`${colors.button.close} transition-colors p-2 sm:p-1 -mr-2 sm:-mr-1`}
                                    aria-label="Close modal"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {body}
                </div>

                {/* Footer */}
                {footer && (
                    <div className={`flex-shrink-0 bg-[#fbf9f3] border-t ${colors.border.default} p-4 sm:p-6 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6 justify-between`}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
export type { ModalProps };
