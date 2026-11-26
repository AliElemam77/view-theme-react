import { memo } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { ProductCard } from '../product/ProductCard';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { cx, separatorProps, text, twigPosition, usePickedProducts } from './ViewBlockUtils';

export interface VProductBundleData {
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  add_gift_bow?: boolean;
  select_package_products?: unknown;
  highlight_center_item?: boolean | string | number;
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

const GIFT_BOW = 'https://cdn.salla.sa/form-builder/EvBD19WSHkiVYQ2ALvxE9pzwYmS9fCUvvxpNC9mL.webp';

/** Twig's `highlight_center`: `same as(true)`, or `== 1` / `'1'` / `'true'`. */
const isHighlightOn = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

/**
 * Port of `V_product_bundle.twig`: the gift bow over a carousel of product cards
 * (1.7 per view on mobile, all of them from 767px), the middle one (two when
 * even) optionally `centered` with a primary border.
 */
export const VProductBundle = memo(function VProductBundle({ data = {} }: { data?: VProductBundleData }) {
  const { reveal, spacing } = useViewSettings();
  const { isRTL } = useTheme();
  const position = twigPosition(data);
  const { products } = usePickedProducts(data.select_package_products);

  const total = products.length;
  const half = Math.floor(total / 2);
  const highlightCenter = isHighlightOn(data.highlight_center_item);
  // Twig's 1-based `loop.index`: odd → half + 1; even → half or half + 1.
  const isCentre = (index: number) =>
    highlightCenter && (total % 2 === 1 ? index === half + 1 : index === half || index === half + 1);

  return (
    <section
      className={cx('s-block V__product_bundle', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_product_bundle-${position}`}
      id={`V_product_bundle-${position}`}
    >
      <div className={cx(booleanValue(data.has_container) && 'container', 'relative block')}>
        <div className="flex relative">
          <BlockTitle
            title={text(data.main_title)}
            sub={text(data.sub_title)}
            jocer={booleanValue(data.has_jocer_image)}
            className="mb-6 !mx-0"
          />
        </div>
        {booleanValue(data.add_gift_bow) && (
          <div className={cx('block', reveal)}>
            <img
              src={GIFT_BOW}
              alt="separator"
              className={cx('absolute top-0 left-0 z-2 pointer-events-none lazy w-full', !isRTL && 'flip-x')}
              loading="lazy"
              width={1200}
              height="auto"
              decoding="async"
              fetchPriority="auto"
              style={{ marginTop: 'clamp(-2.813rem, 4.794rem - 8.4522vw, 2.813rem)' }}
            />
          </div>
        )}
        <div className="relative">
          {total > 0 && (
            <SallaSlider
              // Swiper reads the slides once: remount when the product count changes.
              key={total}
              id={`thumbs-collection-${position}`}
              showControls={false}
              type="carousel"
              sliderConfig={{
                spaceBetween: 10,
                breakpoints: { 0: { slidesPerView: 1.7 }, 767: { slidesPerView: total } },
              }}
            >
              <div slot="items">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={cx('!h-auto', reveal, isCentre(index + 1) && 'centered border border-primary')}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </SallaSlider>
          )}
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
