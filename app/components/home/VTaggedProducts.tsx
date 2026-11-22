import { memo } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  // Separator
  saprator?: unknown;
  use_custom_colors_sep?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  priority?: boolean;
}

export const VTaggedProducts = memo(function VTaggedProducts({
  data,
}: {
  data?: VTaggedProductsData;
}) {
  if (!data) return null;

  const useCustomColors = Boolean(data.use_custom_colors);
  const isDouble = optionValue(data.image_layout_option) === 'double_with_text';
  const btnStyle = optionValue(data.btn_style) || 'filled';
  const btnColor = useCustomColors ? data.text_color_one : 'var(--color-bg)';
  const btnBg = useCustomColors
    ? data.btn_background_color || data.bg_one_color
    : 'var(--color-primary)';

  const innerStyle: CSSProperties =
    data.enable_component_background && data.background_pattern_image
      ? {
          backgroundImage: `url(${data.background_pattern_image})`,
          backgroundSize: 'cover',
        }
      : {};

  return (
    <SectionWrapper
      id={`V_tagged_products-${data.position ?? 0}`}
      ariaLabel="Section V_tagged_products"
      className="V_tagged_products"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <section
          className={`py-9 text-center relative overflow-hidden flex ${
            data.toggle_content_switch
              ? 'flex-col-reverse sm:flex-row-reverse'
              : 'flex-col sm:flex-row'
          } items-stretch justify-center`}
          style={innerStyle}
        >
          {data.main_image_first && (
            <div className="h-auto flex items-center justify-center aspect-square shrink-0">
              <img
                src={data.main_image_first}
                alt=""
                className="object-contain max-h-72"
                loading={data.priority ? 'eager' : 'lazy'}
                fetchPriority={data.priority ? 'high' : 'auto'}
              />
            </div>
          )}

          <div className="flex items-center justify-center flex-col relative flex-1 md:space-y-4 space-y-3 px-4">
            {data.main_titleamsll && (
              <p className="text-sm text-mediumgray">{data.main_titleamsll}</p>
            )}
            <BlockTitle
              title={data.main_title}
              sub={data.sub_title}
              jocer={data.has_jocer_image}
              center
              className="!mb-0"
              level2Class="!justify-center"
            />
            {data.btn_fqa && (
              <ActionBtn
                text={data.btn_fqa}
                href={linkUrl(data.btn_url)}
                dataStyle={btnStyle}
                color={btnColor}
                backgroundColor={btnBg}
                icon
              />
            )}
          </div>

          {isDouble && data.main_image_second && (
            <div className="h-auto flex items-center justify-center aspect-square shrink-0">
              <img
                src={data.main_image_second}
                alt=""
                className="object-contain max-h-72"
                loading="lazy"
              />
            </div>
          )}
        </section>
      </div>

      <SectionSeparator
        saprator={optionValue(data.saprator)}
        merge_with_adjacent={Boolean(data.merge_with_adjacent)}
        use_custom_colors={Boolean(data.use_custom_colors_sep ?? data.use_custom_colors)}
        line_color={data.line_color}
        star_color={data.star_color}
        star_position_x={data.star_position_x}
      />
    </SectionWrapper>
  );
});
