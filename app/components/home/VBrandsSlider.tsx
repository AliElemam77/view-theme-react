import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { Marquee } from '../common/Marquee';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VBrandItem {
  id?: number | string;
  name?: string;
  logo?: string;
  url?: string;
}

export interface VBrandsSliderData {
  main_title?: string;
  sub_title?: string;
  show_brands_button?: boolean;
  has_jocer_image?: boolean;
  add_mask?: boolean;
  brands?: VBrandItem[];
  duplcate_brands?: boolean;
  invert_image_dark?: boolean;
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

export const VBrandsSlider = memo(function VBrandsSlider({
  data,
}: {
  data?: VBrandsSliderData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const brands = Array.isArray(data.brands) ? data.brands : [];
  if (!brands.length) return null;

  const renderBrandsList = (reverse: boolean) => (
    <Marquee
      reverse={reverse}
      speed={35}
      addMask={Boolean(data.add_mask)}
      className="py-3"
    >
      {brands.map((b, i) => (
        <a
          key={b.id ?? i}
          href={b.url || '#'}
          className="inline-flex items-center justify-center p-2 shrink-0 transition-opacity hover:opacity-80"
          aria-label={b.name || 'Brand'}
        >
          <img
            src={b.logo || '/images/placeholder.webp'}
            alt={b.name || ''}
            className={`max-w-44 max-h-16 object-contain ${
              data.invert_image_dark ? 'dark:invert carbon:invert' : ''
            }`}
            loading="lazy"
            width={160}
            height={64}
          />
        </a>
      ))}
    </Marquee>
  );

  return (
    <SectionWrapper
      id={`V_brands_slider-${data.position ?? 0}`}
      ariaLabel="Section V_brands_slider"
      className="V__brands"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
          more={Boolean(data.show_brands_button)}
          moreUrl="/brands"
          moreAlt={t('blocks.header.all_brands', 'جميع الماركات')}
        />

        <div className={data.add_mask ? 'add_mask' : ''}>
          {renderBrandsList(false)}
          {data.duplcate_brands && renderBrandsList(true)}
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
