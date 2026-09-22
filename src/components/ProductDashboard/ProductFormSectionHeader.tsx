import React from 'react';
import { typography } from '../../utils/typography';

interface ProductFormSectionHeaderProps {
  title: string;
  className?: string;
}

export const ProductFormSectionHeader: React.FC<ProductFormSectionHeaderProps> = ({
  title,
  className = 'mb-4',
}) => (
  <p className={`${typography.overline} ${className}`}>
    {title}
  </p>
);

export default ProductFormSectionHeader;
