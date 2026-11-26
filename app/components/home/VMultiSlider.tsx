import { memo, type ReactNode } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VMultiSliderSlide {
  slider_style?: unknown;
  flower?: unknown;
  slide_bg_color?: string;
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
  [key: string]: unknown;
}

export interface VMultiSliderData {
  component_function?: unknown;
  choose_movement?: unknown;
  is_dots?: boolean;
  is_dire?: boolean;
  is_loop?: boolean;
  is_autoplay?: boolean;
  cards_slider?: unknown;
  has_container?: boolean;
  notmrb?: boolean;
  has_overlay?: boolean;
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
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const SIZES: Record<string, string> = {
  'x-small': 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  'x-large': 'xl',
};

/** `hajm_khat_sura[0] | replace({...})`: the `sizing-*` suffix ('' when unset). */
const sizeOf = (value: unknown) => {
  const v = optionValue(value);
  return SIZES[v] ?? v;
};

/** Twig's `posclass` / `posclassfixed` chain, comparisons unchanged (`'top-right text-end'` never matches). */
function posClassOf(pos: string | undefined): string {
  switch (pos) {
    case 'top-right text-end':
      return 'justify-end items-start';
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
    default:
      return 'justify-start items-end text-start';
  }
}

/** The `<a>` Twig renders with an `href` only when the slide has no button text. */
function SlideLink({ href, className, children }: { href?: string; className: string; children: ReactNode }) {
  if (href) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  // Twig renders the anchor without `href` here.
  // react-doctor-disable-next-line react-doctor/anchor-is-valid
  return <a className={className}>{children}</a>;
}

function DecorativeIcon({ color }: { color?: string }) {
  return (
    <svg
      height="183"
      viewBox="0 0 126 183"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 md:-left-1/3 -left-1/2  h-revert w-10 md:w-22"
      data-swiper-parallax="-900"
    >
      <path
        d="M48.5 0C41.4879 23.3086 23.2437 41.488 0 48.5C23.3086 55.5121 41.4879 73.7564 48.5 97C55.5121 73.7564 73.7563 55.5121 97 48.5C73.7563 41.488 55.577 23.3086 48.5 0Z"
        fill={color}
      />
      <path
        d="M103.5 138C100.247 148.813 91.7831 157.247 81 160.5C91.8133 163.753 100.247 172.217 103.5 183C106.753 172.217 115.217 163.753 126 160.5C115.217 157.247 106.783 148.813 103.5 138Z"
        fill={color}
      />
    </svg>
  );
}

interface TextContentProps {
  source: Record<string, unknown>;
  className: string;
  btnWrapClass: string;
  dataStyle: string;
}

/** The `.text-content` block (title, subtitle, `custom/btn`) every variant repeats. */
function TextContent({ source, className, btnWrapClass, dataStyle }: TextContentProps) {
  const title = text(source.main_title);
  const sub = text(source.sub_title);
  const btnTxt = text(source.btn_txt);
  const btnUrl = linkUrl(source.btn_url);
  return (
    <div className={className}>
      {title && (
        <h2
          className="mb-3 md:mb-6"
          data-swiper-parallax="-500"
          style={{ fontWeight: text(source.weighttitle) || undefined, color: text(source.title_color) || undefined }}
        >
          {title}
        </h2>
      )}
      {sub && (
        <p
          className="line-clamp-2"
          data-swiper-parallax="-800"
          style={{
            fontWeight: text(source.weighsubttitle) || undefined,
            color: text(source.sub_slider_color) || undefined,
          }}
        >
          {sub}
        </p>
      )}
      {btnTxt && btnUrl && (
        <div data-swiper-parallax="-1100" className={btnWrapClass}>
          <ActionBtn
            text={btnTxt}
            href={btnUrl}
            dataStyle={dataStyle}
            color={text(source.btn_color) || undefined}
            backgroundColor={text(source.btn_bg_color) || undefined}
            icon
            className="!w-fit"
          />
        </div>
      )}
    </div>
  );
}

/** Twig's `slider-config`, effect block picked from `choose_movement`. */
function sliderConfigOf(effect: string, isDots: boolean, sliderId: string) {
  const base = {
    pagination: isDots ? { el: `#${sliderId} .swiper-pagination`, clickable: true } : false,
    mousewheel: { enabled: false, forceToAxis: false },
    lazy: true,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 10,
    effect,
  };
  if (effect === 'cards') {
    return { ...base, cardsEffect: { slideShadows: true, perspective: true, cardScale: 0.8, gap: 5 } };
  }
  if (effect === 'coverflow') {
    return {
      ...base,
      coverflowEffect: { slideShadows: false, rotate: 50, stretch: 0, depth: 150, modifier: 1.2, gap: 10 },
    };
  }
  if (effect === 'flip') {
    return {
      ...base,
      flipEffect: { slideShadows: false, perspective: true, rotateX: 45, rotateY: 45, speed: 500 },
    };
  }
  return { ...base, defaultEffect: { type: 'normal', speed: 400 } };
}

/**
 * Port of `V_multi_slider.twig`: a `fullwidth` `<salla-slider>` (parallax) of
 * slides in four styles (basic, flower mask, product mockup, layered SVG), or a
 * single banner / video with a text overlay.
 */
export const VMultiSlider = memo(function VMultiSlider({ data = {} }: { data?: VMultiSliderData }) {
  const { settings, spacing } = useViewSettings();
  const position = twigPosition(data);
  const fn = optionValue(data.component_function) || 'component_banner';
  const isSlider = fn === 'component_slider';
  const isBanner = fn === 'component_banner';
  const isVideo = fn === 'component_video';
  const hasContainer = booleanValue(data.has_container) && !isSlider;
  const mergedHeader = booleanValue(settings.has_mearged_header, true);
  const objConTop = booleanValue(data.obj_con);
  const isDots = booleanValue(data.is_dots);

  const renderSlides = () => {
    const slides = collectionItems<VMultiSliderSlide>(data.cards_slider, 'cards_slider');
    // Twig's `pos` is only set by basic slides and carries over to the next ones in the loop.
    let pos: string | undefined;
    return slides.map((slide, index) => {
      const first = index === 0;
      const styleName = optionValue(slide.slider_style);
      const isBasic = styleName === 'style_basic';
      const isFlower = styleName === 'style_flower';
      const isMockup = styleName === 'style_mockup';
      const isLayers = styleName === 'style_layers';
      const shapeFlower = optionValue(slide.flower);
      const slideBg = text(slide.slide_bg_color) || 'var(--color-primary)';
      const mockupImage = text(slide.mockup_image);
      const hasMockup = booleanValue(slide.is_product_mockup) && !!mockupImage;
      const objContain = booleanValue(slide.obj_con);
      const btnTxt = text(slide.btn_txt);
      const linkHref = !btnTxt ? linkUrl(slide.btn_url) : undefined;
      const sizeMain = sizeOf(slide.hajm_khat_sura);
      const dataStyle = optionValue(slide.btn_sselector);
      const imageBg = text(slide.image_bg);
      const imageBgMobile = text(slide.image_bg_mobile);
      const videoUrl = text(slide.video_ur);
      const title = text(slide.main_title);
      const hasText = !!(title || text(slide.sub_title) || btnTxt);
      const decorColor = text(slide.decorative_icon_color) || undefined;
      const loading = first ? 'eager' : 'lazy';
      const decoding = first ? 'async' : 'auto';
      const fetchPriority = first ? 'high' : 'auto';
      const patternId = `pattern0_1600_16970-${position}-${index}`;
      const clipId = `clip0_1600_16970-${position}-${index}`;
      if (isBasic) pos = optionValue(slide.content_position) || 'center-center';

      const mediaCls = cx(!objContain && 'h-full', 'w-full', objContain ? 'object-contain' : 'object-cover');
      const flowerCls = cx(isFlower && 'aspect-square flw', isFlower && shapeFlower);
      const linkCls = cx(!objContain && 'h-full', 'w-full flex justify-center items-center');

      return (
        // A settings list without ids.
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <div
          key={index}
          className="V__micr-banner"
          style={!isBasic ? { backgroundColor: slideBg } : undefined}
        >
          <div
            className={cx(
              isFlower && 'container',
              'flex items-center',
              isMockup ? 'flex-col-reverse md:flex-row-reverse' : 'justify-center',
              !objConTop && !isFlower && 'res',
              isFlower && 'flower',
              mergedHeader && isFlower && 'md:!pt-32'
            )}
          >
            {isLayers ? (
              <svg
                viewBox="0 0 1366 768"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                preserveAspectRatio="xMidYMid slice"
                style={{ width: '100%', height: '100%', display: 'block' }}
              >
                <g clipPath={`url(#${clipId})`}>
                  <rect width="1366" height="768" fill="var(--color-bg)" />
                  <path d="M0.268048 0H1366V768C1187.44 456.405 -20.6348 285.859 0.268048 0Z" fill={slideBg} />
                  <path d="M751.852 768H0V0C98.3 311.595 763.36 482.141 751.852 768Z" fill={`url(#${patternId})`} />
                  {booleanValue(slide.enable_overlay_layer) && (
                    <path
                      d="M751.852 768H0V0C98.3 311.595 763.36 482.141 751.852 768Z"
                      fill="black"
                      fillOpacity="0.5"
                    />
                  )}
                </g>
                <defs>
                  <pattern id={patternId} patternContentUnits="objectBoundingBox" width="1" height="1">
                    <image
                      width="1"
                      height="1"
                      preserveAspectRatio="xMidYMid slice"
                      xlinkHref={imageBg || imageBgMobile}
                    />
                  </pattern>
                  <clipPath id={clipId}>
                    <rect width="1366" height="768" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <div
                className={cx(
                  isFlower || isMockup ? 'md:w-1/2 w-full h-1/2 md:h-full' : 'h-full w-full',
                  'relative'
                )}
                data-swiper-parallax="-600"
              >
                {booleanValue(slide.is_video_bg) && videoUrl ? (
                  <SlideLink href={linkHref} className={linkCls}>
                    <video autoPlay muted loop playsInline preload="none" className={cx(mediaCls, flowerCls)}>
                      <source src={videoUrl} />
                      Your browser does not support the video tag.
                    </video>
                  </SlideLink>
                ) : (
                  <SlideLink href={linkHref} className={linkCls}>
                    {imageBg && (
                      <picture className={cx(!objContain && 'h-full', 'w-full')}>
                        <source srcSet={imageBg || imageBgMobile} media="(min-width: 768px)" />
                        <source srcSet={imageBgMobile || imageBg} media="(max-width: 767px)" />
                        <img
                          src={imageBgMobile || imageBg}
                          alt={title}
                          className={cx(mediaCls, 'object-center', flowerCls)}
                          loading={loading}
                          decoding={decoding}
                          fetchPriority={fetchPriority}
                          width={1280}
                          height={720}
                        />
                      </picture>
                    )}
                  </SlideLink>
                )}
                {isMockup ? (
                  <div
                    className={cx(
                      'w-full absolute inset-0 z-[3] flex-row flex items-center justify-center',
                      !btnTxt && 'pointer-events-none'
                    )}
                  >
                    <div className=" px-4 w-full h-full flex-center text-center">
                      {hasText && (
                        <TextContent
                          source={slide}
                          className={cx('text-content p-4 sm:p-6', `sizing-${sizeMain}`)}
                          btnWrapClass="mt-3 md:mt-6 flex justify-center"
                          dataStyle={dataStyle}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  hasMockup && (
                    <div
                      className={cx(
                        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full',
                        mergedHeader && isBasic && '!pt-32'
                      )}
                    >
                      <div className="relative h-full">
                        <img
                          src={mockupImage}
                          alt={title}
                          data-swiper-parallax="-1300"
                          className="h-full w-full object-contain object-center"
                          loading={loading}
                          decoding={decoding}
                          fetchPriority={fetchPriority}
                          width={1280}
                          height={720}
                        />
                        {booleanValue(slide.enable_decorative_icon) && <DecorativeIcon color={decorColor} />}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            {isMockup ? (
              hasMockup && (
                <div
                  className={cx('flex-center flex-1 h-1/2 md:h-full', mergedHeader && 'md:!pt-32')}
                  data-swiper-parallax="-1300"
                >
                  <div className="relative h-full">
                    <img
                      src={mockupImage}
                      alt={title}
                      className="w-auto h-full object-contain object-center md:py-14 py-9"
                      loading={loading}
                      decoding={decoding}
                      fetchPriority={fetchPriority}
                      width={1280}
                      height={720}
                    />
                    {booleanValue(slide.enable_decorative_icon) && <DecorativeIcon color={decorColor} />}
                  </div>
                </div>
              )
            ) : (
              <div
                className={cx(
                  'w-full absolute inset-0 z-[3] flex items-center justify-center',
                  !btnTxt && 'pointer-events-none'
                )}
              >
                <div className={cx('px-4 w-full h-full flex', isFlower && 'displayed', posClassOf(pos))}>
                  {hasText && (
                    <TextContent
                      source={slide}
                      className={cx(
                        'text-content',
                        (isFlower || isBasic) && 'max-w-[95%] sm:max-w-[70%] lg:max-w-[50%]',
                        isLayers && 'md:w-1/2 w-full',
                        'p-4 sm:p-6',
                        `sizing-${sizeMain}`
                      )}
                      btnWrapClass={cx('mt-3 md:mt-6 flex', isFlower && 'displayed')}
                      dataStyle={dataStyle}
                    />
                  )}
                </div>
                {isLayers && hasMockup && (
                  <img
                    src={mockupImage}
                    alt={title}
                    className="w-auto h-full object-contain"
                    loading={loading}
                    decoding={decoding}
                    fetchPriority={fetchPriority}
                    width={1280}
                    height={720}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const renderStatic = () => {
    const btnTxt = text(data.btn_txt);
    const linkHref = !btnTxt ? linkUrl(data.btn_url) : undefined;
    const imageBg = text(data.image_bg);
    const imageBgMobile = text(data.image_bg_mobile);
    const linkCls = cx(!objConTop && 'h-full', 'w-full flex justify-center items-center');
    const mediaCls = cx(!objConTop && 'h-full', 'w-full', objConTop ? 'object-contain' : 'object-cover');
    const posFixed = optionValue(data.content_position) || 'center-center';
    // `c.slider_btn` is not a setting, so only the title and subtitle open the text block.
    const hasText = !!(text(data.main_title) || text(data.sub_title) || twigTruthy(data.slider_btn));
    return (
      <div className="relative">
        {isBanner && (
          <SlideLink href={linkHref} className={linkCls}>
            {imageBg && (
              <picture className={cx(!objConTop && 'h-full', 'w-full')}>
                <source srcSet={imageBg || imageBgMobile} media="(min-width: 768px)" />
                <source srcSet={imageBgMobile || imageBg} media="(max-width: 767px)" />
                <img
                  src={imageBgMobile || imageBg}
                  alt={text(data.main_title)}
                  className={cx(mediaCls, 'object-center')}
                  loading="lazy"
                  decoding="auto"
                  fetchPriority="auto"
                  width={1280}
                  height={720}
                />
              </picture>
            )}
          </SlideLink>
        )}
        {!isBanner && isVideo && (
          <SlideLink href={linkHref} className={linkCls}>
            <video autoPlay muted loop playsInline preload="none" className={mediaCls}>
              <source src={text(data.video_ur) || undefined} />
              Your browser does not support the video tag.
            </video>
          </SlideLink>
        )}
        <div
          className={cx('absolute inset-0 z-[3] flex items-center justify-center', !btnTxt && 'pointer-events-none')}
        >
          <div className={cx('px-4 w-full h-full flex', posClassOf(posFixed))}>
            {hasText && (
              <TextContent
                source={data}
                className={cx(
                  'text-content max-w-[95%] sm:max-w-[70%] lg:max-w-[50%] p-4 sm:p-6',
                  `sizing-${sizeOf(data.hajm_khat_sura)}`
                )}
                btnWrapClass="mt-3 md:mt-6"
                dataStyle={optionValue(data.btn_sselector)}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const effect = optionValue(data.choose_movement) || 'slide';

  return (
    <section
      className={cx('s-block V__micr', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_multi_slider-${position}`}
      id={`V_multi_slider-${position}`}
    >
      <div className={hasContainer ? 'container' : ''}>
        {isSlider ? (
          <SallaSlider
            id={`main-slider-${position}`}
            className={isDots ? 'is_dots' : undefined}
            direction={booleanValue(data.is_dire) ? 'ltr' : 'rtl'}
            showControls={false}
            loop={booleanValue(data.is_loop)}
            autoPlay={booleanValue(data.is_autoplay)}
            sliderConfig={sliderConfigOf(effect, isDots, `main-slider-${position}`)}
            type="fullwidth"
          >
            <div slot="items">{renderSlides()}</div>
          </SallaSlider>
        ) : (
          renderStatic()
        )}
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
