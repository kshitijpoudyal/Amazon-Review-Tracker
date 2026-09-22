import React from 'react';
import { typography } from '../../utils/typography';

interface ProductFormSectionHeaderProps {
  title: string;
  className?: string;
}

export const ProductFormSectionHeader: React.FC<ProductFormSectionHeaderProps> = ({
  title,
  className = 'mb-3',
}) => (
  <p className={`${typography.label} text-[#74777f] ${className}`}>
    {title}
  </p>
);

export default ProductFormSectionHeader;
