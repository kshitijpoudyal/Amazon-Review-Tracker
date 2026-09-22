import React from 'react';
import { DEFAULT_REVIEW_MEDIA_TYPE, ReviewMediaType } from '../../types/Product';

const REVIEW_MEDIA_OPTIONS: { value: ReviewMediaType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
];

interface ReviewMediaTypeSelectorProps {
  value?: ReviewMediaType;
  onChange: (value: ReviewMediaType) => void;
}

export const ReviewMediaTypeSelector: React.FC<ReviewMediaTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  const current = value ?? DEFAULT_REVIEW_MEDIA_TYPE;

  return (
    <div>
      <p className="text-[10px] font-label uppercase tracking-widest text-[#74777f] mb-2">
        Review type required
      </p>
      <div className="flex gap-2">
        {REVIEW_MEDIA_OPTIONS.map(({ value: optionValue, label }) => {
          const isActive = current === optionValue;
          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onChange(optionValue)}
              className={`flex-1 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#006a68] text-white'
                  : 'bg-[#eae8e2] text-[#43474e] hover:bg-[#e4e2dd]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewMediaTypeSelector;
