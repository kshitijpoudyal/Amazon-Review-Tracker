import React from 'react';
import { colors } from '../../utils/colors';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  label,
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  onClick,
  ...props
}) => {
  // Build CSS classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    icon: 'w-8 h-8 p-0'
  }[size];

  const variantClasses = {
    primary: `${colors.button.primary} focus:ring-[#022448] shadow-[0_4px_12px_rgba(2,36,72,0.15)] hover:shadow-[0_8px_24px_rgba(2,36,72,0.2)]`,
    secondary: `${colors.button.secondary} focus:ring-[#022448] shadow-[0_2px_8px_rgba(2,36,72,0.06)]`,
    danger: `${colors.button.dangerSolid} focus:ring-[#ba1a1a] shadow-sm hover:shadow-md`,
    ghost: `text-[#74777f] hover:text-[#1b1c19] hover:bg-[#eae8e2] focus:ring-[#022448] transition-colors duration-150`
  }[variant];

  const buttonClasses = [
    baseClasses,
    sizeClasses,
    variantClasses,
    fullWidth && 'w-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition !== 'right' && icon}
      {label}
      {icon && iconPosition === 'right' && icon}
    </button>
  );
};



export default Button;