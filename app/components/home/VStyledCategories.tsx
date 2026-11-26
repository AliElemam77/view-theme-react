import { memo } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { BlockTitle } from '../common/BlockTitle';
import { CouponPill } from '../common/CouponPill';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl } from '../../lib/fieldValue';
import {
  asArray,
  collectionItems,
  cx,
  separatorProps,
  text,
  twigDefaultTrue,
  twigPosition,
  twigTruthy,
} from './ViewBlockUtils';

export interface VStyledCategoryItem {
  id?: number | string;
  name?: string;
  url?: unknown;
  image?: string;
  category_image?: string;
  [key: string]: unknown;
}

export interface VStyledCategoriesData {
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  has_discount_code?: boolean;
  discount_code?: string;
  discount_title?: string;
  enable_grid_layout?: boolean;
  enable_repetition?: boolean;
  enable_auto_scroll?: boolean;
  enable_navigation_dots?: boolean;
  enable_store_categories?: boolean;
  select_store_categories?: unknown;
  custom_categories?: unknown;
  element_border_radius?: number | string;
  has_decorative_stars?: boolean;
  has_stars?: boolean;
  show_category_name?: boolean;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const STAR =
  'M16.4236 0L17.9707 4.66854C19.5694 9.49293 23.3543 13.2778 28.1787 14.8766L32.8473 16.4236L28.1787 17.9707C23.3543 19.5694 19.5694 23.3543 17.9707 28.1787L16.4236 32.8473L14.8766 28.1787C13.2778 23.3543 9.49293 19.5694 4.66854 17.9707L0 16.4236L4.66854 14.8766C9.49293 13.2778 13.2778 9.49293 14.8766 4.66854L16.4236 0Z';

function Star({ side }: { side: '-left-3' | '-right-3' }) {
  return (
    <svg
      width="33"
      height="33"
      viewBox="0 0 33 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`absolute top-1/2 -translate-y-1/2 w-6 ${side}`}
    >
      <path d={STAR} fill="var(--color-primary)" />
    </svg>
  );
}

/**
 * Port of `V_styled_categories.twig`: title + coupon beside a `thumbs`
 * `<salla-slider>` of bordered category tiles (loop, optional continuous
 * autoplay, progress-bar pagination and arrows), or a wrapped grid.
 */
export const VStyledCategories = memo(function VStyledCategories({
  data = {},
}: {
  data?: VStyledCategoriesData;
}) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const isGrid = booleanValue(data.enable_grid_layout);
  const fromStore = booleanValue(data.enable_store_categories) && twigTruthy(data.select_store_categories);
  const categories = fromStore
    ? asArray<VStyledCategoryItem>(data.select_store_categories)
    : collectionItems<VStyledCategoryItem>(data.custom_categories, 'custom_categories');

  const rawRadius = data.element_border_radius;
  const hasRadius = rawRadius !== undefined && rawRadius !== null && rawRadius !== '';
  const radius = hasRadius ? `${rawRadius}px` : undefined;
  const innerRadius = hasRadius ? `${Number(rawRadius) - 10}px` : undefined;
  const showStars = twigDefaultTrue(
    data.has_decorative_stars !== undefined ? data.has_decorative_stars : data.has_stars
  );
  const showName = booleanValue(data.show_category_name);
  const discountCode = text(data.discount_code);

  const tiles = categories.map((item, index) => {
    const name = text(item.name);
    const image = fromStore ? text(item.image) : text(item.category_image);
    return (
      <div
        key={item.id ?? index}
        className={cx(
          isGrid && 'res-quer',
          'flex-center relative flex-col !items-center md:gap-5 gap-3',
          reveal
        )}
      >
        <div className="sm:p-3 p-1.5 border border-primary relative" style={{ borderRadius: radius }}>
          <Link
            to={linkUrl(item.url) || '#'}
            className="shine block"
            aria-label={name}
            style={{ borderRadius: radius }}
          >
            <div
              className="Tira__cat_after aspect-[1.565/1] bg-primaryops border-primary"
              style={{ borderRadius: innerRadius }}
            >
              <img
                src={image || '/images/placeholder.webp'}
                alt={name}
                className="z-1 relative lazy"
                aria-hidden="true"
                width={300}
                height={300}
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
              />
            </div>
          </Link>
          {showStars && (
            <>
              <Star side="-left-3" />
              <Star side="-right-3" />
            </>
          )}
        </div>
        {showName && <b className="text-primary-d">{name}</b>}
      </div>
    );
  });

  const sliderId = `V_styled_categories_slider-${position}`;
  const autoScroll = booleanValue(data.enable_auto_scroll);
  const sliderConfig = {
    pagination: { el: `#${sliderId} .swiper-pagination`, type: 'progressbar' },
    navigation: { nextEl: `#${sliderId} .swiper-button-next`, prevEl: `#${sliderId} .swiper-button-prev` },
    loop: booleanValue(data.enable_repetition),
    autoHeight: true,
    ...(autoScroll ? { speed: 5500, autoplay: { delay: 0 } } : {}),
    breakpoints: {
      0: { slidesPerView: 2, slidesPerGroup: 1 },
      480: { slidesPerView: 3, slidesPerGroup: 1 },
      767: { slidesPerView: 4, slidesPerGroup: 1 },
      1125: { slidesPerView: 4.5, slidesPerGroup: 1 },
    },
  };

  return (
    <section
      className={cx('s-block V__styled_categories', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_styled_categories-${position}`}
      id={`V_styled_categories-${position}`}
    >
      <div
        className={cx(
          booleanValue(data.has_container) && 'container',
          'overflow-hidden flex',
          isGrid ? 'flex-col' : 'flex-col md:flex-row',
          'justify-between gap-3'
        )}
      >
        <div
          className={cx(
            'flex',
            isGrid ? 'items-center' : 'md:items-start items-center',
            'flex-col justify-between gap-3 flex-1'
          )}
        >
          <BlockTitle
            title={text(data.main_title)}
            sub={text(data.sub_title)}
            jocer={booleanValue(data.has_jocer_image)}
            className="!m-0"
            level2Class={isGrid ? '!justify-center' : 'md:justify-start justify-center'}
          />
          {booleanValue(data.has_discount_code) && discountCode && (
            <CouponPill code={discountCode} label={text(data.discount_title)} />
          )}
        </div>
        {isGrid ? (
          <div className="flex justify-center items-center md:gap-6 gap-5 flex-wrap">{tiles}</div>
        ) : (
          <div className="block lg:w-3/4 md:w-2/3">
            <SallaSlider
              id={sliderId}
              showControls={false}
              type="thumbs"
              sliderConfig={sliderConfig}
            >
              <div slot="items">{tiles}</div>
              {booleanValue(data.enable_navigation_dots) && (
                <div className="absolute left-0 bottom-0 flex items-center justify-between z-2 w-full flex-1">
                  <div className="flex items-center md:gap-2 gap-1">
                    <div className="swiper-button-prev" />
                    <div className="swiper-button-next" />
                  </div>
                  <div className="swiper-pagination flex-1 !flex" />
                </div>
              )}
            </SallaSlider>
          </div>
        )}
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
