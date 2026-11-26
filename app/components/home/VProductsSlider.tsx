import { createElement, memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { product as productApi, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { ProductCard } from '../product/ProductCard';
import { blockLimit } from '../../lib/blockLimit';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { copyToClipboard } from '../../lib/clipboard';
import { asArray, cx, separatorProps, text, twigPosition, twigTruthy } from './ViewBlockUtils';

export interface VProductsSliderData {
  type?: unknown;
  categories?: unknown;
  products?: unknown;
  products_tags?: unknown;
  enable_grid_layout?: boolean;
  limit_products?: number | string;
  auto_loader?: boolean;
  has_discount_code?: boolean;
  discount_code?: string;
  discount_title?: string;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_prduct?: boolean;
  btn_url_one?: unknown;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

interface Tag {
  id: number;
  name: string;
  url: string;
}

/** The `limit` products-component falls back to when the block saved none (twilight.json default). */
const DEFAULT_LIMIT = 10;

const COPY_ICON =
  'M9.54883 2.21875C11.1511 2.21874 12.4206 2.21919 13.4248 2.33789C14.4557 2.45976 15.3047 2.71508 16.0137 3.29688C16.2541 3.49419 16.4746 3.71467 16.6719 3.95508C17.2232 4.62686 17.482 5.42441 17.6113 6.38379C17.7163 7.16288 17.7398 8.10116 17.7461 9.23047C18.3688 9.24348 18.9157 9.27099 19.3916 9.33496C20.2917 9.45598 21.0495 9.71547 21.6514 10.3174C22.2533 10.9193 22.5128 11.677 22.6338 12.5771C22.7503 13.4441 22.75 14.5466 22.75 15.9141V17.0234C22.75 18.3909 22.7503 19.4934 22.6338 20.3604C22.5128 21.2605 22.2533 22.0182 21.6514 22.6201C21.0495 23.222 20.2917 23.4815 19.3916 23.6025C18.5247 23.7191 17.4222 23.7188 16.0547 23.7188H14.9453C13.5778 23.7188 12.4753 23.7191 11.6084 23.6025C10.7083 23.4815 9.95055 23.222 9.34863 22.6201C8.74672 22.0182 8.48723 21.2605 8.36621 20.3604C8.30224 19.8844 8.27473 19.3375 8.26172 18.7148C7.13241 18.7085 6.19413 18.6851 5.41504 18.5801C4.45566 18.4508 3.65811 18.1919 2.98633 17.6406C2.74592 17.4433 2.52544 17.2228 2.32813 16.9824C1.74633 16.2735 1.49101 15.4245 1.36914 14.3936C1.25044 13.3893 1.24999 12.1198 1.25 10.5176V10.4199C1.24999 8.81766 1.25044 7.54816 1.36914 6.54395C1.49101 5.51302 1.74633 4.664 2.32813 3.95508C2.52544 3.71467 2.74592 3.49419 2.98633 3.29688C3.69525 2.71508 4.54427 2.45976 5.5752 2.33789C6.57941 2.21919 7.84891 2.21874 9.45117 2.21875H9.54883ZM15 10.7188C13.5648 10.7188 12.5639 10.7208 11.8086 10.8223C11.0748 10.9209 10.6859 11.1012 10.4092 11.3779C10.1324 11.6547 9.95217 12.0436 9.85352 12.7773C9.75202 13.5326 9.75 14.5336 9.75 15.9688V16.9688C9.75 18.4039 9.75202 19.4049 9.85352 20.1602C9.95217 20.8939 10.1324 21.2828 10.4092 21.5596C10.6859 21.8363 11.0748 22.0166 11.8086 22.1152C12.5639 22.2167 13.5648 22.2188 15 22.2188H16C17.4352 22.2188 18.4361 22.2167 19.1914 22.1152C19.9252 22.0166 20.3141 21.8363 20.5908 21.5596C20.8676 21.2828 21.0478 20.8939 21.1465 20.1602C21.248 19.4049 21.25 18.4039 21.25 16.9688V15.9688C21.25 14.5336 21.248 13.5326 21.1465 12.7773C21.0478 12.0436 20.8676 11.6547 20.5908 11.3779C20.3141 11.1012 19.9252 10.9209 19.1914 10.8223C18.4361 10.7208 17.4352 10.7188 16 10.7188H15ZM9.5 3.71875C7.83789 3.71875 6.65689 3.72007 5.75098 3.82715C4.8621 3.93225 4.33579 4.13013 3.93848 4.45605C3.77392 4.59111 3.62236 4.74267 3.4873 4.90723C3.16138 5.30454 2.9635 5.83085 2.8584 6.71973C2.75132 7.62564 2.75 8.80664 2.75 10.4688C2.75 12.1309 2.75132 13.3119 2.8584 14.2178C2.9635 15.1067 3.16138 15.633 3.4873 16.0303C3.62236 16.1948 3.77392 16.3464 3.93848 16.4814C4.31534 16.7906 4.80869 16.9849 5.61621 17.0938C6.2952 17.1852 7.1401 17.2082 8.25 17.2148V15.9141C8.24998 14.5466 8.24968 13.4441 8.36621 12.5771C8.48723 11.677 8.74672 10.9193 9.34863 10.3174C9.95055 9.71547 10.7083 9.45598 11.6084 9.33496C12.4753 9.21843 13.5778 9.21873 14.9453 9.21875H16.2461C16.2395 8.10885 16.2165 7.26395 16.125 6.58496C16.0162 5.77744 15.8219 5.28409 15.5127 4.90723C15.3776 4.74267 15.2261 4.59111 15.0615 4.45605C14.6642 4.13013 14.1379 3.93225 13.249 3.82715C12.3431 3.72007 11.1621 3.71875 9.5 3.71875Z';

/** The ids of a picker setting (`value|map((p) => p.id)`), also when it saved bare ids. */
function ids(value: unknown): number[] {
  return asArray(value)
    .map((v) => (v && typeof v === 'object' ? (v as { id?: unknown; value?: unknown }).id ?? (v as { value?: unknown }).value : v))
    .map((v) => parseInt(String(v ?? ''), 10))
    .filter(Number.isFinite);
}

/** products-component `parseTagIdFromUrl`. */
function tagIdFromUrl(url: unknown): number | null {
  const m = String(url ?? '').match(/(?:^|\/)tag-(\d+)(?:\/|$)/i);
  return m?.[1] ? Number(m[1]) : null;
}

/** The "show all" URL, in the Twig's order of precedence. */
function moreUrlOf(data: VProductsSliderData, source: string): string {
  const custom = linkUrl(data.btn_url_one);
  if (custom) return custom;
  if (source === 'offers') return '/offers';
  if (source === 'latest') return '/latest-products';
  if (source === 'sales') return '/products';
  const categories = asArray<{ url?: string }>(data.categories);
  if (source === 'categories' && categories.length) return text(categories[0]?.url) || '/products';
  const tagged = asArray<{ tags?: { url?: string }[] }>(data.products_tags);
  if (source === 'tags' && tagged.length) return text(asArray<{ url?: string }>(tagged[0]?.tags)[0]?.url) || '/products';
  return '/products';
}

/** products-component's `auto-init="visible"`: starts once the host is within 200px of the viewport. */
function useVisible<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting || e.intersectionRatio > 0)) {
          io.disconnect();
          setVisible(true);
        }
      },
      { rootMargin: '200px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return { ref, visible };
}

