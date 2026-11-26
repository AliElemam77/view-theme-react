import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { BrandsBreak, type BreakBrand } from './BrandsBreak';
import { asArray, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export interface VBrandsSliderData {
  main_title?: string;
  sub_title?: string;
  show_brands_button?: boolean;
  has_jocer_image?: boolean;
  add_mask?: boolean;
  brands?: unknown;
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
  [key: string]: unknown;
}

/**
 * Port of `V_brands_slider.twig`: one `custom/break` free-mode logo slider, plus a
 * second one running the other way when `duplcate_brands` is on.
 */
export const VBrandsSlider = memo(function VBrandsSlider({ data = {} }: { data?: VBrandsSliderData }) {
  const { t } = useTranslation();
  const { spacing } = useViewSettings();
  const position = twigPosition(data);
  const brands = asArray<BreakBrand>(data.brands);
  const invert = booleanValue(data.invert_image_dark);

  return (
    <section
      className={cx('s-block V__brands', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_brands_slider-${position}`}
      id={`V_brands_slider-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          more={booleanValue(data.show_brands_button)}
          moreUrl="/brands"
          moreAlt={t('blocks.header.all_brands')}
          jocer={booleanValue(data.has_jocer_image)}
        />
        <div className={booleanValue(data.add_mask) ? 'add_mask' : ''}>
          <BrandsBreak position={position} brands={brands} invertImageDark={invert} />
          {booleanValue(data.duplcate_brands) && (
            <BrandsBreak position={position} brands={brands} reverse invertImageDark={invert} />
          )}
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
