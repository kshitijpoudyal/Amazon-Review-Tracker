import React from 'react';
import { PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types/Product';
import { getReviewMediaBadgeClasses } from '../../utils/colors';

interface ReviewMediaBadgeProps {
  reviewMediaType?: Product['reviewMediaType'];
  show: boolean;
}

export const ReviewMediaBadge: React.FC<ReviewMediaBadgeProps> = ({
  reviewMediaType,
  show,
}) => {
  if (!show || !reviewMediaType || reviewMediaType === 'text') return null;

  const isPhoto = reviewMediaType === 'photo';
  const Icon = isPhoto ? PhotoIcon : VideoCameraIcon;

  return (
    <span className={getReviewMediaBadgeClasses(reviewMediaType)}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {isPhoto ? 'Photo' : 'Video'}
    </span>
  );
};

export default ReviewMediaBadge;
