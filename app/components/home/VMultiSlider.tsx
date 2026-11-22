import { memo, useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface VMultiSliderSlide {
  slider_style?: unknown;
  flower?: unknown;
  slide_bg_color?: string;
  has_overlay?: boolean;
  is_product_mockup?: boolean;
  mockup_image?: string;
  enable_decorative_icon?: boolean;
  decorative_icon_color?: string;
  is_video_bg?: boolean;
  video_ur?: string;
  image_bg?: string;
  image_bg_mobile?: string;
  main_title?: string;
  title_color?: string;
  weighttitle?: string;
  sub_title?: string;
  sub_slider_color?: string;
  weighsubttitle?: string;
  btn_txt?: string;
  btn_url?: unknown;
  btn_sselector?: unknown;
  btn_color?: string;
  btn_bg_color?: string;
  hajm_khat_sura?: unknown;
  content_position?: unknown;
  obj_con?: boolean;
  enable_overlay_layer?: boolean;
}

export interface VMultiSliderData {
  component_function?: unknown;
  choose_movement?: unknown;
  is_dots?: boolean;
  is_dire?: boolean;
  is_loop?: boolean;
  is_autoplay?: boolean;
  cards_slider?: VMultiSliderSlide[];
  has_container?: boolean;
  notmrb?: boolean;
  // Banner/video fallback fields
  image_bg?: string;
  image_bg_mobile?: string;
  video_ur?: string;
  main_title?: string;
  title_color?: string;
  weighttitle?: string;
  sub_title?: string;
  sub_slider_color?: string;
  weighsubttitle?: string;
  btn_txt?: string;
  btn_url?: unknown;
  btn_sselector?: unknown;
  btn_color?: string;
  btn_bg_color?: string;
  content_position?: unknown;
  hajm_khat_sura?: unknown;
  obj_con?: boolean;
  // Separator
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  priority?: boolean;
}

function getPosClass(pos: string) {
  switch (pos) {
    case 'top-right text-end':
      return 'justify-end items-start text-end';
    case 'top-center':
      return 'justify-center items-start text-center';
    case 'top-left':
      return 'justify-start items-start text-start';
    case 'center-right':
      return 'justify-end items-center text-end';
    case 'center-center':
      return 'justify-center items-center text-center';
    case 'center-left':
      return 'justify-start items-center text-start';
    case 'bottom-right':
      return 'justify-end items-end text-end';
    case 'bottom-center':
      return 'justify-center items-end text-center';
    case 'bottom-left':
    default:
      return 'justify-start items-end text-start';
  }
}

function normalizeSize(val: unknown): string {
  const s = optionValue(val) || 'md';
  const map: Record<string, string> = {
    'x-small': 'xs',
    small: 'sm',
    medium: 'md',
    large: 'lg',
    'x-large': 'xl',
  };
  return map[s] || s;
}

export const VMultiSlider = memo(function VMultiSlider({
  data,
}: {
  data?: VMultiSliderData;
}) {
  if (!data) return null;

  const fn = optionValue(data.component_function) || 'component_slider';
  const isSlider = fn === 'component_slider';
  const isBanner = fn === 'component_banner';
  const isVideo = fn === 'component_video';
  const hasContainer = Boolean(data.has_container && !isSlider);
  const outerContainerClass = hasContainer ? 'container' : '';

  const slides = Array.isArray(data.cards_slider) ? data.cards_slider : [];
  const [activeIndex, setActiveIndex] = useState(0);

  // Autoplay slider logic for basic slides
  const isAutoplay = Boolean(data.is_autoplay);
  const isLoop = Boolean(data.is_loop);

  useEffect(() => {
    if (!isSlider || !isAutoplay || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev + 1 >= slides.length) {
          return isLoop ? 0 : prev;
        }
        return prev + 1;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isSlider, isAutoplay, isLoop, slides.length]);

  return (
    <SectionWrapper
      id={`V_multi_slider-${data.position ?? 0}`}
      ariaLabel="Section V_multi_slider"
      className="V__micr overflow-hidden"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={outerContainerClass}>
        {isSlider ? (
          <div
            id={`main-slider-${data.position ?? 0}`}
            className={`relative overflow-hidden ${data.is_dots ? 'is_dots' : ''}`}
            dir={data.is_dire ? 'ltr' : 'rtl'}
          >
            <div className="relative w-full min-h-[300px] md:min-h-[500px]">
              {slides.map((slide, idx) => {
                const styleName = optionValue(slide.slider_style) || 'style_basic';
                const isStyleBasic = styleName === 'style_basic';
                const isStyleFlower = styleName === 'style_flower';
                const isStyleMockup = styleName === 'style_mockup';
                const isStyleLayers = styleName === 'style_layers';
                const shapeFlower = optionValue(slide.flower) || '';
                const slideBg = slide.slide_bg_color || 'var(--color-primary)';
                const hasMockup = Boolean(slide.is_product_mockup && slide.mockup_image);
                const objContain = Boolean(slide.obj_con);
                const linkEnabled = !slide.btn_txt;
                const sizeMain = normalizeSize(slide.hajm_khat_sura);
                const posStr = optionValue(slide.content_position) || 'center-center';
                const posClass = getPosClass(posStr);
                const btnStyle = optionValue(slide.btn_sselector) || 'filled';
                const btnUrl = linkUrl(slide.btn_url);
                const isActive = idx === activeIndex;

                return (
                  <div
                    key={idx}
                    className={`V__micr-banner transition-opacity duration-700 ${
                      isActive ? 'block opacity-100 relative' : 'hidden opacity-0'
                    }`}
                    style={!isStyleBasic ? { backgroundColor: slideBg } : undefined}
                  >
                    <div
                      className={`${isStyleFlower ? 'container' : ''} flex items-center ${
                        isStyleMockup ? 'flex-col-reverse md:flex-row-reverse' : 'justify-center'
                      } ${!slide.obj_con && !isStyleFlower ? 'res' : ''} ${
                        isStyleFlower ? 'flower' : ''
                      }`}
                    >
                      {isStyleLayers ? (
                        <div className="w-full h-full relative">
                          <svg
                            viewBox="0 0 1366 768"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            preserveAspectRatio="xMidYMid slice"
                            className="w-full h-full block"
                          >
                            <defs>
                              <pattern
                                id={`pattern_${idx}`}
                                patternContentUnits="objectBoundingBox"
                                width="1"
                                height="1"
                              >
                                <image
                                  width="1"
                                  height="1"
                                  preserveAspectRatio="xMidYMid slice"
                                  xlinkHref={slide.image_bg || slide.image_bg_mobile}
                                />
                              </pattern>
                            </defs>
                            <rect width="1366" height="768" fill="var(--color-bg)" />
                            <path
                              d="M0.268048 0H1366V768C1187.44 456.405 -20.6348 285.859 0.268048 0Z"
                              fill={slideBg}
                            />
                            <path
                              d="M751.852 768H0V0C98.3 311.595 763.36 482.141 751.852 768Z"
                              fill={`url(#pattern_${idx})`}
                            />
                            {slide.enable_overlay_layer && (
                              <path
                                d="M751.852 768H0V0C98.3 311.595 763.36 482.141 751.852 768Z"
                                fill="black"
                                fillOpacity="0.5"
                              />
                            )}
                          </svg>
                        </div>
                      ) : (
                        <div
                          className={`relative ${
                            isStyleFlower || isStyleMockup
                              ? 'md:w-1/2 w-full h-1/2 md:h-full'
                              : 'h-full w-full'
                          }`}
                        >
                          {slide.is_video_bg && slide.video_ur ? (
                            <a
                              href={linkEnabled ? btnUrl : undefined}
                              className={`${!objContain ? 'h-full' : ''} w-full flex justify-center items-center`}
                            >
                              <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                className={`${!objContain ? 'h-full' : ''} w-full ${
                                  objContain ? 'object-contain' : 'object-cover'
                                } ${isStyleFlower ? 'aspect-square flw' : ''} ${
                                  isStyleFlower ? shapeFlower : ''
                                }`}
                              >
                                <source src={slide.video_ur} />
                              </video>
                            </a>
                          ) : (
                            <a
                              href={linkEnabled ? btnUrl : undefined}
                              className={`${!objContain ? 'h-full' : ''} w-full flex justify-center items-center`}
                            >
                              {slide.image_bg && (
                                <picture className={`${!objContain ? 'h-full' : ''} w-full`}>
                                  <source
                                    srcSet={slide.image_bg || slide.image_bg_mobile}
                                    media="(min-width: 768px)"
                                  />
                                  <source
                                    srcSet={slide.image_bg_mobile || slide.image_bg}
                                    media="(max-width: 767px)"
                                  />
                                  <img
                                    src={slide.image_bg || slide.image_bg_mobile}
                                    alt={slide.main_title || ''}
                                    className={`${!objContain ? 'h-full' : ''} w-full ${
                                      objContain ? 'object-contain' : 'object-cover'
                                    } object-center ${
                                      isStyleFlower ? 'aspect-square flw' : ''
                                    } ${isStyleFlower ? shapeFlower : ''}`}
                                    loading={idx === 0 && data.priority ? 'eager' : 'lazy'}
                                    width="1280"
                                    height="720"
                                  />
                                </picture>
                              )}
                            </a>
                          )}

                          {hasMockup && !isStyleMockup && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full">
                              <div className="relative h-full">
                                <img
                                  src={slide.mockup_image}
                                  alt={slide.main_title || ''}
                                  className="h-full w-full object-contain object-center"
                                  loading="lazy"
                                />
                                {slide.enable_decorative_icon && (
                                  <svg
                                    height="183"
                                    viewBox="0 0 126 183"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-0 md:-left-1/3 -left-1/2 h-revert w-10 md:w-22"
                                  >
                                    <path
                                      d="M48.5 0C41.4879 23.3086 23.2437 41.488 0 48.5C23.3086 55.5121 41.4879 73.7564 48.5 97C55.5121 73.7564 73.7563 55.5121 97 48.5C73.7563 41.488 55.577 23.3086 48.5 0Z"
                                      fill={slide.decorative_icon_color || 'currentColor'}
                                    />
                                    <path
                                      d="M103.5 138C100.247 148.813 91.7831 157.247 81 160.5C91.8133 163.753 100.247 172.217 103.5 183C106.753 172.217 115.217 163.753 126 160.5C115.217 157.247 106.783 148.813 103.5 138Z"
                                      fill={slide.decorative_icon_color || 'currentColor'}
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Overlay */}
                      <div
                        className={`w-full absolute inset-0 z-[3] flex items-center justify-center ${
                          slide.btn_txt ? '' : 'pointer-events-none'
                        }`}
                      >
                        <div
                          className={`px-4 w-full h-full flex ${
                            isStyleFlower ? 'displayed' : ''
                          } ${posClass}`}
                        >
                          {(slide.main_title || slide.sub_title || slide.btn_txt) && (
                            <div
                              className={`text-content ${
                                isStyleFlower || isStyleBasic
                                  ? 'max-w-[95%] sm:max-w-[70%] lg:max-w-[50%]'
                                  : isStyleLayers
                                  ? 'md:w-1/2 w-full'
                                  : ''
                              } p-4 sm:p-6 sizing-${sizeMain}`}
                            >
                              {slide.main_title && (
                                <h2
                                  className="mb-3 md:mb-6"
                                  style={{
                                    fontWeight: slide.weighttitle,
                                    color: slide.title_color,
                                  }}
                                >
                                  {slide.main_title}
                                </h2>
                              )}
                              {slide.sub_title && (
                                <p
                                  className="line-clamp-2"
                                  style={{
                                    fontWeight: slide.weighsubttitle,
                                    color: slide.sub_slider_color,
                                  }}
                                >
                                  {slide.sub_title}
                                </p>
                              )}
                              {slide.btn_txt && (
                                <div className="mt-3 md:mt-6 flex">
                                  <ActionBtn
                                    text={slide.btn_txt}
                                    href={btnUrl}
                                    dataStyle={btnStyle}
                                    color={slide.btn_color}
                                    backgroundColor={slide.btn_bg_color}
                                    icon
                                    className="!w-fit"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Dots */}
            {data.is_dots && slides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === activeIndex
                        ? 'bg-primary w-6'
                        : 'bg-white/60 hover:bg-white'
                    }`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            {isBanner && data.image_bg && (
              <a
                href={data.btn_txt ? undefined : linkUrl(data.btn_url)}
                className={`${!data.obj_con ? 'h-full' : ''} w-full flex justify-center items-center`}
              >
                <picture className={`${!data.obj_con ? 'h-full' : ''} w-full`}>
                  <source
                    srcSet={data.image_bg || data.image_bg_mobile}
                    media="(min-width: 768px)"
                  />
                  <source
                    srcSet={data.image_bg_mobile || data.image_bg}
                    media="(max-width: 767px)"
                  />
                  <img
                    src={data.image_bg || data.image_bg_mobile}
                    alt={data.main_title || ''}
                    className={`${!data.obj_con ? 'h-full' : ''} w-full ${
                      data.obj_con ? 'object-contain' : 'object-cover'
                    } object-center`}
                    loading={data.priority ? 'eager' : 'lazy'}
                    width="1280"
                    height="720"
                  />
                </picture>
              </a>
            )}

            {isVideo && data.video_ur && (
              <a
                href={data.btn_txt ? undefined : linkUrl(data.btn_url)}
                className={`${!data.obj_con ? 'h-full' : ''} w-full flex justify-center items-center`}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className={`${!data.obj_con ? 'h-full' : ''} w-full ${
                    data.obj_con ? 'object-contain' : 'object-cover'
                  }`}
                >
                  <source src={data.video_ur} />
                </video>
              </a>
            )}

            {/* Static Content Overlay */}
            <div
              className={`absolute inset-0 z-[3] flex items-center justify-center ${
                data.btn_txt ? '' : 'pointer-events-none'
              }`}
            >
              <div
                className={`px-4 w-full h-full flex ${getPosClass(
                  optionValue(data.content_position) || 'center-center'
                )}`}
              >
                {(data.main_title || data.sub_title || data.btn_txt) && (
                  <div
                    className={`text-content max-w-[95%] sm:max-w-[70%] lg:max-w-[50%] p-4 sm:p-6 sizing-${normalizeSize(
                      data.hajm_khat_sura
                    )}`}
                  >
                    {data.main_title && (
                      <h2
                        className="mb-3 md:mb-6"
                        style={{
                          fontWeight: data.weighttitle,
                          color: data.title_color,
                        }}
                      >
                        {data.main_title}
                      </h2>
                    )}
                    {data.sub_title && (
                      <p
                        className="line-clamp-2"
                        style={{
                          fontWeight: data.weighsubttitle,
                          color: data.sub_slider_color,
                        }}
                      >
                        {data.sub_title}
                      </p>
                    )}
                    {data.btn_txt && (
                      <div className="mt-3 md:mt-6">
                        <ActionBtn
                          text={data.btn_txt}
                          href={linkUrl(data.btn_url)}
                          dataStyle={optionValue(data.btn_sselector) || 'filled'}
                          color={data.btn_color}
                          backgroundColor={data.btn_bg_color}
                          icon
                          className="!w-fit"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
