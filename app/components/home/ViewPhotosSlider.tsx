/**
 * Port of View's `home/photos-slider.twig`: a centred, autoplaying carousel with
 * pagination; each slide is the banner at its own height (`w-full object-contain
 * rounded-md`). The `<section>` is the block wrapper (`photosSliderConfig`).
 */
import { memo } from 'react';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';

interface PhotoItem {
  id?: string | number;
  url?: string;
  image?: string | { url?: string; alt?: string };
}

export interface ViewPhotosSliderData {
  items?: PhotoItem[];
  position?: number;
  is_repeated?: boolean;
  [key: string]: unknown;
}

const imageUrl = (image: PhotoItem['image']) => (typeof image === 'string' ? image : image?.url);

export const ViewPhotosSlider = memo(function ViewPhotosSlider({ data = {} }: { data?: ViewPhotosSliderData }) {
  const { store } = useTwilight();
  const items = data.items ?? [];
  if (!items.length) return null;
  return (
    <SallaSlider
      type="carousel"
      className="home-slider photos-slider"
      centered
      autoPlay
      pagination
      id={`photos-${data.position ?? 0}-slider`}
    >
      <div slot="items">
        {items.map((item, index) => (
          <div key={item.id ?? `${item.url ?? ''}:${imageUrl(item.image) ?? ''}`} className="swiper-slide">
            <Link to={item.url || '#'}>
              <img
                src={imageUrl(item.image)}
                className="w-full object-contain rounded-md"
                height={300}
                width={1200}
                alt={`${store?.name ?? ''} image-slider-${index}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            </Link>
          </div>
        ))}
      </div>
    </SallaSlider>
  );
});

export const photosSliderConfig = {
  className: (data: ViewPhotosSliderData) =>
    `s-block s-block--photos-slider${data.is_repeated ? ' repeated-block' : ''}`,
};
