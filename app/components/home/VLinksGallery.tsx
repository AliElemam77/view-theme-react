import { memo } from 'react';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VLinksGalleryItem {
  alns_alreesa?: string;
  text_area?: string;
  icon_picker?: string;
  ns_alzr?: string;
  btn_url?: unknown;
  lon_alkhlfeh_alaol?: string;
  lon_alkhlfeh_althana?: string;
  tsgher_alsorh_ala_annsf_fa_aldes_tob?: boolean;
  sorh_almntg_ao_mgmoaah_mntgat?: string;
}

export interface VLinksGalleryData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  collection?: unknown;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const PLACEHOLDER = '/images/placeholder.webp';

const stripTags = (value: string) => value.replace(/<[^>]*>/g, '');

/**
 * Port of `V_links_gallery.twig`: a right-to-left grid of gradient cards (half or
 * full width), each with a title, `%%`-separated feature lines, a `custom/btn`
 * link and an image pinned to the bottom-left from `sm`.
 */
export const VLinksGallery = memo(function VLinksGallery({ data = {} }: { data?: VLinksGalleryData }) {
  const { reveal, spacing } = useViewSettings();
  const position = twigPosition(data);
  const items = collectionItems<VLinksGalleryItem>(data.collection, 'collection');

  return (
    <section
      dir="rtl"
      className={cx('s-block V_links_gallery', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_links_gallery-${position}`}
      id={`V_links_gallery-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          jocer={booleanValue(data.has_jocer_image)}
        />
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-6 gap-4">
          {items.map((item, index) => {
            const from = text(item.lon_alkhlfeh_alaol);
            const to = text(item.lon_alkhlfeh_althana);
            const title = text(item.alns_alreesa);
            const features = text(item.text_area).split('%%');
            return (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <article
                key={index}
                className={cx(
                  'rounded-theme',
                  reveal,
                  'min-h-52 flex flex-col sm:flex-row h-full overflow-hidden relative',
                  twigTruthy(item.tsgher_alsorh_ala_annsf_fa_aldes_tob) ? 'sm:col-span-1' : 'sm:col-span-2'
                )}
                style={{ background: `linear-gradient(to left, ${from}, ${to})` }}
              >
                <div className="p-2 flex flex-col justify-between z-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{title}</h3>
                    <ul className="space-y-2 text-sm leading-6">
                      {features.map((feature, fIndex) =>
                        feature.trim() ? (
                          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                          <li key={fIndex} className="flex items-start gap-2">
                            <i className={cx(text(item.icon_picker), 'mt-1')} />
                            <span>{feature}</span>
                          </li>
                        ) : null
                      )}
                    </ul>
                  </div>
                  <div className="mt-4 w-fit">
                    <ActionBtn
                      text={text(item.ns_alzr)}
                      href={linkUrl(item.btn_url)}
                      dataStyle="filled"
                      color={from}
                      backgroundColor="var(--color-primary)"
                      icon
                    />
                  </div>
                </div>
                <div className="flex-1 relative z-1">
                  <img
                    src={text(item.sorh_almntg_ao_mgmoaah_mntgat) || PLACEHOLDER}
                    alt={stripTags(title)}
                    className="sm:w-auto w-full object-cover sm:absolute relative bottom-0 sm:left-0 lazy"
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="auto"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
