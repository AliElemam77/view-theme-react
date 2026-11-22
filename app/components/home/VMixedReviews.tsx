import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { CouponPill } from '../common/CouponPill';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VMixedReviewItem {
  rating?: number | string;
  text_area?: string;
  main_image?: string;
  name?: string;
  jop_title?: string;
}

export interface VMixedReviewsData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_testimonials?: boolean;
  customers_rev?: VMixedReviewItem[];
  reviews_count?: number;
  has_discount_code?: boolean;
  discount_code?: string;
  discount_title?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VMixedReviews = memo(function VMixedReviews({
  data,
}: {
  data?: VMixedReviewsData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const items = Array.isArray(data.customers_rev) ? data.customers_rev : [];
  if (!items.length) return null;

  const totalRating = items.reduce((acc, cur) => {
    const r = parseFloat(String(cur.rating || '5')) || 5;
    return acc + r;
  }, 0);
  const avgRating = (totalRating / items.length).toFixed(1);
  const count = data.reviews_count || items.length;

  const { discount_code: discountCode, discount_title: discountTitle } = data;

  return (
    <SectionWrapper
      id={`V_mixed_reviews-${data.position ?? 0}`}
      ariaLabel="Section V_mixed_reviews"
      className="V__mixed_reviews"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
          more={Boolean(data.show_more_testimonials)}
          moreUrl="/testimonials"
          moreAlt={t('blocks.header.allviw', 'عرض الكل')}
        />

        {/* Mobile rating banner */}
        <div className="rating lg:hidden mb-6 flex items-center justify-between rounded-theme bg-primaryops md:p-4 sm:p-3 p-3">
          <div className="flex items-baseline gap-1">
            <span className="sm:text-2xl text-lg font-bold text-darkgray">
              {avgRating}
            </span>
            <span className="text-sm text-mediumgray">/5</span>
          </div>

          <div className="flex items-center text-primary text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`sicon-star2 ${
                  i < Math.round(parseFloat(avgRating))
                    ? 'text-primary'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="sm:text-sm text-xs text-mediumgray">
            {count} {t('blocks.header.rating', 'تقييم')}
          </div>

          {data.has_discount_code && discountCode && (
            <CouponPill code={discountCode} label={discountTitle} />
          )}
        </div>

        {/* Main reviews content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop rating sidebar */}
          <aside className="rating hidden lg:flex flex-col items-center justify-between text-center rounded-theme bg-primaryops p-6 w-1/4 shrink-0">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-6xl font-extrabold text-primary-d">
                {avgRating}
                <span className="text-2xl align-top">/5</span>
              </div>

              <div className="flex items-center text-primary text-xl my-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={`sicon-star2 ${
                      i < Math.round(parseFloat(avgRating))
                        ? 'text-primary'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <div className="mt-2 text-sm text-primary-d font-medium">
                {count} {t('blocks.header.rating', 'تقييم')}
              </div>
            </div>

            {data.has_discount_code && discountCode && (
              <div className="mt-6 w-full">
                <CouponPill
                  code={discountCode}
                  label={discountTitle}
                />
              </div>
            )}
          </aside>

          {/* Reviews cards carousel / scroller */}
          <div className="block lg:w-3/4 w-full overflow-x-auto pb-4">
            <div className="flex gap-4 items-stretch flex-nowrap">
              {items.map((tItem, idx) => {
                const itemRating = parseFloat(String(tItem.rating || '5')) || 5;

                return (
                  <article
                    key={idx}
                    className="backdrop-invert-[0.05] bg-bgcolor border border-lightgray rounded-theme p-5 flex flex-col justify-between gap-4 w-[280px] md:w-[320px] shrink-0 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-primary text-sm">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <i
                            key={sIdx}
                            className={`sicon-star2 ${
                              sIdx < Math.round(itemRating)
                                ? 'text-primary'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-3xl text-primary opacity-30 font-serif leading-none">
                        "
                      </span>
                    </div>

                    <p className="text-mediumgray md:text-base text-sm line-clamp-4">
                      {tItem.text_area}
                    </p>

                    <div className="mt-auto flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <img
                        src={
                          tItem.main_image ||
                          'https://cdn.salla.sa/form-builder/6an3WnWlBeJBkBfu0hpS8HVKERWvmtQ2in4iKVSp.webp'
                        }
                        alt={tItem.name || ''}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                        loading="lazy"
                        width={40}
                        height={40}
                      />
                      <div>
                        <div className="font-semibold text-darkgray text-sm">
                          {tItem.name}
                        </div>
                        {tItem.jop_title && (
                          <div className="text-xs text-mediumgray">
                            {tItem.jop_title}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
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
