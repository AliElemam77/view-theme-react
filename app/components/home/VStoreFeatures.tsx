import { createElement, memo, useEffect, useRef } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VStoreFeatureItem {
  icon?: string;
  add_image?: string;
  lord_ur?: string;
  title?: string;
  text?: string;
  add_button?: boolean;
  btn_fqa?: string;
  btn_url?: unknown;
  btn_style?: unknown;
}

export interface VStoreFeaturesData {
  has_container?: boolean;
  notmrb?: boolean;
  has_slider?: boolean;
  display_section?: unknown;
  invert_image_dark?: boolean;
  features?: unknown;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const LORDICON_SRC = 'https://cdn.lordicon.com/lordicon.js';

/** `md:grid-cols-{{ c.features|length }}`, spelled out so Tailwind sees the classes. */
const MD_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
};

/** Twig's `item.btn_style[0]`: the first entry of a list; anything else gives null. */
const firstOf = (value: unknown) => (Array.isArray(value) ? optionValue(value[0]) : '');

/**
 * Port of `V_store_features.twig`: a grid (or a looping carousel when `has_slider`)
 * of features, each an icon / image / `<lord-icon>`, a title, a text and an
 * optional button. With `display_section = lord`, the inline script loads the
 * lordicon script once, the first time one of the icons scrolls into view.
 */
export const VStoreFeatures = memo(function VStoreFeatures({ data = {} }: { data?: VStoreFeaturesData }) {
  const { t } = useTranslation();
  const { reveal, spacing } = useViewSettings();
  const rootRef = useRef<HTMLElement>(null);

  const position = twigPosition(data);
  const features = collectionItems<VStoreFeatureItem>(data.features, 'features');
  const hasSlider = booleanValue(data.has_slider);
  const displaySection = optionValue(data.display_section);
  const invert = booleanValue(data.invert_image_dark);
  const isLord = displaySection === 'lord';

  useEffect(() => {
    if (!isLord) return;
    const root = rootRef.current;
    const icons = root ? root.querySelectorAll('lord-icon') : [];
    if (!icons.length || typeof IntersectionObserver === 'undefined') return;
    if (document.querySelector(`script[src="${LORDICON_SRC}"]`)) return;
    const observer = new IntersectionObserver((entries, obs) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      obs.disconnect();
      if (document.querySelector(`script[src="${LORDICON_SRC}"]`)) return;
      const script = document.createElement('script');
      script.src = LORDICON_SRC;
      script.async = true;
      document.body.appendChild(script);
    });
    icons.forEach((icon) => observer.observe(icon));
    return () => observer.disconnect();
  }, [isLord, features.length]);

  const items = features.map((item, idx) => {
    const isLast = idx === features.length - 1;
    let border = '';
    if (!isLast) {
      border =
        !hasSlider && idx === 1
          ? 'md:border-s border-s-0 border-lightgray ps-4'
          : 'border-s border-lightgray ps-4';
    }
    const title = text(item.title);
    let media;
    if (isLord && text(item.lord_ur)) {
      media = createElement('lord-icon', {
        src: text(item.lord_ur),
        trigger: 'loop',
        style: { width: '3.5rem', height: '3.5rem' },
        'aria-label': t('common.animated_icon'),
      });
    } else if (displaySection === 'img' && text(item.add_image)) {
      media = (
        <img
          src={text(item.add_image)}
          alt={title}
          className={cx('object-contain', invert && 'dark:invert carbon:invert')}
          width={100}
          height={100}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
        />
      );
    } else {
      media = <i className={cx(text(item.icon), 'md:text-7xl text-5xl text-primary')} aria-hidden="true" />;
    }

    return (
      // A settings list without ids.
      // react-doctor-disable-next-line react-doctor/no-array-index-as-key
      <div
        key={idx}
        className={cx(reveal, 'h-full flex-col center-between text-center gap-2 sizing-xxs', border)}
        role="group"
        aria-label={String(t('common.feature_aria', { title })).replace(':title', title)}
      >
        <div className="lg:max-w-20 md:max-w-16 max-w-12">{media}</div>
        <h2 className="md:text-base text-xs text-primary-l font-light">{title}</h2>
        <p className="md:text-2xl text-lg text-primary-d font-bold">{text(item.text)}</p>
        {twigTruthy(item.add_button) && (
          <ActionBtn
            text={text(item.btn_fqa)}
            href={linkUrl(item.btn_url)}
            dataStyle={firstOf(item.btn_style)}
            color="var(--color-bg)"
            backgroundColor="var(--color-primary-dark)"
            icon
          />
        )}
      </div>
    );
  });

  return (
    <section
      ref={rootRef}
      className={cx('s-block V_store_features', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_store_features-${position}`}
      id={`V_store_features-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        {hasSlider ? (
          <SallaSlider
            id={`carousel-left-${position}`}
            aria-label={`slider-featuers-${position}`}
            loop
            showControls={false}
            type="carousel"
            sliderConfig={{
              breakpoints: {
                0: { slidesPerView: 1 },
                667: { slidesPerView: 2 },
                880: { slidesPerView: 3 },
                1025: { slidesPerView: 4 },
              },
            }}
          >
            <div slot="items">{items}</div>
          </SallaSlider>
        ) : (
          <div
            className={cx(
              'grid gap-4 md:gap-6 justify-center items-start text-center grid-cols-2',
              MD_COLS[features.length] ?? `md:grid-cols-${features.length}`
            )}
          >
            {items}
          </div>
        )}
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
