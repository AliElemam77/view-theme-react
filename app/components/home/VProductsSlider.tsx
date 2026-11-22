import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { CouponPill } from '../common/CouponPill';
import { SectionSeparator } from '../common/SectionSeparator';
import { ProductCard } from '../product/ProductCard';
import { blockLimit } from '../../lib/blockLimit';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface VProductsSliderData {
  type?: string;
  categories?: Array<{ id: number; url?: string }>;
  products?: Array<{ id: number }>;
  products_tags?: Array<{ id: number; tags?: Array<{ url?: string }> }>;
  enable_grid_layout?: boolean;
  limit_products?: number | string;
  auto_loader?: boolean;
  has_discount_code?: boolean;
  discount_code?: string;
  discount_title?: string;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_prduct?: boolean;
  btn_url_one?: unknown;
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

export const VProductsSlider = memo(function VProductsSlider({
  data,
}: {
  data?: VProductsSliderData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const sourceType = (data.type || 'latest') as ProductsListSource;
  const limit = blockLimit(data.limit_products) || 8;
  const isGrid = Boolean(data.enable_grid_layout);

  let sourceValue: number | number[] | undefined;
  if (sourceType === 'categories' && data.categories?.length) {
    sourceValue = data.categories.map((c) => c.id);
  } else if (sourceType === 'selected' && data.products?.length) {
    sourceValue = data.products.map((p) => p.id);
  }

  const { data: result, isSuccess } = useQuery({
    ...product.queries.list({ source: sourceType, sourceValue, perPage: limit }),
    enabled: !!sourceType,
  });

  const items: Product[] = (result?.items?.slice(0, limit) || []) as Product[];

  // More URL resolution
  let moreUrl = linkUrl(data.btn_url_one);
  if (!moreUrl) {
    if (sourceType === 'offers') moreUrl = '/offers';
    else if (sourceType === 'latest') moreUrl = '/products?sort=latest';
    else if (sourceType === 'categories' && data.categories?.[0]?.url) moreUrl = data.categories[0].url;
    else moreUrl = '/products';
  }

  const { discount_code: discountCode, discount_title: discountTitle } = data;

  return (
    <SectionWrapper
      id={`V_products_slider-${data.position ?? 0}`}
      ariaLabel="Section V_products_slider"
      className="V_products_slider"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <BlockTitle
            title={data.main_title}
            sub={data.sub_title}
            jocer={data.has_jocer_image}
            more={Boolean(data.show_more_prduct)}
            moreUrl={moreUrl}
            moreAlt={t('blocks.header.showall', 'عرض الكل')}
            className="!mb-0"
          />

          {data.has_discount_code && discountCode && (
            <CouponPill code={discountCode} label={discountTitle} />
          )}
        </div>

        {isSuccess && items.length > 0 ? (
          isGrid ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((prod) => (
                <div key={prod.id} className="h-full">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 items-stretch flex-nowrap">
                {items.map((prod) => (
                  <div key={prod.id} className="w-[220px] md:w-[260px] shrink-0 h-full">
                    <ProductCard product={prod} />
                  </div>
                ))}
              </div>
            </div>
          )
        ) : null}
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
