import { memo } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { ProductCard } from '../product/ProductCard';
import { optionValue, booleanValue } from '../../lib/fieldValue';

export interface VProductBundleData {
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  add_gift_bow?: boolean;
  select_package_products?: Product[];
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
}

export const VProductBundle = memo(function VProductBundle({
  data,
}: {
  data?: VProductBundleData;
}) {
  if (!data) return null;

  const products = Array.isArray(data.select_package_products)
    ? data.select_package_products
    : [];
  const total = products.length;
  const midIndex = Math.floor(total / 2);
  const isOdd = total % 2 !== 0;
  const highlightCenter = booleanValue(data.highlight_center_item);

  return (
    <SectionWrapper
      id={`V_product_bundle-${data.position ?? 0}`}
      ariaLabel="Section V_product_bundle"
      className="V__product_bundle"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={`${data.has_container !== false ? 'container' : ''} relative block`}>
        <div className="flex relative">
          <BlockTitle
            title={data.main_title}
            sub={data.sub_title}
            jocer={data.has_jocer_image}
            className="mb-6 !mx-0"
          />
        </div>

        {data.add_gift_bow && (
          <div className="block">
            <img
              src="https://cdn.salla.sa/form-builder/EvBD19WSHkiVYQ2ALvxE9pzwYmS9fCUvvxpNC9mL.webp"
              alt="separator"
              className="absolute top-0 left-0 z-2 pointer-events-none w-full"
              loading="lazy"
              width={1200}
              height={100}
              style={{
                marginTop: 'clamp(-2.813rem, 4.794rem - 8.4522vw, 2.813rem)',
              }}
            />
          </div>
        )}

        <div className="relative overflow-x-auto pb-4">
          <div className="flex gap-4 items-stretch justify-center flex-nowrap md:flex-wrap">
            {products.map((prod, idx) => {
              const isCentered =
                highlightCenter &&
                ((isOdd && idx === midIndex) ||
                  (!isOdd && (idx === midIndex - 1 || idx === midIndex)));

              return (
                <div
                  key={prod.id ?? idx}
                  className={`!h-auto shrink-0 w-[240px] md:w-[280px] rounded-theme transition-all ${
                    isCentered ? 'centered border-2 border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  <ProductCard product={prod} />
                </div>
              );
            })}
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
