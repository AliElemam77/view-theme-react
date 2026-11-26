import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useViewSettings } from '../../hooks/useViewSettings';

export interface BreakBrand {
  id?: number | string;
  name?: string;
  logo?: string;
}

export interface BrandsBreakProps {
  position?: number;
  brands?: BreakBrand[];
  reverse?: boolean;
  /** Twig `vetrical`: a vertical free-mode column (V_text_block). */
  vertical?: boolean;
  invertImageDark?: boolean;
}

const PLACEHOLDER = '/images/placeholder.webp';

/**
 * Port of `components/custom/break.twig`: an endless free-mode `<salla-slider>` of
 * brand logos (autoplay delay 1, speed 4000, or 2000 when vertical). `reverse`
 * runs it the other way by flipping `direction`/`dir` to `ltr`. The logos are
 * repeated twice, as in Twig.
 */
export function BrandsBreak({
  position,
  brands,
  reverse = false,
  vertical = false,
  invertImageDark = false,
}: BrandsBreakProps) {
  const { reveal } = useViewSettings();
  const list = Array.isArray(brands) ? brands : [];
  if (!list.length) return null;

  const pos = (Number(position) || 0) + 1;
  const kind = reverse ? 'reverse' : 'standard';
  const dir = reverse ? 'ltr' : 'rtl';

  return (
    <SallaSlider
      id={`carousel-${kind}-${pos}`}
      direction={dir}
      className="py-2 overflow-hidden"
      vertical={vertical}
      aria-label={`Brands Carousel ${position ?? ''}`}
      centered
      loop
      showControls={false}
      type="carousel"
      dir={dir}
      sliderConfig={{
        spaceBetween: 20,
        grabCursor: false,
        loop: true,
        slidesPerView: 'auto',
        shortSwipes: false,
        longSwipes: false,
        autoplay: { delay: 1 },
        freeMode: true,
        speed: vertical ? 2000 : 4000,
      }}
    >
      <div slot="items">
        {[0, 1].map((round) =>
          list.map((brand, index) => (
            <div key={`${round}-${brand.id ?? index}`} className={reveal || undefined}>
              <img
                src={brand.logo || PLACEHOLDER}
                alt={`${brand.name || ''} brand ${kind} ${pos}`}
                className={`max-w-44 ${invertImageDark ? 'dark:invert carbon:invert' : ''}`}
                width={200}
                height={200}
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
              />
            </div>
          ))
        )}
      </div>
    </SallaSlider>
  );
}
