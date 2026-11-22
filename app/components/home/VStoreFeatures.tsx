import { memo } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  features?: VStoreFeatureItem[];
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VStoreFeatures = memo(function VStoreFeatures({
  data,
}: {
  data?: VStoreFeaturesData;
}) {
  if (!data) return null;

  const features = Array.isArray(data.features) ? data.features : [];
  if (!features.length) return null;

  const displaySection = optionValue(data.display_section) || 'icon';

  return (
    <SectionWrapper
      id={`V_store_features-${data.position ?? 0}`}
      ariaLabel="Section V_store_features"
      className="V_store_features"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <div
          className={`grid gap-4 md:gap-6 justify-center items-start text-center grid-cols-2 md:grid-cols-${Math.min(
            features.length,
            4
          )}`}
        >
          {features.map((item, idx) => {
            const isLast = idx === features.length - 1;

            return (
              <div
                key={idx}
                className={`h-full flex flex-col items-center justify-between text-center gap-2 p-3 ${
                  !isLast ? 'border-e border-gray-200 pe-4' : ''
                }`}
              >
                <div className="lg:max-w-20 md:max-w-16 max-w-12 h-16 flex items-center justify-center">
                  {displaySection === 'img' && item.add_image ? (
                    <img
                      src={item.add_image}
                      alt={item.title || ''}
                      className={`object-contain max-h-14 ${
                        data.invert_image_dark ? 'dark:invert carbon:invert' : ''
                      }`}
                      loading="lazy"
                      width={100}
                      height={100}
                    />
                  ) : (
                    <i
                      className={`${item.icon || 'sicon-check'} md:text-5xl text-4xl text-primary`}
                      aria-hidden="true"
                    />
                  )}
                </div>

                {item.title && (
                  <h2 className="md:text-base text-xs text-primary-l font-light">
                    {item.title}
                  </h2>
                )}

                {item.text && (
                  <p className="md:text-xl text-base text-primary-d font-bold">
                    {item.text}
                  </p>
                )}

                {item.add_button && item.btn_fqa && (
                  <div className="mt-2">
                    <ActionBtn
                      text={item.btn_fqa}
                      href={linkUrl(item.btn_url)}
                      dataStyle={optionValue(item.btn_style) || 'filled'}
                      color="var(--color-bg)"
                      backgroundColor="var(--color-primary-dark)"
                      icon
                    />
                  </div>
                )}
              </div>
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
