import React from 'react';
import { ReviewMediaType } from '../../types/Product';
import { ReviewMediaTypeSelector } from '../common';
interface ProductFormReviewRequirementSectionProps {
  value?: ReviewMediaType;
  onChange: (value: ReviewMediaType) => void;
}

export const ProductFormReviewRequirementSection: React.FC<ProductFormReviewRequirementSectionProps> = ({
  value,
  onChange,
}) => (
  <div className="px-6 py-5">
    <ReviewMediaTypeSelector value={value} onChange={onChange} />
  </div>
);

export default ProductFormReviewRequirementSection;
