/**
 * Port of View's `home/enhanced-square-banners.twig`: up to three banners in one
 * row (`md:grid-cols-N`, `h-lg-banner`), more in a 3-col `two-row` grid
 * (`h-banner`); a banner with a title gets the dark overlay. The `<section>`
 * (`s-block--banners container`) is the block wrapper (`enhancedSquareBannersConfig`).
 */
import { memo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

interface BannerItem {
  image?: string;
  url?: string;
  title?: string;
  description?: string;
}

export interface EnhancedSquareBannersProps {
  data: {
    banners?: BannerItem[];
    position?: number;
    [key: string]: unknown;
  };
}

export const EnhancedSquareBanners = memo(function EnhancedSquareBanners({ data }: EnhancedSquareBannersProps) {
  const banners = Array.isArray(data.banners) ? data.banners : [];
  const few = banners.length <= 3;
  // Spelled out so Tailwind sees each class (Twig builds `md:grid-cols-N`).
  const cols = few ? (['', 'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3'][banners.length] ?? '') : 'md:grid-cols-3 two-row';
  return (
    <div className={`grid ${cols} grid-flow-row gap-3 sm:gap-8`}>
      {banners.map((banner, index) => (
        // A settings list without ids.
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <Link
          key={index}
          to={banner.url || '#'}
          aria-label={banner.title || `square-banner-${index}`}
          className={`banner-entry ${banner.title ? 'has-overlay' : ''} ${few ? 'h-lg-banner' : 'h-banner'}`}
          style={banner.image ? { backgroundImage: `url(${banner.image})` } : undefined}
        >
          <article className="banner-entry__text text-with-border">
            <h3 className="banner__title font-bold mb-1 leading-6">{banner.title}</h3>
            <p className="banner__description">{banner.description}</p>
          </article>
        </Link>
      ))}
    </div>
  );
});

export const enhancedSquareBannersConfig = {
  className: 's-block s-block--banners container',
};
