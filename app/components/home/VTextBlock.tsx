import { memo } from 'react';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { BrandsBreak, type BreakBrand } from './BrandsBreak';
import { asArray, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export type BrandItem = BreakBrand;

export interface VTextBlockData {
  style_component?: unknown;
  background_image?: string;
  position_image?: unknown;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  text_area?: string;
  btn_text_two?: string;
  btn_url_two?: unknown;
  btn_style?: unknown;
  bg_one_color?: string;
  text_color_one?: string;
  use_custom_colors?: boolean;
  brands_one?: unknown;
  brands_two?: unknown;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  use_custom_colors_sep?: boolean;
  position?: number;
  [key: string]: unknown;
}

/**
 * Port of `V_text_block.twig`: a title + paragraph (+ button in `classic`),
 * optionally between one or two vertical `custom/break` brand carousels, over a
 * decorative background image. The separator reads `use_custom_colors_sep`.
 */
export const VTextBlock = memo(function VTextBlock({ data = {} }: { data?: VTextBlockData }) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  // twilight.json defaults when the setting was never saved.
  const style = data.style_component === undefined ? 'only' : optionValue(data.style_component);
  const posImage = data.position_image === undefined ? 'end' : optionValue(data.position_image);
  const isOnly = style === 'only';
  const isSide = style === 'side_brand';
  const isTwo = style === 'tow_brand';
  const custom = booleanValue(data.use_custom_colors);
  const textColor = text(data.text_color_one);
  const lineStyle = { backgroundColor: custom ? textColor : 'var(--color-primary-light)' };
  const backgroundImage = text(data.background_image);
  const showBackground = !isOnly && !!backgroundImage;

  return (
    <section
      className={cx(
        's-block overflow-hidden relative V__text_block',
        showBackground && 'md:py-10 py-6',
        !booleanValue(data.notmrb) && spacing
      )}
      aria-label={`Section V_text_block-${position}`}
      id={`V_text_block-${position}`}
    >
      <div
        className={cx(
          booleanValue(data.has_container) && 'container',
          (isTwo || isSide) && 'flex justify-between md:flex-row flex-col lg:gap-8 md:gap-6 gap-4'
        )}
      >
        {isTwo && (
          <>
            <div className="max-h-64">
              <BrandsBreak position={position} brands={asArray<BreakBrand>(data.brands_one)} reverse vertical />
            </div>
            <span className={cx(reveal, 'md:w-px md:h-auto h-px w-full')} style={lineStyle} />
          </>
        )}
        <div
          className={cx(
            'flex',
            !isOnly ? 'flex-col' : 'md:flex-row flex-col',
            !isSide && 'items-center',
            'justify-between lg:gap-8 md:gap-6 gap-4 flex-1'
          )}
        >
          <div className={isSide || isOnly ? 'md:max-w-1/4' : ''}>
            <BlockTitle
              title={text(data.main_title)}
              sub={text(data.sub_title)}
              jocer={booleanValue(data.has_jocer_image)}
              levelClass={isTwo || isOnly ? '!text-center' : ''}
              className="!mb-0"
              level2Class={!isSide ? '!justify-center' : ''}
            />
          </div>
          <p
            className={cx(reveal, 'flex-1', !isOnly && 'text-center')}
            style={{ color: custom ? textColor : 'var(--color-primary)' }}
          >
            {text(data.text_area)}
          </p>
          {style === 'classic' && (
            // btn.twig has no `style` parameter, so Twig's `style:` argument is dropped there too.
            <ActionBtn
              text={text(data.btn_text_two)}
              href={linkUrl(data.btn_url_two)}
              dataStyle={optionValue(data.btn_style)}
              color={custom ? textColor : 'var(--color-bg)'}
              backgroundColor={custom ? text(data.bg_one_color) : 'var(--color-primary)'}
              icon
            />
          )}
        </div>
        {(isTwo || isSide) && (
          <>
            <span className={cx('md:w-px md:h-auto h-px w-full', reveal)} style={lineStyle} />
            <div className="max-h-64">
              <BrandsBreak position={position} brands={asArray<BreakBrand>(data.brands_two)} vertical />
            </div>
          </>
        )}
      </div>
      {showBackground && (
        <div
          className={cx(
            reveal,
            'absolute',
            posImage === 'center'
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full'
              : posImage === 'start'
                ? 'right-0 top-0'
                : 'left-0 top-0',
            'pointer-events-none'
          )}
        >
          <img
            src={backgroundImage}
            alt="background image"
            className="lazy object-contain w-full"
            width={1280}
            height={720}
            loading="lazy"
            decoding="async"
            fetchPriority="auto"
          />
        </div>
      )}
      <SectionSeparator
        {...separatorProps(data)}
        use_custom_colors={booleanValue(data.use_custom_colors_sep)}
      />
    </section>
  );
});
