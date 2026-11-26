import { memo } from 'react';
import type { CSSProperties } from 'react';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VTaggedProductsData {
  has_container?: boolean;
  notmrb?: boolean;
  toggle_content_switch?: boolean;
  enable_component_background?: boolean;
  background_pattern_image?: string;
  main_image_first?: string;
  main_image_second?: string;
  image_layout_option?: unknown;
  main_titleamsll?: string;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  btn_fqa?: string;
  btn_url?: unknown;
  btn_style?: unknown;
  use_custom_colors?: boolean;
  text_color_one?: string;
  btn_background_color?: string;
  bg_one_color?: string;
  saprator?: unknown;
  use_custom_colors_sep?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  priority?: boolean;
  [key: string]: unknown;
}

const PLACEHOLDER = '/images/placeholder.webp';

/**
 * Port of `V_tagged_products.twig`: one or two decor images around a small
 * title, the custom title and a button.
 */
export const VTaggedProducts = memo(function VTaggedProducts({ data = {} }: { data?: VTaggedProductsData }) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const custom = booleanValue(data.use_custom_colors);
  const isDouble = optionValue(data.image_layout_option) === 'double_with_text';
  const bgImage = text(data.background_pattern_image);

  const innerStyle: CSSProperties | undefined =
    booleanValue(data.enable_component_background) && bgImage
      ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover' }
      : undefined;

  return (
    <section
      className={cx('s-block V_tagged_products', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_tagged_products-${position}`}
      id={`V_tagged_products-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <section
          className={cx(
            'py-9 text-center relative overflow-hidden flex',
            booleanValue(data.toggle_content_switch) ? 'flex-col-reverse sm:flex-row-reverse' : 'flex-col sm:flex-row',
            'items-stretch justify-center'
          )}
          style={innerStyle}
        >
          <div className={cx('h-auto flex-center aspect-square', reveal)}>
            <img
              src={text(data.main_image_first) || PLACEHOLDER}
              alt="left decor"
              className="object-contain"
              loading={data.priority ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={data.priority ? 'high' : 'auto'}
            />
          </div>
          <div className="flex-center flex-col relative flex-1 md:space-y-4 space-y-3">
            <p className={cx('text-sm text-mediumgray', reveal)}>{text(data.main_titleamsll)}</p>
            {/* Twig passes `classone_level` twice; the later value wins. */}
            <BlockTitle
              title={text(data.main_title)}
              sub={text(data.sub_title)}
              jocer={booleanValue(data.has_jocer_image)}
              className="!mb-0"
              levelClass="md:space-y-4 space-y-3"
              level2Class="!justify-center"
            />
            <ActionBtn
              text={text(data.btn_fqa)}
              href={linkUrl(data.btn_url)}
              dataStyle={optionValue(data.btn_style)}
              color={custom ? text(data.text_color_one) : 'var(--color-bg)'}
              backgroundColor={
                custom ? text(data.btn_background_color) || text(data.bg_one_color) : 'var(--color-primary)'
              }
              icon
            />
          </div>
          {isDouble && (
            <div className={cx('h-auto flex-center aspect-square', reveal)}>
              <img
                src={text(data.main_image_second) || PLACEHOLDER}
                alt="right decor"
                className="object-contain"
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
              />
            </div>
          )}
        </section>
      </div>
      <SectionSeparator {...separatorProps(data)} use_custom_colors={twigTruthy(data.use_custom_colors_sep)} />
    </section>
  );
});
