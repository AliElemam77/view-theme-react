import { memo } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  features?: VGroupFeatureItem[];
  custom_content?: VGroupContentItem[];
  use_custom_colors?: boolean;
  collection_bg_color?: string;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VGroupFeatures = memo(function VGroupFeatures({
  data,
}: {
  data?: VGroupFeaturesData;
}) {
  if (!data) return null;

  const features = Array.isArray(data.features) ? data.features : [];
  const content = Array.isArray(data.custom_content) ? data.custom_content : [];
  const leftFeatures = features.slice(0, 3);
  const rightFeatures = features.slice(3, 6);

  const displaySection = optionValue(data.display_section) || 'icon';
  const circleBg = data.use_custom_colors
    ? data.collection_bg_color || '#E4ECE0'
    : 'var(--color-primary-ops)';

  return (
    <SectionWrapper
      id={`V_group_features-${data.position ?? 0}`}
      ariaLabel="Section V_group_features"
      className="V__group_features"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div
        className={`relative overflow-hidden ${
          data.has_container !== false ? 'container' : ''
        }`}
      >
        <div className="flex justify-center items-stretch md:flex-row flex-col gap-4 md:gap-6 py-8">
          {/* Left features column */}
          <ul
            className="flex flex-col justify-between flex-1 gap-6 it lef"
            role="list"
          >
            {leftFeatures.map((f, idx) => (
              <li
                key={idx}
                className="flex items-start justify-start gap-3 md:gap-4 flex-row-reverse"
              >
                {displaySection === 'img' && f.add_image ? (
                  <img
                    src={f.add_image}
                    alt={f.title || ''}
                    width={40}
                    height={40}
                    className={`w-10 h-10 shrink-0 rounded-md object-contain ${
                      data.invert_image_dark ? 'dark:invert carbon:invert' : ''
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <i
                    className={`${f.icon || 'sicon-check'} text-2xl text-primary`}
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="font-semibold leading-6 text-start text-primary-d">
                    {f.title}
                  </p>
                  {f.text && (
                    <p className="mt-1 text-sm text-muted-foreground text-primary">
                      {f.text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {/* Center feature image */}
          <div className="relative mx-auto flex-1 flex items-center justify-center min-h-[350px]">
            <div className="relative mx-auto V__group_features__img overflow-hidden w-full max-w-[380px] aspect-square flex items-center justify-center">
              <div
                className="absolute inset-4 rounded-full"
                style={{ background: circleBg }}
                aria-hidden="true"
              />
              <div
                className="bordering absolute inset-4 border border-primary-d rounded-full"
                aria-hidden="true"
              />

              {content.length > 0 && (
                <div className="relative z-10 p-6 flex items-center justify-center">
                  <a
                    href={linkUrl(content[0].button_link) || '#'}
                    aria-label="product image"
                  >
                    <img
                      src={content[0].main_image || '/images/placeholder.webp'}
                      alt="main image"
                      className="object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,.45)] max-h-[300px] mx-auto"
                      loading="lazy"
                      width={800}
                      height={800}
                    />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right features column */}
          <ul className="flex flex-col justify-between flex-1 gap-6 it" role="list">
            {rightFeatures.map((f, idx) => (
              <li
                key={idx}
                className="flex items-start justify-start gap-3 md:gap-4"
              >
                {displaySection === 'img' && f.add_image ? (
                  <img
                    src={f.add_image}
                    alt={f.title || ''}
                    width={40}
                    height={40}
                    className={`w-10 h-10 shrink-0 rounded-md object-contain ${
                      data.invert_image_dark ? 'dark:invert carbon:invert' : ''
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <i
                    className={`${f.icon || 'sicon-check'} text-2xl text-primary`}
                    aria-hidden="true"
                  />
                )}
                <div>
                  <p className="font-semibold leading-6 text-primary-d">{f.title}</p>
                  {f.text && (
                    <p className="mt-1 text-sm text-muted-foreground text-primary">
                      {f.text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
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
