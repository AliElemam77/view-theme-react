import { createElement, memo, useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import {
  collectionItems,
  cx,
  separatorProps,
  text,
  twigDefaultTrue,
  twigPosition,
  twigTruthy,
} from './ViewBlockUtils';

export interface VGroupFeatureItem {
  icon?: string;
  add_image?: string;
  lord_ur?: string;
  title?: string;
  text?: string;
}

export interface VGroupContentItem {
  button_link?: unknown;
  main_image?: string;
}

export interface VGroupFeaturesData {
  has_container?: boolean;
  notmrb?: boolean;
  display_section?: unknown;
  invert_image_dark?: boolean;
  features?: unknown;
  custom_content?: unknown;
  use_custom_colors?: boolean;
  collection_bg_color?: string;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const PLACEHOLDER = '/images/placeholder.webp';
const LORDICON_SRC = 'https://cdn.lordicon.com/lordicon.js';
const ICON_ALT = 'أيقونة الميزة';

function Sparkles() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.703 15.2061C17.5468 14.0059 16.5661 13.0407 15.3554 0C14.1408 13.0407 13.1601 14.0059 0 15.2061C13.1601 16.3999 14.1408 17.3794 15.3554 30.4123C16.5661 17.3794 17.5468 16.3999 30.703 15.2061Z"
        fill="var(--color-primary)"
      />
      <path
        d="M9.92749 28.4053C9.46505 33.3701 9.08964 33.739 4.07812 34.1975C9.08964 34.6522 9.46505 35.0315 9.92749 40.0002C10.3821 35.0289 10.7576 34.6522 15.7717 34.1975C10.7576 33.739 10.3821 33.3701 9.92749 28.4053Z"
        fill="var(--color-primary)"
      />
      <path
        d="M28.1107 26.4675C28.4134 23.2434 28.6576 23.0044 31.9142 22.6991C28.6576 22.4042 28.4134 22.1665 28.1107 18.9424C27.8133 22.1665 27.5678 22.4042 24.3086 22.6991C27.5678 23.0044 27.8133 23.2434 28.1107 26.4675Z"
        fill="var(--color-primary)"
      />
    </svg>
  );
}

/** Loads lordicon.js once, when the first `<lord-icon>` of the block scrolls into view (Twig's inline script). */
function useLordIconLoader(enabled: boolean, rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root || typeof IntersectionObserver === 'undefined') return;
    const icons = root.querySelectorAll('lord-icon');
    if (!icons.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (document.querySelector(`script[src="${LORDICON_SRC}"]`)) return;
      const script = document.createElement('script');
      script.src = LORDICON_SRC;
      script.async = true;
      document.body.appendChild(script);
    });
    icons.forEach((icon) => observer.observe(icon));
    return () => observer.disconnect();
  }, [enabled, rootRef]);
}

/**
 * Port of `V_group_features.twig`: three features on each side of a rounded figure
 * holding a `fullwidth` `<salla-slider>` of the `custom_content` images.
 */
