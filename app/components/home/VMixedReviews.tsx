import { memo } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { BlockTitle } from '../common/BlockTitle';
import { CouponPill } from '../common/CouponPill';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VMixedReviewItem {
  rating?: number | string;
  text_area?: string;
  main_image?: string;
  name?: string;
  jop_title?: string;
  ar?: { name?: string; jop_title?: string };
}

export interface VMixedReviewsData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_testimonials?: boolean;
  customers_rev?: unknown;
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
  [key: string]: unknown;
}

const QUOTES = 'https://cdn.salla.sa/form-builder/H27W3MSZUYy7fH294mp27NxXwjUI4yCNnTZUoy2B.webp';
const AVATAR = 'https://cdn.salla.sa/form-builder/6an3WnWlBeJBkBfu0hpS8HVKERWvmtQ2in4iKVSp.webp';

const num = (value: unknown) => Number(value) || 0;

/**
 * Twig's `avg|number_format(1, ',', '')`: one decimal, a comma as the separator.
 * `<salla-rating-stars value="4,5">` reads that attribute with `parseFloat`, so the
 * stars get the whole part only; `stars` keeps that.
 */
function formatAverage(avg: number) {
  const label = avg.toFixed(1).replace('.', ',');
  return { label, stars: parseFloat(label) || 0 };
}

/**
 * Port of `V_mixed_reviews.twig`: the average rating (a bar under `lg`, a side
 * column from `lg`) with the optional coupon, beside a `type="thumbs"` slider of
 * review cards (1 / 1.6 / 2 / 3 per view at 0 / 480 / 767 / 1024) with prev/next
 * and a progress-bar pagination row.
 */
export const VMixedReviews = memo(function VMixedReviews({ data = {} }: { data?: VMixedReviewsData }) {
  const { t } = useTranslation();
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const items = collectionItems<VMixedReviewItem>(data.customers_rev, 'customers_rev');
  const hasContainer = booleanValue(data.has_container, true);

  const total = items.reduce((sum, item) => sum + num(item.rating ?? 0), 0);
  const count = data.reviews_count ?? items.length;
  const avg = items.length > 0 ? total / items.length : 0;
  const { label, stars } = formatAverage(avg);
  const coupon = booleanValue(data.has_discount_code) && twigTruthy(data.discount_code);
  const code = text(data.discount_code);
  const couponLabel = text(data.discount_title);

  return (
    <section
      className={cx('s-block V__mixed_reviews', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_mixed_reviews-${position}`}
      id={`V_mixed_reviews-${position}`}
    >
      <div className={hasContainer ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          jocer={booleanValue(data.has_jocer_image)}
          more={booleanValue(data.show_more_testimonials)}
          moreAlt={t('blocks.header.allviw')}
          moreUrl="/testimonials"
        />
        <div
          className={cx(
            'rating lg:hidden mb-6 flex items-center justify-between rounded-theme bg-primaryops md:p-4 sm:p-3 p-2',
            reveal
          )}
        >
          <div className="flex items-baseline gap-1">
            <span className="sm:text-2xl text-lg font-bold text-darkgray">{label}</span>
            <span className="text-sm text-mediumgray ">/5</span>
          </div>
          <SallaRatingStars value={stars} size="mini" />
          <div className="sm:text-sm text-xs text-mediumgray ">
            {count} {t('blocks.header.rating')}
          </div>
          {coupon && <CouponPill code={code} label={couponLabel} />}
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <aside
            className={cx(
              'rating hidden lg:flex flex-1 flex-col items-center justify-between text-center rounded-theme bg-primaryops p-4',
              reveal
            )}
          >
            <div className="flex-col items-center justify-center text-center">
              <div className="text-6xl font-extrabold text-primary-d">
                {label}
                <span className="text-2xl align-top">/5</span>
              </div>
              <SallaRatingStars value={stars} size="medium" />
              <div className="mt-2 text-sm text-primary-d">
                {count} {t('blocks.header.rating')}
              </div>
            </div>
            {coupon && <CouponPill code={code} label={couponLabel} />}
          </aside>
          <div className="block lg:w-3/4 w-full">
            <SallaSlider
              id={`thumbs_mixed_reviews-${position}`}
              className="thumbs_mixed_reviews"
              autoHeight
              showControls={false}
              type="thumbs"
              sliderConfig={{
                loop: false,
                spaceBetween: 16,
                grabCursor: true,
                keyboard: { enabled: true },
                a11y: { enabled: true },
                navigation: {
                  nextEl: `#thumbs_mixed_reviews-${position} .swiper-button-next`,
                  prevEl: `#thumbs_mixed_reviews-${position} .swiper-button-prev`,
                },
                pagination: { el: `#thumbs_mixed_reviews-${position} .swiper-pagination`, type: 'progressbar' },
                breakpoints: {
                  0: { slidesPerView: 1 },
                  480: { slidesPerView: 1.6 },
                  767: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                },
              }}
            >
              <div slot="items">
                {items.map((item, index) => (
                  // A settings list without ids.
                  // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                  <article
                    key={index}
                    className={cx(
                      'backdrop-invert-[0.05] rounded-theme !h-full p-5 flex flex-col gap-2 justify-between',
                      reveal
                    )}
                  >
                    <div className="center-between">
                      <SallaRatingStars value={num(item.rating)} size="medium" />
                      <img
                        src={QUOTES}
                        alt="Quotes"
                        className="aspect-square lazy"
                        width={50}
                        height={50}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="auto"
                      />
                    </div>
                    <p className="text-mediumgray  md:text-base text-sm">{text(item.text_area)}</p>
                    <div className="mt-auto flex gap-3">
                      <img
                        src={text(item.main_image) || AVATAR}
                        alt={text(item.name)}
                        className="w-10 h-10 rounded-full object-contain lazy"
                        width={40}
                        height={40}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="auto"
                      />
                      <div>
                        <div className="font-semibold text-darkgray">{text(item.name ?? item.ar?.name ?? '')}</div>
                        <div className="text-sm text-mediumgray ">
                          {text(item.jop_title ?? item.ar?.jop_title ?? '')}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <div className="absolute left-0 bottom-0 flex items-center justify-between z-2 w-full flex-1">
                <div className="flex items-center md:gap-2 gap-1">
                  <div className="swiper-button-prev" />
                  <div className="swiper-button-next" />
                </div>
                <div className="swiper-pagination flex-1 !flex" />
              </div>
            </SallaSlider>
          </div>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
