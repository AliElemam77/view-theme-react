import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { Marquee } from '../common/Marquee';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VHighlightProductItem {
  id: number;
  discount_percentage?: number;
  promotion_title?: string;
  image?: {
    url?: string;
    alt?: string;
  };
}

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
  highlight_product?: VHighlightProductItem[];
  marquee_effect_items?: VHighlightMarqueeItem[];
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
}

export const VProductHighlight = memo(function VProductHighlight({
  data,
}: {
  data?: VProductHighlightData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const products = Array.isArray(data.highlight_product) ? data.highlight_product : [];
  const marqueeItems = Array.isArray(data.marquee_effect_items) ? data.marquee_effect_items : [];
  const mediaType = optionValue(data.media_type) || 'image';

  return (
    <SectionWrapper
      id={`V_product_highlight-${data.position ?? 0}`}
      ariaLabel="Section V_product_highlight"
      className="V__product_highlight"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
        />

        <div className="items-stretch md:flex-row flex-col flex overflow-hidden gap-3">
          <div className="flex items-stretch justify-between gap-3 h-auto flex-1 md:w-1/2">
            {/* Highlight product photo & badge */}
            <div className="h-auto flex-1">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="relative backdrop-invert-[0.1] flex items-center justify-center rounded-theme overflow-hidden h-full p-4"
                  data-id={p.id}
                >
                  <div className="s-product-card-promotion-title !bg-primary absolute top-3 start-3 text-white text-xs px-2 py-1 rounded">
                    {p.discount_percentage ? (
                      <>
                        {t('blocks.header.discountma', 'خصم')}{' '}
                        {Math.round(p.discount_percentage)}%
                      </>
                    ) : (
                      p.promotion_title
                    )}
                  </div>
                  <img
                    src={p.image?.url || '/images/placeholder.webp'}
                    alt={p.image?.alt || 'product-image'}
                    className="max-h-80 object-contain"
                    width={600}
                    height={600}
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Marquee ticker column */}
            <div className="flex flex-col justify-between h-auto bg-primary-d flex-1 overflow-hidden rounded-theme py-4">
              {[0, 1, 2, 3].map((rowIndex) => (
                <Marquee
                  key={rowIndex}
                  reverse={rowIndex % 2 !== 0}
                  speed={20}
                  addMask={Boolean(data.add_mask)}
                  className="py-1"
                >
                  {marqueeItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-3xl md:text-5xl font-bold text-lightgray dark:text-darkgray carbon:text-darkgray mx-4 shrink-0"
                    >
                      <span>{item.text}</span>
                      {item.discount_value && (
                        <span className="aspect-square leading-none text-xs p-2 text-primary-d bg-lightgray dark:bg-darkgray carbon:bg-darkgray -rotate-12 rounded-full flex items-center justify-center flex-col">
                          {item.discount_value}%
                          <b className="block leading-none text-[10px]">
                            {t('blocks.header.discountma', 'خصم')}
                          </b>
                        </span>
                      )}
                    </div>
                  ))}
                </Marquee>
              ))}
            </div>
          </div>

          {/* Media Column */}
          {mediaType !== 'none' && (
            <div
              className={`h-auto flex-1 ${
                data.enable_overlay_layer ? 'ass has-overlay relative' : ''
              }`}
            >
              {mediaType === 'video' && data.video_ur ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full bg-primary-reverse rounded-theme object-center object-cover aspect-video"
                >
                  <source src={data.video_ur} />
                </video>
              ) : (
                <img
                  src={data.product_expressive_image || '/images/placeholder.webp'}
                  alt="image"
                  className="w-full h-full bg-primary-reverse rounded-theme object-center object-cover aspect-video"
                  width={1280}
                  height={720}
                  loading="lazy"
                />
              )}
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
