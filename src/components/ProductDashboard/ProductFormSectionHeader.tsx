import React from 'react';

interface ProductFormSectionHeaderProps {
  title: string;
  className?: string;
}

export const ProductFormSectionHeader: React.FC<ProductFormSectionHeaderProps> = ({
  title,
  className = 'mb-4',
}) => (
  <p className={`text-[10px] font-label uppercase tracking-widest text-[#74777f] ${className}`}>
    {title}
  </p>
);

export default ProductFormSectionHeader;