/** The coupon products-component puts in the slider's bottom bar (`app.copyToClipboard` on click). */
function SliderCoupon({ code, label }: { code: string; label: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'' | 'copied' | 'code-to-copy'>('');

  useEffect(() => {
    if (state !== 'copied') return;
    const timer = window.setTimeout(() => setState('code-to-copy'), 1000);
    return () => window.clearTimeout(timer);
  }, [state]);

  const onCopy = () => {
    copyToClipboard(code);
    setState('copied');
    try {
      const salla = window.salla as { notify?: { success?: (m: string) => void } } | undefined;
      salla?.notify?.success?.(`${t('pages.products.copied', 'Copied')} : ${code}`);
    } catch {
      /* SDK not ready */
    }
  };

  return (
    <div className="inline-flex items-center justify-between gap-2.5 rounded-full border border-lightgray bg-primaryops px-5 py-2.5 shadow-sm">
      <button
        tooltip={`${t('pages.products.copied', 'Copied')} : ${code}`}
        type="button"
        className={cx('inline-flex items-center justify-center transition hover:opacity-90', state)}
        onClick={onCopy}
        data-content={code}
        aria-label={label}
      >
        <svg width="24" height="24" viewBox="0 0 24 25" fill="none" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d={COPY_ICON} fill="var(--color-primary-dark)" />
        </svg>
      </button>
      <div className="flex items-center justify-center gap-2.5 text-sm flex-1">
        <span className="font-medium text-primary-d">{label}</span>
        <span className="font-extrabold text-primary-d tracking-wide">{code}</span>
      </div>
    </div>
  );
}

/**
 * Port of `V_products_slider.twig` and its `<custom-shahien-products>` element
 * (`partials/products-component.js`): once in view it loads the source's
 * products and shows them as a slider (1.7 / 3 / 4 per view, progress bar,
 * arrows and the coupon in a bottom bar) or a 2 / 4 column grid. The `tags`
 * source reads the picked products' tags, shows them as chips and lists the
 * active tag's products. The host element keeps its tag, so global.scss
 * `custom-shahien-products` rules still apply.
 */
export const VProductsSlider = memo(function VProductsSlider({ data = {} }: { data?: VProductsSliderData }) {
  const { t } = useTranslation();
  const { spacing } = useViewSettings();
  const position = twigPosition(data);
  const { ref, visible } = useVisible<HTMLElement>();

  const sourceType = optionValue(data.type);
  const source = (sourceType || 'latest') as ProductsListSource;
  const isGrid = booleanValue(data.enable_grid_layout);
  const limit = blockLimit(data.limit_products) ?? DEFAULT_LIMIT;
  const pickedValue =
    source === 'categories' ? data.categories : source === 'selected' ? data.products : source === 'tags' ? data.products_tags : [];
  const sourceIds = ['selected', 'categories', 'tags'].includes(source) ? ids(pickedValue) : [];
  const hasCoupon = booleanValue(data.has_discount_code);
  const code = text(data.discount_code);
  const couponText = text(data.discount_title);

  // `_prepareTagsFromSourceValue`: the tags of every picked product, first seen first.
  const isTags = source === 'tags';
  const details = useQueries({
    queries: (isTags ? sourceIds : []).map((id) => ({
      ...productApi.queries.detail(String(id)),
      enabled: visible,
      retry: false,
    })),
  });
  const tagsPending = isTags && details.some((q) => q.isPending || q.isPlaceholderData);
  const tags: Tag[] = [];
  if (isTags && !tagsPending) {
    const seen = new Set<number>();
    for (const q of details) {
      for (const tag of asArray<{ name?: string; url?: string }>(q.data?.tags)) {
        const id = tagIdFromUrl(tag?.url);
        if (!id || seen.has(id)) continue;
        seen.add(id);
        tags.push({ id, name: tag?.name || '', url: tag?.url || '' });
      }
    }
  }
  const [pickedTag, setPickedTag] = useState<number | null>(null);
  const activeTagId = tags.some((tag) => tag.id === pickedTag) ? pickedTag : (tags[0]?.id ?? null);

  // `fetchProducts`: `source_value` goes with categories / selected, the active tag with tags.
  const sourceValue = isTags
    ? activeTagId !== null
      ? [activeTagId]
      : undefined
    : source === 'categories' || source === 'selected'
      ? sourceIds
      : undefined;
  const list = useQuery({
    ...productApi.queries.list({ source, sourceValue, perPage: limit }),
    enabled: visible && (!isTags || (!tagsPending && activeTagId !== null)),
    retry: false,
  });

  const loading = !visible || tagsPending || (list.isPending && list.fetchStatus !== 'idle') || list.isPlaceholderData;
  const products: Product[] = list.data?.items ?? [];

  let content: ReactNode;
  if (loading) {
    content = (
      <div className="py-8 flex justify-center items-center gap-2" role="status" aria-live="polite">
        <span className="s-button-loader w-5 h-5 rounded-full" />
        <span>{t('common.elements.loading', 'جاري التحميل...')}</span>
      </div>
    );
  } else {
    const tagsBar =
      isTags && tags.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={t('blocks.home.filter_by_tag')}>
          {tags.map((tag) => {
            const active = tag.id === activeTagId;
            return (
              <button
                key={tag.id}
                type="button"
                data-tag-id={tag.id}
                role="tab"
                aria-selected={active ? 'true' : 'false'}
                className={cx(
                  'px-3 py-1 rounded-theme border text-sm hover:border-primary-d transition-all duration-200',
                  active ? 'font-bold text-primary-d border-primary-l' : 'opacity-70 hover:opacity-100 text-primary-l border-primaryops'
                )}
                onClick={() => setPickedTag(tag.id)}
              >
                {tag.name || String(tag.id)}
              </button>
            );
          })}
        </div>
      ) : null;

    const cards = products.map((p) => (
      <div key={p.id} className="!h-auto">
        <ProductCard product={p} />
      </div>
    ));

    content = (
      <>
        {tagsBar}
        {!products.length ? (
          <p className="py-6 text-center text-sm opacity-80">{t('pages.products.no_products', 'لا توجد منتجات')}</p>
        ) : isGrid ? (
          <div className="grid grid-cols-2 md:grid-cols-4 md:gap-4 gap-2">{cards}</div>
        ) : (
          <SallaSlider
            id={`products-slider-${position}`}
            showControls={false}
            type="carousel"
            sliderConfig={{
              pagination: { el: `#products-slider-${position} .swiper-pagination`, type: 'progressbar' },
              navigation: {
                nextEl: `#products-slider-${position} .swiper-button-next`,
                prevEl: `#products-slider-${position} .swiper-button-prev`,
              },
              centerInsufficientSlides: true,
              breakpoints: { 0: { slidesPerView: 1.7 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
            }}
          >
            <div slot="items">{cards}</div>
            <div className="absolute left-0 bottom-0 flex items-center justify-between gap-2 z-2 w-full flex-1">
              <div className="swiper-pagination" />
              <div className="flex items-center gap-2">
                <div className="swiper-button-prev" />
                <div className="swiper-button-next" />
              </div>
              {hasCoupon && code && couponText && <SliderCoupon code={code} label={couponText} />}
            </div>
          </SallaSlider>
        )}
      </>
    );
  }

  // The element's attributes as Twig writes them.
  const host = createElement(
    'custom-shahien-products',
    {
      ref,
      className: loading ? 'is-loading' : undefined,
      'auto-init': 'visible',
      source: sourceType,
      'source-value': JSON.stringify(sourceIds),
      layout: isGrid ? 'grid' : 'slider',
      limit: twigTruthy(data.limit_products) ? String(data.limit_products) : undefined,
      'auto-loader': data.auto_loader === undefined ? undefined : booleanValue(data.auto_loader) ? 'true' : 'false',
      copune: hasCoupon ? code : undefined,
      copunetext: hasCoupon ? couponText : undefined,
    },
    content
  );

  return (
    <section
      className={cx('s-block V_products_slider', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_products_slider-${position}`}
      id={`V_products_slider-${position}`}
    >
      <div
        className={cx(
          booleanValue(data.has_container) && 'container',
          isGrid ? 'sm:flex-row flex-col relative' : 'md:flex-row flex-col'
        )}
      >
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          jocer={booleanValue(data.has_jocer_image)}
          more={booleanValue(data.show_more_prduct)}
          moreAlt={t('blocks.header.showall')}
          moreUrl={moreUrlOf(data, sourceType)}
        />
        {host}
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
