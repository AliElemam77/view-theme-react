import { memo, useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VOfferCollectionProduct {
  id: number;
  name?: string;
  subtitle?: string;
  price?: number | string;
  regular_price?: number | string;
  sale_price?: number | string;
  starting_price?: number | string;
  is_on_sale?: boolean;
}

export interface VOfferCollectionFeature {
  feature_icon?: string;
  feature_text?: string;
}

export interface VOfferCollectionData {
  collection_bg_color?: string;
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  select_products_list?: VOfferCollectionProduct[];
  enable_collection_features?: boolean;
  collection_features?: VOfferCollectionFeature[];
  product_bg_image?: string;
  combined_products_image?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VOfferCollection = memo(function VOfferCollection({
  data,
}: {
  data?: VOfferCollectionData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const products = Array.isArray(data.select_products_list)
    ? data.select_products_list
    : [];
  const features = Array.isArray(data.collection_features)
    ? data.collection_features
    : [];

  const [isLoading, setIsLoading] = useState(false);

  // Price calculations
  const { regularTotal, offerTotal, discountPct } = useMemo(() => {
    let reg = 0;
    let off = 0;
    products.forEach((p) => {
      const price = parseFloat(String(p.is_on_sale ? p.regular_price : p.price)) || 0;
      const sale = parseFloat(String(p.sale_price)) || 0;
      reg += price;
      if (p.is_on_sale && sale > 0) {
        off += sale;
      } else {
        off += price;
      }
    });
    const pct = reg > 0 && off < reg ? Math.round(((reg - off) / reg) * 100) : 0;
    return { regularTotal: reg, offerTotal: off, discountPct: pct };
  }, [products]);

  const handleQuickAddAll = async () => {
    if (!products.length || isLoading) return;
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).salla?.cart?.quickAdd) {
        const ids = products.map((p) => p.id);
        await Promise.allSettled(ids.map((id) => (window as any).salla.cart.quickAdd(id)));
        if ((window as any).salla?.cart?.open) {
          (window as any).salla.cart.open();
        }
      }
    } catch (err) {
      console.error('Error adding bundle products to cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sectionStyle: CSSProperties = data.collection_bg_color
    ? { backgroundColor: data.collection_bg_color }
    : {};

  return (
    <SectionWrapper
      id={`V_offer_collection-${data.position ?? 0}`}
      ariaLabel="Section V_offer_collection"
      className="V_offer_collection"
      style={sectionStyle}
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative overflow-hidden py-6">
          {/* Left Column: Product breakdown & action */}
          <div className="w-full lg:w-1/2 gap-3 text-start flex justify-between h-auto flex-col">
            <BlockTitle
              title={data.main_title}
              sub={data.sub_title}
              jocer={data.has_jocer_image}
              className="!m-0"
            />

            <div className="gap-5 flex flex-col justify-between text-sm my-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2 collection-item"
                >
                  <div>
                    <h3 className="font-semibold text-darkgray text-base line-clamp-1">
                      {prod.name}
                    </h3>
                    {prod.subtitle && (
                      <p className="text-mediumgray text-xs line-clamp-1">
                        {prod.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex whitespace-nowrap gap-4 items-center">
                    {prod.is_on_sale ? (
                      <div className="space-s-2 whitespace-nowrap">
                        <span className="text-price font-bold md:text-lg text-base">
                          {prod.sale_price} SAR
                        </span>
                        <span className="text-mediumgray line-through opacity-85 font-semibold text-xs ms-1">
                          {prod.regular_price} SAR
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold md:text-lg text-base">
                        {prod.price} SAR
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between gap-3 flex-col mt-4">
              <button
                type="button"
                onClick={handleQuickAddAll}
                disabled={isLoading}
                className="fancy relative flex items-center justify-center p-3 rounded-theme bg-primary text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="s-button-loader w-5 h-5 rounded-full" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{t('pages.cart.get_group', 'الحصول على المجموعة')}</span>
                    {offerTotal > 0 && (
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {offerTotal.toFixed(2)} SAR
                      </span>
                    )}
                  </div>
                )}
              </button>

              {data.enable_collection_features && features.length > 0 && (
                <div className="flex-wrap flex items-center justify-center gap-4 text-xs mt-2">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1 text-darkgray">
                      <i className={feat.feature_icon || 'sicon-check'} />
                      <span>{feat.feature_text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Hero image & discount badge */}
          <div
            className="flex-shrink-0 flex items-end justify-center w-full lg:w-1/2 bg-contain bg-center bg-no-repeat"
            style={
              data.product_bg_image
                ? { backgroundImage: `url(${data.product_bg_image})` }
                : undefined
            }
          >
            <div className="relative">
              {discountPct > 0 && (
                <div
                  id="sescount"
                  className="absolute top-4 start-4 bg-gradient-to-tl from-primary to-bgcolor text-lightgray text-center w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold leading-tight z-10 shadow-md"
                >
                  <div>
                    {t('pages.products.discountma', 'خصم')}
                    <br />
                    {discountPct}%
                  </div>
                </div>
              )}
              {data.combined_products_image && (
                <img
                  src={data.combined_products_image}
                  alt={data.main_title || ''}
                  className="object-contain z-2 max-h-[450px]"
                  loading="lazy"
                  width={600}
                  height={600}
                />
              )}
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
