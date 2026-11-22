import { memo } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  collection?: VLinksGalleryItem[];
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VLinksGallery = memo(function VLinksGallery({
  data,
}: {
  data?: VLinksGalleryData;
}) {
  if (!data) return null;

  const items = Array.isArray(data.collection) ? data.collection : [];

  return (
    <SectionWrapper
      id={`V_links_gallery-${data.position ?? 0}`}
      ariaLabel="Section V_links_gallery"
      className="V_links_gallery"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
        />

        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-6 gap-4">
          {items.map((item, idx) => {
            const bgGrad =
              item.lon_alkhlfeh_alaol && item.lon_alkhlfeh_althana
                ? `linear-gradient(to left, ${item.lon_alkhlfeh_alaol}, ${item.lon_alkhlfeh_althana})`
                : undefined;

            const features = (item.text_area || '')
              .split('%%')
              .map((f) => f.trim())
              .filter(Boolean);

            const isHalf = Boolean(item.tsgher_alsorh_ala_annsf_fa_aldes_tob);

            return (
              <article
                key={idx}
                className={`rounded-theme min-h-52 flex flex-col sm:flex-row h-full overflow-hidden relative ${
                  isHalf ? 'sm:col-span-1' : 'sm:col-span-2'
                }`}
                style={{ background: bgGrad }}
              >
                <div className="p-4 sm:p-6 flex flex-col justify-between z-2 flex-1">
                  <div>
                    {item.alns_alreesa && (
                      <h3 className="text-lg font-semibold mb-3 text-darkgray">
                        {item.alns_alreesa}
                      </h3>
                    )}
                    <ul className="space-y-2 text-sm leading-6">
                      {features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <i
                            className={`${item.icon_picker || 'sicon-check'} mt-1 text-primary`}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {item.ns_alzr && (
                    <div className="mt-4 w-fit">
                      <ActionBtn
                        text={item.ns_alzr}
                        href={linkUrl(item.btn_url)}
                        dataStyle="filled"
                        color={item.lon_alkhlfeh_alaol}
                        backgroundColor="var(--color-primary)"
                        icon
                      />
                    </div>
                  )}
                </div>

                {item.sorh_almntg_ao_mgmoaah_mntgat && (
                  <div className="flex-1 relative z-1 flex items-end justify-center">
                    <img
                      src={item.sorh_almntg_ao_mgmoaah_mntgat}
                      alt={item.alns_alreesa || ''}
                      className="sm:w-auto w-full max-h-72 object-contain"
                      loading="lazy"
                      width={800}
                      height={600}
                    />
                  </div>
                )}
              </article>
            );
          })}
        </div>
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
