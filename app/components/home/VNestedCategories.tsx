import { memo } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface VNestedCategoryItem {
  button_link?: unknown;
  main_image?: string;
}

export interface VNestedCategoriesData {
  has_container?: boolean;
  notmrb?: boolean;
  bg_image?: string;
  custom_content?: VNestedCategoryItem[];
  main_title?: string;
  sub_title?: string;
  ns_alzr?: string;
  btn_url?: unknown;
  btn_style?: unknown;
  bg_two_color?: string;
  lawn_alnosoos?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VNestedCategories = memo(function VNestedCategories({
  data,
}: {
  data?: VNestedCategoriesData;
}) {
  if (!data) return null;

  const items = Array.isArray(data.custom_content) ? data.custom_content : [];

  const sectionStyle: CSSProperties = data.bg_image
    ? {
        backgroundImage: `url(${data.bg_image})`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <SectionWrapper
      id={`V_nested_categories-${data.position ?? 0}`}
      ariaLabel="Section V_nested_categories"
      className="V__nested_categories"
      style={sectionStyle}
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={`${data.has_container !== false ? 'container' : ''} h-full py-5`}>
        <div className="flex flex-col h-full gap-6 justify-between overflow-hidden">
          {items.length > 0 && (
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-center gap-4 flex-nowrap">
                {items.map((item, idx) => (
                  <div key={idx} className="shrink-0">
                    <a
                      href={linkUrl(item.button_link) || '#'}
                      className="block p-2 rounded-theme hover:scale-105 transition-transform"
                    >
                      <img
                        src={item.main_image || '/images/placeholder.webp'}
                        alt=""
                        className="w-full h-full object-contain max-w-32 max-h-20"
                        style={{ aspectRatio: '64/39' }}
                        loading="lazy"
                        width={300}
                        height={300}
                      />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 items-center text-center">
            {data.main_title && (
              <h1 className="text-center font-medium lg:text-4xl md:text-2xl text-base">
                {data.main_title}
              </h1>
            )}
            {data.sub_title && (
              <p className="text-center text-muted-foreground">{data.sub_title}</p>
            )}
            {data.ns_alzr && (
              <ActionBtn
                text={data.ns_alzr}
                href={linkUrl(data.btn_url)}
                dataStyle={optionValue(data.btn_style) || 'filled'}
                color={data.bg_two_color}
                backgroundColor={data.lawn_alnosoos}
                icon
                className="!w-fit mt-2"
              />
            )}
          </div>
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
