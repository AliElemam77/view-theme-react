import { memo, useState, useEffect } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VReviewProductItem {
  product?: unknown;
  pro_title?: string;
  rating?: number | string;
  text_area?: string;
  name?: string;
}

export interface VReviewsWithProductData {
  has_container?: boolean;
  notmrb?: boolean;
  customers_rev?: VReviewProductItem[];
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VReviewsWithProduct = memo(function VReviewsWithProduct({
  data,
}: {
  data?: VReviewsWithProductData;
}) {
  if (!data) return null;

  const reviews = Array.isArray(data.customers_rev) ? data.customers_rev : [];
  if (!reviews.length) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const current = reviews[currentIndex] || reviews[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : reviews.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  };

  const ratingNum = typeof current?.rating === 'number'
    ? current.rating
    : parseFloat(String(current?.rating || '5')) || 5;

  return (
    <SectionWrapper
      id={`V_reviews_with_product-${data.position ?? 0}`}
      ariaLabel="Section V_reviews_with_product"
      className="V__reviews_with_product V__arows"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <div className="md:px-4 relative">
          <div className="review-card px-4 flex md:gap-8 gap-3 bg-bgcolor justify-center items-center py-8 rounded-theme shadow-sm">
            <div className="flex items-center justify-center relative overflow-hidden w-1/3 max-w-60 max-h-96 aspect-[1/1.56] bg-primaryops rounded-theme p-4">
              <img
                src="/images/placeholder.webp"
                alt={current.pro_title || 'Product'}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>

            <div className="flex flex-col justify-evenly w-2/3 gap-3">
              {current.pro_title && (
                <p className="text-sm text-primary-l leading-none">{current.pro_title}</p>
              )}

              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`sicon-star2 text-lg ${
                      i < ratingNum ? 'text-primary' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {current.text_area && (
                <p className="text-primary-d md:text-4xl sm:text-lg text-base font-medium">
                  {current.text_area}
                </p>
              )}

              {current.name && (
                <p className="text-sm text-primary-l leading-none font-semibold">
                  {current.name}
                </p>
              )}
            </div>
          </div>

          {reviews.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handlePrev}
                className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Previous review"
              >
                <i className="sicon-arrow-right rtl:rotate-180" />
              </button>

              <div className="flex gap-1">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-primary w-6' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to review ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="p-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                aria-label="Next review"
              >
                <i className="sicon-arrow-left rtl:rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>

      <SectionSeparator
        saprator={optionValue(data.saprator)}
        merge_with_adjacent={Boolean(data.merge_with_adjacent)}
        use_custom_colors={Boolean(data.use_custom_colors)}
        line_color={data.line_color}
        star_color={data.star_color}
        star_position_x={data.star_position_x}
      />
    </SectionWrapper>
  );
});
