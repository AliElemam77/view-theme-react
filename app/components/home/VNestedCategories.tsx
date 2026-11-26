import { memo, type CSSProperties } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export interface VNestedCategoryItem {
  button_link?: unknown;
  main_image?: string;
}

export interface VNestedCategoriesData {
  has_container?: boolean;
  notmrb?: boolean;
  bg_image?: string;
  custom_content?: unknown;
  main_title?: string;
  sub_title?: string;
  ns_alzr?: string;
  btn_url?: unknown;
  btn_style?: unknown;
  bg_two_color?: string;
  lawn_alnosoos?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

/** Twig's `slider-config`: a looping, centred creative-effect carousel fanning the side slides out. */
const SLIDER_CONFIG = {
  loop: true,
  slidesPerView: 7,
  effect: 'creative',
  centeredSlides: true,
  breakpoints: {
    1400: { slidesPerView: 7 },
    1200: { slidesPerView: 6 },
    992: { slidesPerView: 5 },
    768: { slidesPerView: 4 },
    0: { slidesPerView: 3 },
  },
  creativeEffect: {
    limitProgress: 3,
    perspective: true,
    progressMultiplier: 5,
    prev: { rotate: [0, 0, -1.6], translate: ['-22%', '2.4%', 0], origin: 'right bottom ' },
    next: { rotate: [0, 0, 1.6], translate: ['22%', '2.4%', 0], origin: 'left bottom' },
  },
};

/** Port of `V_nested_categories.twig`: a fanned logo carousel over a title, subtitle and button. */
export const VNestedCategories = memo(function VNestedCategories({
  data = {},
}: {
  data?: VNestedCategoriesData;
}) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const items = collectionItems<VNestedCategoryItem>(data.custom_content, 'custom_content');
  const bg = text(data.bg_image);

  const sectionStyle: CSSProperties = { backgroundSize: '100% 100%' };
  if (bg) sectionStyle.backgroundImage = `url(${bg})`;

  return (
    <section
      className={cx(
        's-block V__nested_categories ',
        !booleanValue(data.notmrb) && spacing,
        bg && 'bg-no-repeat bg-center lazy'
      )}
      style={sectionStyle}
      data-bg={bg || undefined}
      aria-label={`Section V_nested_categories-${position}`}
      id={`V_nested_categories-${position}`}
    >
      <div className={cx(booleanValue(data.has_container) && 'container', 'h-full py-5')}>
        <div className="flex flex-col h-full gap-3 justify-between overflow-hidden">
          <div className={cx('block', reveal)}>
            <SallaSlider
              id={`carousel-left-${position}`}
              loop
              showControls={false}
              type="carousel"
              sliderConfig={SLIDER_CONFIG}
            >
              <div slot="items">
                {items.map((item, index) => (
                  // A settings list without ids.
                  // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                  <div key={index}>
                    <Link to={linkUrl(item.button_link) || '#'}>
                      <img
                        src={text(item.main_image) || '/images/placeholder.webp'}
                        alt={`category-item-${index + 1}`}
                        className="w-full h-full object-contain max-w-32 max-h-20 lazy"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="auto"
                        width={300}
                        height={300}
                        style={{ aspectRatio: '64/39' }}
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </SallaSlider>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <h2 className={cx('text-center font-medium lg:text-4xl md:text-2xl text-base', reveal)}>
              {text(data.main_title)}
            </h2>
            <p className={cx('text-center', reveal)}>{text(data.sub_title)}</p>
            <ActionBtn
              text={text(data.ns_alzr)}
              href={linkUrl(data.btn_url)}
              dataStyle={optionValue(data.btn_style)}
              color={text(data.bg_two_color) || undefined}
              backgroundColor={text(data.lawn_alnosoos) || undefined}
              icon
              className="!w-fit"
            />
          </div>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
