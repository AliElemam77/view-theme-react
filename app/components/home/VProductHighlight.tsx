import { memo, useEffect, useRef } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, optionValue } from '../../lib/fieldValue';
import {
  collectionItems,
  cx,
  separatorProps,
  text,
  twigPosition,
  usePickedProducts,
} from './ViewBlockUtils';

export interface VHighlightMarqueeItem {
  text?: string;
  discount_value?: number | string;
}

export interface VProductHighlightData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  highlight_product?: unknown;
  marquee_effect_items?: unknown;
  add_mask?: boolean;
  media_type?: unknown;
  video_ur?: string;
  product_expressive_image?: string;
  enable_overlay_layer?: boolean;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const PLACEHOLDER = '/images/placeholder.webp';

/**
 * Twig's `p.discount_percentage`. The API declares it but does not send it, so it is
 * derived from the prices the way the Twig product object computes it.
 */
function discountPercentage(p: Product): number {
  const sent = Number(p.discount_percentage);
  if (Number.isFinite(sent) && sent > 0) return sent;
  const regular = Number(p.regular_price);
  const sale = Number(p.sale_price);
  if (!(regular > 0) || !(sale > 0) || sale >= regular) return 0;
  return ((regular - sale) / regular) * 100;
}

/**
 * Port of `V_product_highlight.twig`: the picked product with its badge, four
 * free-mode `<salla-slider>` tickers (speed 8000) running in alternating directions,
 * and the image / video column.
 */
export const VProductHighlight = memo(function VProductHighlight({
  data = {},
}: {
  data?: VProductHighlightData;
}) {
  const { t } = useTranslation();
  const { reveal, spacing } = useViewSettings();
  const videoRef = useRef<HTMLVideoElement>(null);

  const position = twigPosition(data);
  const { products } = usePickedProducts(data.highlight_product);
  const marqueeItems = collectionItems<VHighlightMarqueeItem>(data.marquee_effect_items, 'marquee_effect_items');
  const mediaType = optionValue(data.media_type);
  const video = text(data.video_ur);
  const showVideo = mediaType === 'video' && video !== '';
  const addMask = booleanValue(data.add_mask);

  // React does not emit `muted` in SSR; autoplay needs it.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = true;
    el.play().catch(() => {});
  }, [showVideo, video]);

  return (
    <section
      className={cx('s-block V__product_highlight', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_product_highlight-${position}`}
      id={`V_product_highlight-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          jocer={booleanValue(data.has_jocer_image)}
        />
        <div className="items-stretch md:flex-row flex-col flex overflow-hidden gap-3">
          <div className="flex  items-stretch justify-between gap-3 h-auto flex-1 md:w-1/2">
            <div className="h-auto flex-1">
              {products.map((p) => {
                const discount = discountPercentage(p);
                return (
                  <div
                    key={p.id}
                    className={cx('relative backdrop-invert-[0.1] flex-center rounded-theme overflow-hidden h-full', reveal)}
                    data-id={p.id}
                  >
                    <div className="s-product-card-promotion-title !bg-primary">
                      {discount
                        ? `${t('blocks.header.discountma')} ${Math.round(discount)}%`
                        : text(p.promotion_title)}
                    </div>
                    <img
                      src={p.image?.url || PLACEHOLDER}
                      alt={p.image?.alt || 'product-image'}
                      className={reveal || undefined}
                      width={600}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="auto"
                    />
                  </div>
                );
              })}
            </div>
            <div className={cx('flex-col flex justify-between h-auto bg-primary-d flex-1 overflow-hidden', reveal)}>
              {[1, 2, 3, 4].map((index) => {
                const odd = index % 2 === 1;
                const isReverse = (position + index) % 2 === 1;
                const kind = isReverse ? 'reverse' : 'standard';
                const dir = odd ? 'ltr' : 'rtl';
                return (
                  <SallaSlider
                    key={index}
                    id={`carousel-player-${position}-${index}-${kind}`}
                    direction={dir}
                    className={cx(addMask && 'add_mask', 'py-2 overflow-hidden')}
                    aria-label={`player  Carousel ${kind}`}
                    centered
                    loop
                    showControls={false}
                    type="carousel"
                    dir={dir}
                    sliderConfig={{
                      spaceBetween: 20,
                      grabCursor: false,
                      loop: true,
                      slidesPerView: 'auto',
                      shortSwipes: false,
                      longSwipes: false,
                      autoplay: { delay: 1 },
                      freeMode: true,
                      speed: 8000,
                    }}
                  >
                    <div slot="items">
                      {marqueeItems.map((item, idx) => (
                        // A settings list without ids.
                        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                        <div
                          key={idx}
                          className="flex-center text-6xl font-bold text-lightgray dark:text-darkgray carbon:text-darkgray"
                        >
                          <span>{text(item.text)}</span>
                          <span className="aspect-square leading-none text-base p-3 text-primary-d bg-lightgray dark:bg-darkgray carbon:bg-darkgray -rotate-12 rounded-full flex-center flex-col">
                            {text(item.discount_value)}%
                            <b className="block leading-none">{t('blocks.header.discountma')}</b>
                          </span>
                        </div>
                      ))}
                    </div>
                  </SallaSlider>
                );
              })}
            </div>
          </div>
          {mediaType !== 'none' && (
            <div className={cx('h-auto flex-1', booleanValue(data.enable_overlay_layer) && 'ass has-overlay relative')}>
              {showVideo ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  loop
                  playsInline
                  webkit-playsinline="true"
                  className="w-full h-full bg-primary-reverse rounded-theme object-center object-cover aspect-video"
                  tabIndex={0}
                >
                  <source src={video} />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={text(data.product_expressive_image) || PLACEHOLDER}
                  alt="image"
                  className="w-full h-full bg-primary-reverse rounded-theme object-center object-cover aspect-video"
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="auto"
                />
              )}
            </div>
          )}
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
