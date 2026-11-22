import { memo } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { CouponPill } from '../common/CouponPill';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VStyledCategoryItem {
  id?: number | string;
  name?: string;
  url?: string;
  image?: string;
  category_image?: string;
}

export interface VStyledCategoriesData {
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  has_discount_code?: boolean;
  discount_code?: string;
  discount_title?: string;
  enable_grid_layout?: boolean;
  enable_repetition?: boolean;
  enable_auto_scroll?: boolean;
  enable_store_categories?: boolean;
  select_store_categories?: VStyledCategoryItem[];
  custom_categories?: VStyledCategoryItem[];
  element_border_radius?: number;
  has_decorative_stars?: boolean;
  has_stars?: boolean;
  show_category_name?: boolean;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VStyledCategories = memo(function VStyledCategories({
  data,
}: {
  data?: VStyledCategoriesData;
}) {
  if (!data) return null;

  const isGrid = Boolean(data.enable_grid_layout);
  const categories =
    data.enable_store_categories && Array.isArray(data.select_store_categories) && data.select_store_categories.length > 0
      ? data.select_store_categories
      : Array.isArray(data.custom_categories)
      ? data.custom_categories
      : [];

  const borderRadius = typeof data.element_border_radius === 'number' ? data.element_border_radius : 16;
  const innerRadius = Math.max(0, borderRadius - 10);
  const showStars = data.has_decorative_stars !== undefined ? data.has_decorative_stars : (data.has_stars ?? true);
  const { discount_code: discountCode, discount_title: discountTitle } = data;

  return (
    <SectionWrapper
      id={`V_styled_categories-${data.position ?? 0}`}
      ariaLabel="Section V_styled_categories"
      className="V__styled_categories"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div
        className={`${
          data.has_container !== false ? 'container' : ''
        } overflow-hidden flex ${
          isGrid ? 'flex-col' : 'flex-col md:flex-row'
        } justify-between gap-3`}
      >
        <div
          className={`flex ${
            isGrid ? 'items-center' : 'md:items-start items-center'
          } flex-col justify-between gap-3 flex-1`}
        >
          <BlockTitle
            title={data.main_title}
            sub={data.sub_title}
            jocer={data.has_jocer_image}
            className="!m-0"
            level2Class={isGrid ? '!justify-center' : 'md:justify-start justify-center'}
          />
          {data.has_discount_code && discountCode && (
            <CouponPill code={discountCode} label={discountTitle} />
          )}
        </div>

        {isGrid ? (
          <div className="flex justify-center items-center md:gap-6 gap-5 flex-wrap">
            {categories.map((item, idx) => {
              const imgUrl =
                (data.enable_store_categories && data.select_store_categories ? item.image : item.category_image) ||
                item.image ||
                '/images/placeholder.webp';

              return (
                <div
                  key={item.id ?? idx}
                  className="res-quer flex items-center justify-center relative flex-col md:gap-5 gap-3"
                >
                  <div
                    className="sm:p-3 p-1.5 border border-primary relative"
                    style={{ borderRadius: `${borderRadius}px` }}
                  >
                    <a
                      href={item.url || '#'}
                      className="shine block"
                      aria-label={item.name}
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      <div
                        className="Tira__cat_after aspect-[1.565/1] bg-primaryops border-primary overflow-hidden flex items-center justify-center"
                        style={{ borderRadius: `${innerRadius}px` }}
                      >
                        <img
                          src={imgUrl}
                          alt={item.name || ''}
                          className="z-1 relative object-contain"
                          width={300}
                          height={300}
                          loading="lazy"
                        />
                      </div>
                    </a>

                    {showStars && (
                      <>
                        <svg
                          width="33"
                          height="33"
                          viewBox="0 0 33 33"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 -translate-y-1/2 w-6 -left-3 pointer-events-none"
                        >
                          <path
                            d="M16.4236 0L17.9707 4.66854C19.5694 9.49293 23.3543 13.2778 28.1787 14.8766L32.8473 16.4236L28.1787 17.9707C23.3543 19.5694 19.5694 23.3543 17.9707 28.1787L16.4236 32.8473L14.8766 28.1787C13.2778 23.3543 9.49293 19.5694 4.66854 17.9707L0 16.4236L4.66854 14.8766C9.49293 13.2778 13.2778 9.49293 14.8766 4.66854L16.4236 0Z"
                            fill="var(--color-primary)"
                          />
                        </svg>
                        <svg
                          width="33"
                          height="33"
                          viewBox="0 0 33 33"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="absolute top-1/2 -translate-y-1/2 w-6 -right-3 pointer-events-none"
                        >
                          <path
                            d="M16.4236 0L17.9707 4.66854C19.5694 9.49293 23.3543 13.2778 28.1787 14.8766L32.8473 16.4236L28.1787 17.9707C23.3543 19.5694 19.5694 23.3543 17.9707 28.1787L16.4236 32.8473L14.8766 28.1787C13.2778 23.3543 9.49293 19.5694 4.66854 17.9707L0 16.4236L4.66854 14.8766C9.49293 13.2778 13.2778 9.49293 14.8766 4.66854L16.4236 0Z"
                            fill="var(--color-primary)"
                          />
                        </svg>
                      </>
                    )}
                  </div>

                  {data.show_category_name && (
                    <b className="text-primary-d text-sm font-semibold">{item.name}</b>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="block lg:w-3/4 md:w-2/3 overflow-x-auto pb-4">
            <div className="flex items-center gap-4 flex-nowrap min-w-max">
              {categories.map((item, idx) => {
                const imgUrl =
                  (data.enable_store_categories && data.select_store_categories ? item.image : item.category_image) ||
                  item.image ||
                  '/images/placeholder.webp';

                return (
                  <div
                    key={item.id ?? idx}
                    className="flex items-center justify-center relative flex-col md:gap-5 gap-3 shrink-0"
                    style={{ width: '160px' }}
                  >
                    <div
                      className="sm:p-3 p-1.5 border border-primary relative w-full"
                      style={{ borderRadius: `${borderRadius}px` }}
                    >
                      <a
                        href={item.url || '#'}
                        className="shine block"
                        aria-label={item.name}
                        style={{ borderRadius: `${borderRadius}px` }}
                      >
                        <div
                          className="Tira__cat_after aspect-[1.565/1] bg-primaryops border-primary overflow-hidden flex items-center justify-center"
                          style={{ borderRadius: `${innerRadius}px` }}
                        >
                          <img
                            src={imgUrl}
                            alt={item.name || ''}
                            className="z-1 relative object-contain"
                            width={300}
                            height={300}
                            loading="lazy"
                          />
                        </div>
                      </a>

                      {showStars && (
                        <>
                          <svg
                            width="33"
                            height="33"
                            viewBox="0 0 33 33"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-1/2 -translate-y-1/2 w-6 -left-3 pointer-events-none"
                          >
                            <path
                              d="M16.4236 0L17.9707 4.66854C19.5694 9.49293 23.3543 13.2778 28.1787 14.8766L32.8473 16.4236L28.1787 17.9707C23.3543 19.5694 19.5694 23.3543 17.9707 28.1787L16.4236 32.8473L14.8766 28.1787C13.2778 23.3543 9.49293 19.5694 4.66854 17.9707L0 16.4236L4.66854 14.8766C9.49293 13.2778 13.2778 9.49293 14.8766 4.66854L16.4236 0Z"
                              fill="var(--color-primary)"
                            />
                          </svg>
                          <svg
                            width="33"
                            height="33"
                            viewBox="0 0 33 33"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="absolute top-1/2 -translate-y-1/2 w-6 -right-3 pointer-events-none"
                          >
                            <path
                              d="M16.4236 0L17.9707 4.66854C19.5694 9.49293 23.3543 13.2778 28.1787 14.8766L32.8473 16.4236L28.1787 17.9707C23.3543 19.5694 19.5694 23.3543 17.9707 28.1787L16.4236 32.8473L14.8766 28.1787C13.2778 23.3543 9.49293 19.5694 4.66854 17.9707L0 16.4236L4.66854 14.8766C9.49293 13.2778 13.2778 9.49293 14.8766 4.66854L16.4236 0Z"
                              fill="var(--color-primary)"
                            />
                          </svg>
                        </>
                      )}
                    </div>

                    {data.show_category_name && (
                      <b className="text-primary-d text-sm font-semibold">{item.name}</b>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
