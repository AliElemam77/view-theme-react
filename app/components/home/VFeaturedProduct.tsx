import { memo } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface VFeatureItem {
  icon?: string;
  icon_image?: string;
  f_title?: string;
  f_sub_title?: string;
}

export interface VFeaturedProductData {
  has_container?: boolean;
  notmrb?: boolean;
  is_toggled?: boolean;
  use_custom_colors?: boolean;
  bg_one_color?: string;
  text_color_one?: string;
  main_text_one?: string;
  is_video?: boolean;
  side_video?: string;
  side_iamge?: string;
  btn_url_one?: unknown;
  // Second side
  bg_two_color?: string;
  text_color_two?: string;
  is_featured?: boolean;
  main_text?: string;
  features?: VFeatureItem[];
  is_image_insted_icne?: boolean;
  invert_image_dark?: boolean;
  // Non-featured alternative
  main_text_two?: string;
  sub_title_two?: string;
  btn_text_two?: string;
  btn_url_two?: unknown;
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

export const VFeaturedProduct = memo(function VFeaturedProduct({
  data,
}: {
  data?: VFeaturedProductData;
}) {
  if (!data) return null;

  const useCustomColors = Boolean(data.use_custom_colors);
  const bgOne = useCustomColors ? data.bg_one_color : undefined;
  const textColorOne = useCustomColors ? data.text_color_one : 'var(--color-primary-dark)';
  const bgTwo = useCustomColors ? data.bg_two_color : 'var(--color-primary-ops)';
  const textColorTwo = useCustomColors ? data.text_color_two : 'var(--color-primary-dark)';

  const side1Style: CSSProperties = {
    background: bgOne,
    backdropFilter: !useCustomColors ? 'contrast(0.9)' : undefined,
    color: textColorOne,
  };

  const side2Style: CSSProperties = {
    backgroundColor: bgTwo,
    color: textColorTwo,
  };

  const features = Array.isArray(data.features) ? data.features : [];

  return (
    <SectionWrapper
      id={`V_featured_product-${data.position ?? 0}`}
      ariaLabel="Section V_featured_product"
      className="V__featured_product"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container ? 'container' : ''}>
        <div
          className={`flex items-stretch justify-center ${
            data.is_toggled ? 'flex-row-reverse' : ''
          }`}
        >
          {/* Side 1 (Media) */}
          <a
            href={linkUrl(data.btn_url_one) || '#'}
            className="relative w-1/2 h-auto overflow-hidden flex flex-col justify-evenly items-center md:p-6 p-2 md:gap-8 gap-4"
            role="img"
            aria-label={data.is_video ? 'Background Video' : 'Background Image'}
            style={side1Style}
          >
            {data.main_text_one && (
              <h2 className="font-medium lg:text-4xl md:text-2xl text-base text-center">
                {data.main_text_one}
              </h2>
            )}
            {data.is_video && data.side_video ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="object-contain max-w-3/4"
              >
                <source src={data.side_video} />
              </video>
            ) : (
              <img
                src={data.side_iamge || '/images/placeholder.webp'}
                alt=""
                className="object-contain max-w-3/4"
                loading={data.priority ? 'eager' : 'lazy'}
                width={1200}
                height={800}
              />
            )}
          </a>

          {/* Side 2 (Content) */}
          <div
            className={`sqer w-1/2 flex flex-col ${
              data.is_featured
                ? 'items-start gap-4'
                : 'items-center md:gap-4 gap-1.5'
            } justify-center h-auto p-4 md:p-8`}
            style={side2Style}
          >
            {data.is_featured ? (
              <>
                {data.main_text && (
                  <h1
                    id="section-title"
                    className="font-semibold my-2 lg:leading-5 leading-4"
                    style={{
                      fontSize: 'clamp(1.125rem, 0.8185rem + 1.4013vw, 2.5rem)',
                    }}
                  >
                    {data.main_text}
                  </h1>
                )}
                <ul
                  className="flex flex-col justify-between lg:gap-4 gap-2 w-full rtl:md:pr-8 rtl:pr-2 ltr:md:pl-8 ltr:pl-2 md:py-8 py-2"
                  role="list"
                >
                  {features.map((el, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between md:gap-4 gap-1.5 lg:pb-4"
                      role="listitem"
                    >
                      <div className="md:max-w-[72px] md:max-h-[72px] max-h-9 max-w-9 shrink-0">
                        {data.is_image_insted_icne && el.icon_image ? (
                          <img
                            className={`aspect-square object-contain w-full h-full ${
                              data.invert_image_dark ? 'dark:invert carbon:invert' : ''
                            }`}
                            src={el.icon_image}
                            alt=""
                            loading="lazy"
                            style={{
                              width: 'clamp(2rem, 1.0873rem + 4.0007vw, 4.688rem)',
                            }}
                          />
                        ) : (
                          <i
                            className={`${el.icon || 'sicon-check'} md:text-4xl text-2xl`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h2
                          className="font-medium lg:leading-5 leading-none my-1"
                          style={{
                            fontSize: 'clamp(0.625rem, 0.5135rem + 0.5096vw, 1.125rem)',
                          }}
                        >
                          {el.f_title}
                        </h2>
                        <p
                          className={`font-light lg:leading-5 leading-3 ${
                            !useCustomColors ? 'text-primary' : ''
                          }`}
                          style={{
                            fontSize: 'clamp(0.5rem, 0.3885rem + 0.5096vw, 1rem)',
                          }}
                        >
                          {el.f_sub_title}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                {data.main_text_two && (
                  <h1 className="text-center font-medium lg:text-4xl md:text-2xl text-base">
                    {data.main_text_two}
                  </h1>
                )}
                {data.sub_title_two && (
                  <p
                    className="text-center"
                    style={{
                      fontSize: 'clamp(0.75rem, 0.5828rem + 0.7643vw, 1.5rem)',
                      lineHeight: 'clamp(1rem, 0.6789rem + 1.4679vw, 2rem)',
                    }}
                  >
                    {data.sub_title_two}
                  </p>
                )}
                {data.btn_text_two && (
                  <ActionBtn
                    text={data.btn_text_two}
                    href={linkUrl(data.btn_url_two)}
                    dataStyle="filled"
                    color={data.bg_two_color}
                    backgroundColor={data.text_color_two}
                    icon
                  />
                )}
              </>
            )}
          </div>
        </div>
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
