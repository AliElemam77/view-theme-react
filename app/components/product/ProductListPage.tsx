import { useState, useRef, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNavigate, useLocation, useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { sortOptions, onSallaEvent } from '@salla.sa/twilight-theme-engine/utils';
import { Breadcrumb, NoContent, ProductCardSkeleton, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { SallaFilters } from '@salla.sa/twilight-components-react/filters';
import { ItemsList, ReviewItemSkeleton, type ItemsLoaderFn } from '@salla.sa/twilight-components-react';
import { Testimonials, useReorderButtons } from '@salla.sa/twilight-theme-engine/home';
import { product, parseNextPageToken } from '@salla.sa/twilight-theme-engine/api/product';
import type { ProductListLoaderData } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from './ProductCard';
import { useAppliedFilters } from '@salla.sa/twilight-theme-engine/routes/product-listing';
import type { ProductListFilters } from '@salla.sa/twilight-theme-engine/api/product';
import { BlockHookSlot } from '../common';
import { dispatchProductsFetched } from '../../lib/productsFetched';

/** `ItemsList`'s `loader` for infinite scroll - the route already loaded the
 * first page, so this fetches subsequent ones from `pagination.next`, which
 * `parseNextPageToken` reads as either a bare cursor token or (sources
 * without true cursor pagination, e.g. `offers`) a full next-page URL. */
function useCatalogLoader(
  source: ProductListLoaderData['source'],
  selectedSort: string,
  next: string | null | undefined,
  filters: ProductListFilters | null
): ItemsLoaderFn<Product> {
  const nextCursorRef = useRef<string | null>(next ?? null);
  useEffect(() => {
    nextCursorRef.current = next ?? null;
  }, [next]);

  return useCallback(async () => {
    const { cursor, page } = parseNextPageToken(nextCursorRef.current);
    const result = await product.list({
      source: source.type,
      sourceValue: source.value,
      ...(cursor && { cursor }),
      ...(page !== undefined && { page }),
      sort: selectedSort,
      ...(filters && { filterable: true, filters }),
    });
    nextCursorRef.current = result.next;
    dispatchProductsFetched(result, source);
    return result;
  }, [source, selectedSort, filters]);
}

type View = 'grid' | 'list';

type BrandEntity = { name: string; banner?: string; logo?: string; description?: string };

const GRID_ICON =
  'M26 8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm-2-8h-4a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4m2 24a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm-2-8h-4a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-4a4 4 0 0 0-4-4M10 8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zM8 0H4a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V4a4 4 0 0 0-4-4m2 24a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2zm-2-8H4a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-4a4 4 0 0 0-4-4';
const SORT_ICON =
  'M3.5.25a.75.75 0 0 1 .75.75v16.462l.006-.007c.21-.249.417-.512.61-.758l.045-.056c.192-.245.394-.502.55-.663a.75.75 0 0 1 1.077 1.045 9 9 0 0 0-.448.544l-.047.06c-.19.242-.413.527-.643.798-.246.29-.521.591-.797.826a2.7 2.7 0 0 1-.46.323 1.4 1.4 0 0 1-.643.176 1.4 1.4 0 0 1-.643-.176 2.7 2.7 0 0 1-.46-.323 7.4 7.4 0 0 1-.798-.826c-.23-.271-.452-.556-.642-.798l-.047-.06a9 9 0 0 0-.448-.544.75.75 0 0 1 1.076-1.046c.157.162.359.42.55.664l.046.056c.193.246.4.51.61.758l.006.007V1A.75.75 0 0 1 3.5.25m8.5 13a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5zm2-4a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5zm3-4a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5zm2-4a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5z';
const TOOL_BTN =
  'p-2 border-lightgray border rounded-theme hover:bg-primary group hover:border-primary transition-all duration-200';

/** `brands/single.twig`: the full-width banner (only when set), then the brand header inside the container. */
function BrandBanner({ brand }: { brand: BrandEntity }) {
  if (!brand.banner) return null;
  return (
    <div className="brand-page__banner">
      <img
        loading="eager"
        width={1200}
        height={300}
        className="w-full max-h-[300px] object-cover rounded-md bg-lightgray"
        src={brand.banner}
        alt={brand.name}
      />
    </div>
  );
}

function BrandHeader({ brand }: { brand: BrandEntity }) {
  return (
    <header className="flex flex-col md:flex-row items-center md:items-start text-center rtl:md:text-right ltr:md:text-left mt-2 mb-12 md:mb-20">
      <img
        className="rounded-md w-40 h-24 object-contain shadow-md p-4 bg-white shrink-0"
        src={brand.logo}
        alt={brand.name}
        width={160}
        height={96}
        loading="lazy"
        decoding="async"
      />
      <div className="px-5 pt-3 md:text-start">
        <h1 className="text-2xl font-bold mb-1">{brand.name}</h1>
        {brand.description && (
          <h2
            className="text-base text-mediumgray font-medium"
            dangerouslySetInnerHTML={{ __html: brand.description }}
          />
        )}
      </div>
    </header>
  );
}

type CategoryBanner = {
  img?: string;
  img_url?: string;
  replace_image_with_video?: boolean;
  video_url?: string;
  video_ur?: string;
  categries?: { key?: unknown }[];
};

/** `product/index.twig`: the merchant's banners for this category, under the filters (`show_banners_in_single_cat`). */
function CategoryBanners({ categoryId }: { categoryId: unknown }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as { show_banners_in_single_cat?: boolean; single_cat?: unknown };
  if (!s.show_banners_in_single_cat || !Array.isArray(s.single_cat) || categoryId === undefined) return null;
  const matches = (s.single_cat as CategoryBanner[]).filter((banner) =>
    (banner.categries ?? []).some((cat) => String(cat.key) === String(categoryId))
  );
  if (!matches.length) return null;
  return (
    <div className="lg:flex-col flex">
      {matches.map((banner, index) =>
        banner.img ? (
          // A settings list without ids.
          // react-doctor-disable-next-line react-doctor/no-array-index-as-key
          <a key={index} href={banner.img_url}>
            {banner.replace_image_with_video && (banner.video_url || banner.video_ur) ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className="w-full h-full object-cover aspect-square rounded-theme"
              >
                <source src={banner.video_url || banner.video_ur} />
              </video>
            ) : (
              <img
                src={banner.img}
                alt={String(t('common.related_category_alt', { index: index + 1 })).replace(':index', String(index + 1))}
                className="aspect-square"
                width={300}
                height={300}
                loading="lazy"
                decoding="async"
              />
            )}
          </a>
        ) : null
      )}
    </div>
  );
}

/** products.js `initiateMobileMenu`: below 1024px the filters open in an mmenu-light offcanvas. */
function FiltersDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useDocumentClass({ body: { class: open ? ['mm-ocd-opened', 'filters-opened'] : [] } });
  if (!mounted) return null;
  const rtl = (theme as { is_rtl?: boolean } | undefined)?.is_rtl ?? true;
  return createPortal(
    <div className={`mm-ocd mm-ocd--${rtl ? 'right' : 'left'} lg:hidden${open ? ' mm-ocd--open' : ''}`}>
      <div className="mm-ocd__content">
        <button
          type="button"
          className="btn--close-sm close-filters sicon-cancel hidden"
          aria-label={t('blocks.header.close')}
          onClick={onClose}
        />
        {children}
      </div>
      <div className="mm-ocd__backdrop" onMouseDown={onClose} onTouchStart={onClose} />
    </div>,
    document.body
  );
}

