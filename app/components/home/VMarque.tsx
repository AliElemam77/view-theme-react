import { memo, useState } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export interface MarqueeItem {
  item_text?: string;
  item_text_active?: string;
  text_color?: string;
  item_icon?: string;
  button_link?: unknown;
  button_text?: string;
  main_image?: string;
}

export interface VMarqueData {
  sellectstyle?: unknown;
  color_bg?: string;
  color_bgtow?: string;
  add_mask?: boolean;
  addraduse?: boolean;
  has_container?: boolean;
  notmrb?: boolean;
  offers_marquee?: unknown;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  use_custom_colors?: boolean;
  position?: number;
  [key: string]: unknown;
}

/**
 * Port of `V_marque.twig`: a free-mode `<salla-slider>` ticker (autoplay delay 1,
 * speed 5000). The `fixed` style floats at the bottom of the screen with a close
 * button that adds `V__marquee_hidden` (the `shrinkWidth` animation in home.scss).
 */
export const VMarque = memo(function VMarque({ data = {} }: { data?: VMarqueData }) {
  const { reveal, spacing } = useViewSettings();
  const [hidden, setHidden] = useState(false);

  const position = twigPosition(data);
  const isFixed = optionValue(data.sellectstyle) === 'fixed';
  const items = collectionItems<MarqueeItem>(data.offers_marquee, 'offers_marquee');

  return (
    <section
      className={cx(
        's-block V__marquee p-1',
        booleanValue(data.has_container) && 'container',
        isFixed && 'V__marquee_fixed',
        'flex',
        // `rounded-cotm` is defined nowhere in the Twig theme; kept as is.
        booleanValue(data.addraduse) && 'rounded-cotm',
        !booleanValue(data.notmrb) && !isFixed && spacing,
        hidden && 'V__marquee_hidden'
      )}
      style={{ background: `linear-gradient(to right, ${text(data.color_bgtow)}, ${text(data.color_bg)})` }}
      aria-label="Offers Section"
      id={`W__marquee-${position}`}
    >
      {isFixed && (
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="hover:opacity-40 transition-all opacity-70"
          aria-label="Close Offers Section"
        >
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M10.6673 2C6.07565 2 2.33398 5.74167 2.33398 10.3333C2.33398 14.925 6.07565 18.6667 10.6673 18.6667C15.259 18.6667 19.0007 14.925 19.0007 10.3333C19.0007 5.74167 15.259 2 10.6673 2ZM13.4673 12.25C13.709 12.4917 13.709 12.8917 13.4673 13.1333C13.3423 13.2583 13.184 13.3167 13.0257 13.3167C12.8673 13.3167 12.709 13.2583 12.584 13.1333L10.6673 11.2167L8.75065 13.1333C8.62565 13.2583 8.46732 13.3167 8.30898 13.3167C8.15065 13.3167 7.99232 13.2583 7.86732 13.1333C7.62565 12.8917 7.62565 12.4917 7.86732 12.25L9.78398 10.3333L7.86732 8.41667C7.62565 8.175 7.62565 7.775 7.86732 7.53333C8.10898 7.29167 8.50898 7.29167 8.75065 7.53333L10.6673 9.45L12.584 7.53333C12.8257 7.29167 13.2257 7.29167 13.4673 7.53333C13.709 7.775 13.709 8.175 13.4673 8.41667L11.5507 10.3333L13.4673 12.25Z"
              fill="white"
            />
          </svg>
        </button>
      )}
      <SallaSlider
        id={`coursol__marquee-${position}`}
        className={booleanValue(data.add_mask) ? 'add_mask' : ''}
        role="region"
        aria-label="Offers Carousel"
        centered
        loop
        showControls={false}
        type="carousel"
        sliderConfig={{
          loop: true,
          spaceBetween: 40,
          freeMode: true,
          centeredSlides: true,
          slidesPerView: 'auto',
          autoplay: { delay: 1, disableOnInteraction: true },
          speed: 5000,
        }}
      >
        <div slot="items">
          {items.map((item, index) => {
            const color = text(item.text_color) || undefined;
            const buttonText = text(item.button_text);
            const image = text(item.main_image);
            return (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <span key={index} className={cx('itemmarq', reveal)} style={{ color }} role="listitem">
                {text(item.item_text)}
                {isFixed ? (
                  <>
                    <span>{text(item.item_text_active)}</span>
                    <i className={text(item.item_icon)} aria-hidden="true" />
                  </>
                ) : (
                  <Link
                    to={linkUrl(item.button_link) || '#'}
                    style={{ borderColor: color }}
                    aria-label={`View Offer: ${buttonText}`}
                  >
                    {buttonText !== '' ? (
                      <span>{buttonText}</span>
                    ) : image !== '' ? (
                      <img
                        src={image}
                        alt={text(item.item_text_active)}
                        className="w-6 h-6"
                        width={24}
                        height={24}
                        loading="lazy"
                        decoding="async"
                        fetchPriority="auto"
                      />
                    ) : null}
                  </Link>
                )}
              </span>
            );
          })}
        </div>
      </SallaSlider>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
