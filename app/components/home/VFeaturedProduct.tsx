import { memo } from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

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
  bg_two_color?: string;
  text_color_two?: string;
  is_featured?: boolean;
  main_text?: string;
  features?: unknown;
  is_image_insted_icne?: boolean;
  invert_image_dark?: boolean;
  main_text_two?: string;
  sub_title_two?: string;
  btn_text_two?: string;
  btn_url_two?: unknown;
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
 * Port of `V_featured_product.twig`: a media side (image or video, linked) next
 * to a content side that is either a feature list or a title, text and button.
 */
export const VFeaturedProduct = memo(function VFeaturedProduct({ data = {} }: { data?: VFeaturedProductData }) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const custom = booleanValue(data.use_custom_colors);
  const featured = booleanValue(data.is_featured);
  const isVideo = booleanValue(data.is_video);
  const useImages = booleanValue(data.is_image_insted_icne);
  const invert = booleanValue(data.invert_image_dark);
  const features = collectionItems<VFeatureItem>(data.features, 'features');
  const mainTextOne = text(data.main_text_one);
  const mainText = text(data.main_text);

  const mediaStyle: CSSProperties = custom
    ? { background: text(data.bg_one_color), color: text(data.text_color_one) }
    : { backdropFilter: 'contrast(0.9)', color: 'var(--color-primary-dark)' };
  const contentStyle: CSSProperties = {
    backgroundColor: custom ? text(data.bg_two_color) : 'var(--color-primary-ops)',
    color: custom ? text(data.text_color_two) : 'var(--color-primary-dark)',
  };
  // `role` is forwarded to the anchor by the Link adapter.
  const mediaAttrs = { role: 'img' };

  return (
    <section
      className={cx('s-block V__featured_product', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_featured_product-${position}`}
      id={`V_featured_product-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <div className={cx('flex items-stretch justify-center', booleanValue(data.is_toggled) && 'flex-row-reverse')}>
          <Link
            to={linkUrl(data.btn_url_one) || '#'}
            className="relative w-1/2 h-auto overflow-hidden flex flex-col justify-evenly items-center md:p-6 p-2 md:gap-8 gap-4"
            aria-label={isVideo ? 'Background Video' : 'Background Image'}
            style={mediaStyle}
            {...mediaAttrs}
          >
            {mainTextOne && (
              <h2 className={cx('font-medium lg:text-4xl md:text-2xl text-base text-center', reveal)}>
                {mainTextOne}
              </h2>
            )}
            {isVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                webkit-playsinline=""
                className={cx('object-contain max-w-3/4', reveal)}
              >
                <source src={text(data.side_video) || undefined} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={text(data.side_iamge) || PLACEHOLDER}
                alt={mainTextOne || mainText || ''}
                className={cx('object-contain max-w-3/4', reveal)}
                loading={data.priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={data.priority ? 'high' : 'auto'}
                width={1200}
                height={800}
              />
            )}
          </Link>
          <div
            className={cx(
              'sqer w-1/2 flex flex-col',
              featured ? 'items-start gap-4' : 'items-center md:gap-4 gap-1.5',
              'justify-center h-auto'
            )}
            style={contentStyle}
          >
            {featured ? (
              <>
                {mainText && (
                  <h2
                    className="font-semibold my-2 lg:leading-5 leading-4"
                    style={{ fontSize: 'clamp(1.125rem, 0.8185rem + 1.4013vw, 2.5rem)' }}
                  >
                    {mainText}
                  </h2>
                )}
                <ul className="flex flex-col justify-between lg:gap-4 gap-2 w-full rtl:md:pr-8 rtl:pr-2 ltr:md:pl-8 ltr:pl-2 md:py-8 py-2">
                  {features.map((el, idx) => (
                    // A settings list without ids.
                    // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                    <li
                      key={idx}
                      className={cx('center-between md:gap-4 gap-1.5 lg:pb-4', reveal)}
                    >
                      <div className="md:max-w-[72px] md:max-h-[72px] max-h-9 max-w-9">
                        {useImages ? (
                          <img
                            className={cx(
                              'aspect-square object-contain w-full h-full',
                              invert && 'dark:invert carbon:invert'
                            )}
                            src={text(el.icon_image) || PLACEHOLDER}
                            loading="lazy"
                            decoding="async"
                            fetchPriority="auto"
                            alt=""
                            aria-hidden="true"
                            style={{ width: 'clamp(2rem, 1.0873rem + 4.0007vw, 4.688rem)' }}
                          />
                        ) : (
                          <i className={cx(text(el.icon), 'md:text-4xl text-2xl')} aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className="font-medium lg:leading-5 leading-none my-1"
                          style={{ fontSize: 'clamp(0.625rem, 0.5135rem + 0.5096vw, 1.125rem)' }}
                        >
                          {text(el.f_title)}
                        </h3>
                        <p
                          className={cx('font-light lg:leading-5 leading-3', !custom && 'text-primary')}
                          style={{ fontSize: 'clamp(0.5rem, 0.3885rem + 0.5096vw, 1rem)' }}
                        >
                          {text(el.f_sub_title)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2
                  className={cx('text-center font-medium lg:text-4xl md:text-2xl text-base', reveal)}
                >
                  {text(data.main_text_two)}
                </h2>
                <p
                  className={cx('text-center', reveal)}
                  style={{
                    fontSize: 'clamp(0.75rem, 0.5828rem + 0.7643vw, 1.5rem)',
                    lineHeight: 'clamp(1rem, 0.6789rem + 1.4679vw, 2rem)',
                  }}
                >
                  {text(data.sub_title_two)}
                </p>
                <ActionBtn
                  text={text(data.btn_text_two)}
                  href={linkUrl(data.btn_url_two)}
                  dataStyle="filled"
                  color={text(data.bg_two_color)}
                  backgroundColor={text(data.text_color_two)}
                  icon
                />
              </>
            )}
          </div>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} use_custom_colors={twigTruthy(data.use_custom_colors_sep)} />
    </section>
  );
});