/** The store-reviews block below the listing — categories only, and only when
 * the merchant has enabled it (`home.testimonials`). */
function CategoryTestimonials({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <RenderWhenVisible estimatedHeight="0px" placeholder={<ReviewItemSkeleton />}>
      <Testimonials data={{}} />
    </RenderWhenVisible>
  );
}

/**
 * Port of View's `pages/product/index.twig` + `products.js`, registered as
 * `product:list-page` in `app/router.tsx` for every product listing.
 *
 * The filters sit in a `md:w-72` sidebar (an offcanvas below 1024px); the toolbar
 * is one bordered box: the page title, the filters trigger, the grid / list
 * buttons (the list fades out and back in when switched) and the sort select.
 * `auto_load_products` decides between infinite scroll and a load-more button.
 * A brand page (`brands/single.twig`) shows its banner and header, then the bare list.
 * Data flow is the engine's (loader page, `useAppliedFilters`, `products.fetched`).
 */
export function ProductListPage({ page, source, query, products, pagination, filters }: ProductListLoaderData) {
  const { t } = useTranslation();
  const store = useStore();
  const { theme } = useTwilight();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;

  const selectedSort = query.sort;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<View>('grid');
  const [fading, setFading] = useState(false);

  const showFilters = !!(query.filters && store?.settings?.product?.filters);
  const {
    filters: appliedFilters,
    page: filteredPage,
    lastPage,
    status: filterStatus,
    retry: retryFilters,
  } = useAppliedFilters(source, selectedSort, showFilters);
  const shownPage = filterStatus === 'ready' ? filteredPage : lastPage;
  const shownProducts =
    filterStatus === 'error' ? [] : filterStatus === 'idle' ? products : (shownPage?.items ?? products);
  const shownNext =
    filterStatus === 'idle' ? pagination?.next : filterStatus === 'ready' ? filteredPage?.next : null;
  const filteredKey =
    filterStatus === 'idle'
      ? ''
      : `${filterStatus}${filterStatus === 'ready' ? JSON.stringify(appliedFilters) : ''}`;

  const isBrand = source.type === 'brands';
  const brand = isBrand ? (source.entity as BrandEntity | undefined) : undefined;
  const isReorder = source.type === 'reorder';
  useReorderButtons(isReorder);

  const sortOptionsWithTrans = useMemo(() => sortOptions(selectedSort, t), [selectedSort, t]);

  useEffect(() => {
    const handleFiltersChanged = () => setFiltersOpen(false);
    return onSallaEvent('salla-filters::changed', handleFiltersChanged);
  }, []);

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      // `location.pathname`: the router strips the store's base and adds its own back.
      const params = new URLSearchParams(location.searchStr);
      params.set('sort', event.target.value);
      params.delete('page');
      const search = params.toString();
      navigate(location.pathname + (search ? `?${search}` : ''));
    },
    [navigate, location.pathname, location.searchStr]
  );

  // products.js `switchMode`: fade the list out, switch the cards, fade back in (200ms).
  const switchView = (next: View) => {
    if (next === view || fading) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setView(next);
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      setView(next);
      window.setTimeout(() => setFading(false), 50);
    }, 200);
  };

  const listKey = source.value ?? source.type;
  const blockScope = useMemo(
    () => (source.type === 'categories' && source.value ? { category_id: source.value } : undefined),
    [source.type, source.value]
  );
  const loader = useCatalogLoader(source, selectedSort, shownNext, appliedFilters);
  const horizontal = view === 'list';
  const autoload = settings.auto_load_products !== false;

  const list = (
    <div className="flex min-h-screen">
      {filterStatus === 'error' ? (
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <NoContent icon="sicon-shopping-bag" message={t('common.errors.error_occurred', 'Something went wrong')} />
          <button type="button" data-testid="store-catalog-filters-retry" className="link--primary mt-4" onClick={retryFilters}>
            {t('common.elements.try_again', 'Try again')}
          </button>
        </div>
      ) : (
        <div
          className="relative flex-1 min-w-0"
          style={{ transition: 'opacity 200ms ease', opacity: fading || filterStatus === 'loading' ? 0 : 1 }}
          aria-busy={fading || filterStatus === 'loading' || undefined}
        >
          <ItemsList<Product>
            key={`${listKey}${filteredKey}-${selectedSort}`}
            resetKey={`${listKey}${filteredKey}-${selectedSort}`}
            items={shownProducts}
            loader={loader}
            mode={shownNext ? (autoload ? 'infinite' : 'button') : 'static'}
            pageUrl={location.pathname + location.searchStr}
            className="s-products-list flex-1 min-w-0 "
            itemsClassName={`s-products-list-wrapper ${
              horizontal ? 's-products-list-horizontal-cards' : 's-products-list-vertical-cards'
            }${showFilters ? ' s-products-list-filters-results' : ''}`}
            skeleton={<ProductCardSkeleton />}
            skeletonType="item"
            skeletonCount={12}
            empty={
              <NoContent icon="sicon-shopping-bag" message={t('pages.categories.no_products', 'No products found in this category')} />
            }
            t={(key, fallback) => t(key, fallback || key)}
          >
            {(items) =>
              items.map((prod, idx) => (
                <ProductCard key={prod.id} product={prod} index={idx} layout={horizontal ? 'horizontal' : 'vertical'} />
              ))
            }
          </ItemsList>
          {fading && (
            <div className="absolute inset-0 grid justify-center bg-[var(--color-bg)] backdrop-blur-sm z-50 pointer-events-none">
              <div className="s-button-loader h-20" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isBrand && brand) {
    return (
      <div key={listKey} data-source={isReorder ? 'reorder' : undefined}>
        <BrandBanner brand={brand} />
        <div className="container">
          <Breadcrumb page={page} />
          <HookSlot name="brands:single.details.start" />
          <BrandHeader brand={brand} />
          <HookSlot name="brands:single.details.end" />
          <div className="flex items-start flex-col md:flex-row">
            <div className="main-content w-full">
              <HookSlot name="brands:single.items.start" />
              {list}
              <HookSlot name="brands:single.items.end" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div key={listKey} className="container px-2.5 ms:px-5 mb-10" data-source={isReorder ? 'reorder' : undefined}>
        {settings.product_index_show_breadcrumbs !== false && <Breadcrumb page={page} />}
        <HookSlot name="product:list.start" />
        <BlockHookSlot
          name="product.index.before_products_group_with_filter"
          wrapper="s-before-products-list"
          className="!mt-0"
          scope={blockScope}
        />
        <div className="flex items-start flex-col lg:flex-row">
          <div className="md:w-72 lg:sticky lg:top-20 flex-none">
            {showFilters && (
              <SallaFilters
                data-testid="store-products-filters"
                id="filters-menu"
                className="hidden lg:block"
                filters={filters as never}
              />
            )}
            <CategoryBanners categoryId={source.type === 'categories' ? source.value : undefined} />
          </div>
          <div className={`main-content flex-1 w-full${showFilters ? ' ltr:lg:ml-5 rtl:lg:mr-5' : ''}`}>
            <div className="mb-4 sm:mb-6 flex sm:flex-row flex-col-reverse justify-between items-center border-lightgray dark:border-darkgray carbon:border-darkgray rounded-theme border p-1.5">
              <h1
                className="font-medium md:text-sm sm:text-xs text-base sm:mt-0 leading-none mt-1.5 rtl:pl-3 ltr:pr-3 text-mediumgray "
                id="page-main-title"
                dangerouslySetInnerHTML={{ __html: page.title ?? '' }}
              />
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-xs sm:text-sm">
                {showFilters && (
                  <button
                    type="button"
                    data-testid="store-products-filters-mobile-trigger"
                    aria-label={t('pages.categories.filter', 'Filter')}
                    aria-expanded={filtersOpen}
                    className="filters-trigger lg:hidden p-2 border-lightgray border rounded-theme hover:bg-primary group hover:border-primary transition-all duration-200 flex-center"
                    onClick={() => setFiltersOpen((open) => !open)}
                  >
                    <i className="sicon-filter leading-none text-primary text-2xl group-hover:text-bgcolor" aria-hidden="true"></i>
                  </button>
                )}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    type="button"
                    className={`${TOOL_BTN}${!horizontal ? ' opacity-50 cursor-not-allowed' : ''}`}
                    tooltip={t('pages.cart.verti')}
                    aria-label={t('pages.cart.verti')}
                    id="vrPR"
                    disabled={!horizontal || fading}
                    aria-pressed={!horizontal}
                    onClick={() => switchView('grid')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 28 28" className="sm:w-6 sm:h-6" aria-hidden="true">
                      <title>{t('pages.cart.verti')}</title>
                      <path fill="var(--color-primary-light)" className="group-hover:fill-bgcolor" fillRule="evenodd" d={GRID_ICON} />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`${TOOL_BTN}${horizontal ? ' opacity-50 cursor-not-allowed' : ''}`}
                    tooltip={t('pages.cart.horuz')}
                    aria-label={t('pages.cart.horuz')}
                    id="hrPR"
                    disabled={horizontal || fading}
                    aria-pressed={horizontal}
                    onClick={() => switchView('list')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="sm:w-6 sm:h-6">
                      <title>{t('pages.cart.horuz')}</title>
                      <path
                        stroke="var(--color-primary-light)"
                        className="group-hover:stroke-bgcolor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m8 6 13 .001m-13 6h13m-13 6h13M3.5 6h.01m-.01 6h.01m-.01 6h.01M4 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m0 6a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"
                      />
                    </svg>
                  </button>
                </div>
                {sortOptionsWithTrans.length > 0 && (
                  <div className="flex items-center border-lightgray rounded-theme border text-xs sm:text-sm">
                    <label className="p-2 hover:bg-primary group transition-all duration-200" tooltip={t('pages.categories.sorting')} htmlFor="product-filter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" className="sm:w-6 sm:h-6">
                        <title>{t('pages.categories.sorting')}</title>
                        <path fill="var(--color-primary-light)" className="group-hover:fill-bgcolor" d={SORT_ICON} />
                      </svg>
                    </label>
                    <select
                      id="product-filter"
                      className="pt-0 pb-0.5 px-1 text-darkgray dark:text-primary-d carbon:text-primary-d text-xs sm:text-sm border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none active:outline-none active:ring-0 active:border-none appearance-none bg-transparent shadow-none"
                      value={selectedSort}
                      onChange={handleSortChange}
                    >
                      {sortOptionsWithTrans.map((sort) => (
                        <option key={sort.id} value={sort.id}>
                          {sort.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            <HookSlot name="product:list.items.start" />
            <HookSlot name="product:index.items.start" />
            {list}
            <HookSlot name="product:index.items.end" />
            <HookSlot name="product:list.items.end" />
          </div>
        </div>
        <BlockHookSlot name="product.index.after_products_group_with_filter" wrapper="s-after-products-list" scope={blockScope} />
        <HookSlot name="product:list.end" />
      </div>
      {showFilters && (
        <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)}>
          <SallaFilters id="filters-menu-mobile" filters={filters as never} />
        </FiltersDrawer>
      )}
      <CategoryTestimonials enabled={source.type === 'categories' && !!store?.settings?.category?.testimonial_enabled} />
      <BlockHookSlot name="product.index.after_testimonials" wrapper="s-after-testimonials" scope={blockScope} />
    </>
  );
}
