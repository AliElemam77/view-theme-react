import { memo, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

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
  customers_rev?: unknown;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const ARROW =
  'M18.288.789V.79l.001.003.005.013.015.043.057.158c.05.135.123.329.22.565.196.472.49 1.122.88 1.838.77 1.413 1.967 3.164 3.617 4.264.666.444 1.355.815 2.023 1.126H0v1.5h25.107a15 15 0 0 0-2.023 1.126c-1.65 1.1-2.846 2.851-3.617 4.265a19 19 0 0 0-.88 1.838c-.097.236-.17.43-.22.564l-.057.158-.015.043-.005.013v.006l1.421.475v-.001l.003-.007.012-.032.047-.135a17.777 17.777 0 0 1 1.01-2.203c.73-1.337 1.783-2.836 3.133-3.736 1.417-.945 2.967-1.543 4.175-1.905.6-.18 1.111-.3 1.469-.375a13 13 0 0 1 .542-.1l.005-.002-.053-.742.052-.742h-.004l-.13-.022a12 12 0 0 1-.412-.08 18 18 0 0 1-1.47-.374c-1.207-.363-2.757-.96-4.174-1.906-1.35-.9-2.404-2.399-3.133-3.735a18 18 0 0 1-1.01-2.203l-.047-.135-.012-.032-.002-.007-.001-.001z';

function Arrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="31" height="19" fill="none">
      {/* Twig's typo (`ver(...)`) is kept: the invalid fill gives way to home.scss `svg { fill-primary }`. */}
      <path fill="ver(--color-primary)" d={ARROW} />
    </svg>
  );
}

/**
 * home.js `vinjp`'s id parsing of `data-pro-id` (the `product` field as JSON):
 * the first entry of a list, a numeric string as a number. Picked options
 * (`{ id }` / `{ value }`) are read too.
 */
function productId(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  const raw =
    first && typeof first === 'object'
      ? ((first as { id?: unknown; value?: unknown }).id ?? (first as { value?: unknown }).value)
      : first;
  if (raw === undefined || raw === null) return null;
  const id = String(raw).trim();
  return id ? id : null;
}

/** The image of a product the field carries in full (the preview's data), not just its id. */
function embeddedImage(value: unknown): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const image = (first as { image?: { url?: unknown } | null } | null | undefined)?.image;
  return typeof image?.url === 'string' ? image.url : undefined;
}

/**
 * home.js `vinjp`: the holder shows a loader until it is 40% in view (150px
 * margin), then loads the product's details and adds its first image, which
 * fades in (`opacity-0` → 1) and gives the holder the `after_effect` sweep.
 */
function ProductImageHolder({ product }: { product: unknown }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const id = productId(product);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            io.disconnect();
            setVisible(true);
            break;
          }
        }
      },
      { root: null, threshold: 0.4, rootMargin: '150px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  const { data: details, isFetched } = useQuery({
    ...productApi.queries.detail(id ?? ''),
    enabled: visible && !!id,
    retry: false,
  });
  // The embedded image only stands in when the details have none (a product of another store).
  const image = details?.images?.[0]?.url ?? (isFetched ? (details?.image?.url ?? embeddedImage(product)) : undefined);

  return (
    <div
      ref={ref}
      className={cx('flex-center relative overflow-hidden w-1/3 max-w-60 max-h-96', loaded && 'after_effect')}
      data-pro-id={JSON.stringify(product ?? null)}
    >
      {(!visible || (!loaded && (!!image || !isFetched))) && <div className="s-button-loader" />}
      {image && (
        <img
          src={image}
          alt={details?.name || ''}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          data-injected="true"
          className="aspect-[1/1.56] w-full h-full object-contain opacity-0 transition-opacity duration-200"
          style={loaded ? { opacity: 1 } : undefined}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

/**
 * Port of `V_reviews_with_product.twig` + home.js `vinjp`: a fading, autoplaying
 * `<salla-slider>` of reviews, each beside its product's lazily loaded image, with
 * the arrow / dynamic-bullet column (`.V__arows` styles in home.scss).
 */
export const VReviewsWithProduct = memo(function VReviewsWithProduct({
  data = {},
}: {
  data?: VReviewsWithProductData;
}) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const reviews = collectionItems<VReviewProductItem>(data.customers_rev, 'customers_rev');

  return (
    <section
      className={cx('s-block V__reviews_with_product V__arows', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_reviews_with_product-${position}`}
      id={`V_reviews_with_product-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <SallaSlider
          id={`V__reviews_with_product-${position}`}
          className="md:px-4"
          showControls={false}
          type="carousel"
          sliderConfig={{
            effect: 'fade',
            speed: 5000,
            autoplay: { delay: 5000 },
            slidesPerView: 1,
            pagination: {
              el: `#V__reviews_with_product-${position} .swiper-pagination`,
              dynamicBullets: true,
              clickable: true,
            },
            navigation: {
              nextEl: `#V__reviews_with_product-${position} .swiper-button-next`,
              prevEl: `#V__reviews_with_product-${position} .swiper-button-prev`,
            },
          }}
        >
          <div slot="items">
            {reviews.map((item, index) => (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <div key={index} className={cx('review-card px-4 flex md:gap-8 gap-3 bg-bgcolor justify-center', reveal)}>
                <ProductImageHolder product={item.product} />
                <div className="flex flex-col justify-evenly w-2/3">
                  <p className="text-sm text-primary-l leading-none">{text(item.pro_title)}</p>
                  <SallaRatingStars
                    size="large"
                    value={Number(item.rating) || 0}
                    style={{ color: 'var(--color-primary)' }}
                  />
                  <p className="text-primary-d md:text-4xl sm:text-lg text-base font-medium">{text(item.text_area)}</p>
                  <p className="text-sm text-primary-l leading-none">{text(item.name)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-center gap-2 md:flex-col flex-row-reverse reviews_with_product ">
            <div className="swiper-button-prev flip-x">
              <Arrow />
            </div>
            <div className="swiper-pagination !relative !inset-0 !translate-x-0 md:!w-3 flex-center md:!flex-col" />
            <div className="swiper-button-next">
              <Arrow />
            </div>
          </div>
        </SallaSlider>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
