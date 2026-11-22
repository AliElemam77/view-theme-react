import { memo } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface BrandItem {
  name?: string;
  logo?: string;
}

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
  brands_one?: BrandItem[];
  brands_two?: BrandItem[];
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  use_custom_colors_sep?: boolean;
  position?: number;
}

export const VTextBlock = memo(function VTextBlock({
  data,
}: {
  data?: VTextBlockData;
}) {
  if (!data) return null;

  const styleComponent = optionValue(data.style_component) || 'only';
  const posImage = optionValue(data.position_image) || 'center';
  const saprator = optionValue(data.saprator);
  const btnUrl = linkUrl(data.btn_url_two);
  const btnStyle = optionValue(data.btn_style) || 'filled';

  const useCustomColors = Boolean(data.use_custom_colors);
  const textColor = useCustomColors && data.text_color_one ? data.text_color_one : 'var(--color-primary)';
  const lineBg = useCustomColors && data.text_color_one ? data.text_color_one : 'var(--color-primary-light)';

  const isBrandLayout = styleComponent === 'tow_brand' || styleComponent === 'side_brand';

  return (
    <SectionWrapper
      id={`V_text_block-${data.position ?? 0}`}
      ariaLabel="Section V_text_block"
      className={`V__text_block overflow-hidden relative ${
        styleComponent !== 'only' && data.background_image ? 'md:py-10 py-6' : ''
      }`}
      hasContainer={data.has_container}
      notmrb={data.notmrb}
    >
      <div
        className={
          isBrandLayout
            ? 'flex justify-between md:flex-row flex-col lg:gap-8 md:gap-6 gap-4'
            : ''
        }
      >
        {/* Brand slider one if tow_brand */}
        {styleComponent === 'tow_brand' && data.brands_one && data.brands_one.length > 0 && (
          <div className="flex items-center gap-4 max-h-64 overflow-hidden">
            {data.brands_one.map((b, i) => (
              <img
                key={i}
                src={b.logo || '/images/placeholder.webp'}
                alt={b.name || ''}
                className="max-w-32 object-contain"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {styleComponent === 'tow_brand' && (
          <span className="md:w-px md:h-auto h-px w-full" style={{ backgroundColor: lineBg }} />
        )}

        {/* Center text content */}
        <div
          className={`flex ${
            styleComponent !== 'only' ? 'flex-col' : 'md:flex-row flex-col'
          } ${styleComponent !== 'side_brand' ? 'items-center' : ''} justify-between lg:gap-8 md:gap-6 gap-4 flex-1`}
        >
          <div className={isBrandLayout || styleComponent === 'only' ? 'md:max-w-1/4' : ''}>
            <BlockTitle
              title={data.main_title}
              sub={data.sub_title}
              center={styleComponent !== 'side_brand'}
              className="!mb-0"
            />
          </div>

          {data.text_area && (
            <p
              className={`flex-1 ${styleComponent !== 'only' ? 'text-center' : 'text-start'}`}
              style={{ color: textColor }}
            >
              {data.text_area}
            </p>
          )}

          {styleComponent === 'classic' && data.btn_text_two && (
            <ActionBtn
              text={data.btn_text_two}
              href={btnUrl}
              dataStyle={btnStyle}
              color={useCustomColors ? data.text_color_one : 'var(--color-bg)'}
              backgroundColor={useCustomColors ? data.bg_one_color : 'var(--color-primary)'}
              icon
            />
          )}
        </div>

        {/* Brand slider two if brand layout */}
        {isBrandLayout && (
          <>
            <span className="md:w-px md:h-auto h-px w-full" style={{ backgroundColor: lineBg }} />
            {data.brands_two && data.brands_two.length > 0 && (
              <div className="flex items-center gap-4 max-h-64 overflow-hidden">
                {data.brands_two.map((b, i) => (
                  <img
                    key={i}
                    src={b.logo || '/images/placeholder.webp'}
                    alt={b.name || ''}
                    className="max-w-32 object-contain"
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Background image */}
      {styleComponent !== 'only' && data.background_image && (
        <div
          className={`absolute pointer-events-none ${
            posImage === 'center'
              ? 'top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full'
              : posImage === 'start'
              ? 'end-0 top-0'
              : 'start-0 top-0'
          }`}
        >
          <img
            src={data.background_image}
            alt=""
            className="object-contain w-full"
            loading="lazy"
          />
        </div>
      )}

      {/* Separator */}
      {(saprator === 'solid' || saprator === 'star') && (
        <div
          className={`relative w-full py-6 ${data.merge_with_adjacent ? '-my-6' : 'mt-3'} ${
            saprator === 'solid' ? 'container' : ''
          }`}
        >
          <div
            className="h-px w-full"
            style={{
              backgroundColor:
                data.use_custom_colors_sep && data.line_color
                  ? data.line_color
                  : 'var(--color-primary-light)',
            }}
          />
          {saprator === 'star' && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${data.star_position_x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="48" height="57" viewBox="0 0 48 57" fill="none">
                <path
                  d="M24.2847 0.870117L19.0863 22.72L0.569443 28.8541L19.0863 34.9883L24.2847 56.8382L29.4832 34.9883L48 28.8541L29.4832 22.72L24.2847 0.870117Z"
                  fill={
                    data.use_custom_colors_sep && data.star_color
                      ? data.star_color
                      : 'var(--color-primary-light)'
                  }
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
});
