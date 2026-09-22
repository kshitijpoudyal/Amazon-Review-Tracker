import React from 'react';
import { Product } from '../../types/Product';

interface ReviewMediaBadgeProps {
  reviewMediaType?: Product['reviewMediaType'];
  show: boolean;
}

export const ReviewMediaBadge: React.FC<ReviewMediaBadgeProps> = ({
  reviewMediaType,
  show,
}) => {
  if (!show || !reviewMediaType || reviewMediaType === 'text') return null;

  const label = reviewMediaType === 'photo' ? '📷 Photo' : '🎬 Video';

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#eae8e2] text-[#43474e]">
      {label}
    </span>
  );
};

export default ReviewMediaBadge;