export const VGroupFeatures = memo(function VGroupFeatures({
  data = {},
}: {
  data?: VGroupFeaturesData;
}) {
  const { reveal, spacing } = useViewSettings();
  const sectionRef = useRef<HTMLElement>(null);

  const position = twigPosition(data);
  const display = optionValue(data.display_section);
  const features = collectionItems<VGroupFeatureItem>(data.features, 'features');
  const content = collectionItems<VGroupContentItem>(data.custom_content, 'custom_content');
  const left = features.slice(0, 3);
  const right = features.slice(3, 6);
  const invert = twigDefaultTrue(data.invert_image_dark) ? 'dark:invert carbon:invert' : '';
  const circleBg = booleanValue(data.use_custom_colors)
    ? text(data.collection_bg_color) || '#E4ECE0'
    : 'var(--color-primary-ops)';

  useLordIconLoader(display === 'lord', sectionRef);

  const media = (f: VGroupFeatureItem, alt: string) => {
    if (display === 'lord' && text(f.lord_ur) !== '') {
      return createElement('lord-icon', {
        src: text(f.lord_ur),
        trigger: 'loop',
        className: 'w-10 h-10 shrink-0',
        'aria-label': alt,
      });
    }
    if (display === 'icon' && text(f.icon) !== '') {
      return <i className={`${text(f.icon)} text-2xl`} aria-hidden="true" />;
    }
    if (twigTruthy(f.add_image)) {
      return (
        <img
          src={text(f.add_image) || PLACEHOLDER}
          alt={alt}
          width={40}
          height={40}
          className={cx('w-10 h-10 shrink-0 rounded-md', invert)}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
        />
      );
    }
    return null;
  };

  return (
    <section
      ref={sectionRef}
      id={`V_group_features-${position}`}
      className={cx('s-block V__group_features', !booleanValue(data.notmrb) && spacing)}
      aria-labelledby={`V_group_features-heading-${position}`}
      role="region"
    >
      <div className={cx('relative overflow-hidden', booleanValue(data.has_container) && 'container')}>
        <div className="flex justify-center items-stretch md:flex-row flex-col gap-4 md:gap-6">
          <ul className="flex flex-col justify-between flex-1 gap-4 ordering it lef" role="list">
            {left.map((f, idx) => (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <li
                key={idx}
                className={cx(
                  'flex',
                  reveal,
                  'items-start justify-start gap-3 md:gap-4 flex-row-reverse',
                  idx === 0 && 'md:-ml-10',
                  idx === left.length - 1 && 'md:-ml-10'
                )}
              >
                {media(f, text(f.title))}
                <div>
                  <p className="font-semibold leading-6 text-left text-primary-d">{text(f.title)}</p>
                  {twigTruthy(f.text) && (
                    <p className="mt-1 text-sm text-muted-foreground text-primary">{text(f.text)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="relative mx-auto flex-1">
            <figure
              className="relative mx-auto V__group_features__img overflow-hidden"
              aria-describedby={`V_group_features-figcaption-${position}`}
            >
              <div className="absolute top-20 right-0">
                <Sparkles />
              </div>
              <div
                className={cx('absolute inset-0 rounded-full', reveal)}
                style={{ background: circleBg }}
                aria-hidden="true"
              />
              <div
                className={cx('bordering absolute inset-0 left-4 rounded-full border border-primary-d', reveal)}
                aria-hidden="true"
              />
              {content.length > 0 && (
                <div className="absolute inset-0 m-auto">
                  <SallaSlider
                    id={`main-slider-${position}`}
                    className="block h-full"
                    type="fullwidth"
                    showControls={false}
                    data-autoplay="true"
                  >
                    <div slot="items">
                      {content.map((item, idx) => (
                        // A settings list without ids.
                        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                        <Link
                          key={idx}
                          to={linkUrl(item.button_link) || '#'}
                          aria-label="product image"
                          className={reveal || undefined}
                        >
                          <img
                            src={text(item.main_image) || PLACEHOLDER}
                            alt="main image"
                            className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,.45)] max-h-[520px] mx-auto"
                            loading="lazy"
                            decoding="async"
                            fetchPriority="auto"
                            width={800}
                            height={800}
                          />
                        </Link>
                      ))}
                    </div>
                  </SallaSlider>
                </div>
              )}
              <div className="absolute bottom-20 left-0">
                <Sparkles />
              </div>
            </figure>
          </div>
          <ul className="flex flex-col justify-between flex-1 gap-4 it" role="list">
            {right.map((f, idx) => (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <li
                key={idx}
                className={cx(
                  'flex',
                  reveal,
                  'items-start justify-start gap-3 md:gap-4',
                  idx === 0 && 'md:-mr-10',
                  idx === right.length - 1 && 'md:-mr-10'
                )}
              >
                {media(f, text(f.title) || ICON_ALT)}
                <div>
                  <p className="font-semibold leading-6 text-primary-d">{text(f.title)}</p>
                  {twigTruthy(f.text) && (
                    <p className="mt-1 text-sm text-muted-foreground text-primary">{text(f.text)}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
