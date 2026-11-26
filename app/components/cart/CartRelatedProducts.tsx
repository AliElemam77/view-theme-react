import { useCallback, useEffect, useRef, useState } from 'react';
import type { Money } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';

/** A product as `salla.product.fetch` returns it (only what the row reads). */
interface RelatedProduct {
  id: number;
  name: string;
  image?: { url?: string } | null;
  is_on_sale?: boolean;
  sale_price?: number | Money;
  regular_price?: number | Money;
  starting_price?: number | Money | null;
  price?: number | Money;
  total?: unknown;
}

/** The slice of `window.salla` this panel calls (not in the engine's SDK type). */
interface RelatedSdk {
  product?: {
    getDetails?: (
      id: string,
      withItems: string[]
    ) => Promise<{ data?: { tags?: { url?: string }[] } }>;
    fetch?: (query: { source: string; source_value: string[] }) => Promise<{ data?: RelatedProduct[] }>;
  };
  cart?: { quickAdd?: (id: number | string) => Promise<unknown> };
  notify?: { error?: (message: string) => void };
}

const sdk = () => (typeof window === 'undefined' ? undefined : (window.salla as unknown as RelatedSdk | undefined));

/** relatedSystem.cart.js `tagBatchSize`. */
const TAG_BATCH_SIZE = 2;

/** relatedSystem.cart.js `fetchCartTagIds`: every tag id of every product in the cart. */
async function fetchCartTagIds(productIds: number[]): Promise<string[]> {
  const tags = new Set<string>();
  const results = await Promise.allSettled(
    productIds.map((id) => sdk()?.product?.getDetails?.(String(id), ['tags']))
  );
  results.forEach((result) => {
    if (result.status !== 'fulfilled') return;
    (result.value?.data?.tags ?? []).forEach((tag) => {
      const parts = (tag.url ?? '').split('tag-');
      if (parts.length > 1) tags.add(parts[1]);
    });
  });
  return Array.from(tags);
}

function toAmount(value: number | Money | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === 'number' ? value : value.amount;
}

function RelatedProductRow({ product, onAdded }: { product: RelatedProduct; onAdded?: () => void }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const [adding, setAdding] = useState(false);

  const add = async () => {
    setAdding(true);
    try {
      await sdk()?.cart?.quickAdd?.(product.id);
      // Twig reloads the page a second later; the page refetches the cart instead.
      onAdded?.();
    } catch {
      sdk()?.notify?.error?.(t('common.errors.error_occurred', 'Something went wrong'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="z-50 transition-all duration-150 custom-product-view">
        <div className="center-between border-lightgray border text-white p-3 w-full rounded-theme">
          <div className="flex-center bg-primary-reverse">
            <img
              src={product.image?.url || undefined}
              alt={product.name}
              loading="lazy"
              className="w-12 h-12 md:w-14 md:h-14 object-contain bg-primary-reverse aspect-square border-lightgray"
            />
          </div>
          <div className="flex-1 text-right px-3">
            <p className="text-sm font-bold text-darkgray line-clamp-1">{product.name}</p>
            <div className={`flex whitespace-nowrap gap-4 items-center ${product.total ? 'price-wrapper' : ''}`}>
              <div
                className={`${product.is_on_sale ? '' : 'hidden'} price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap`}
              >
                <h2 className="total-price text-price font-bold md:text-xl text-lg inline-block">
                  {format(toAmount(product.sale_price))}
                </h2>
                <span className="before-price text-mediumgray  line-through opacity-85 font-semibold text-sm">
                  {format(toAmount(product.regular_price))}
                </span>
              </div>
              <div className={`gap-4 ${product.is_on_sale ? 'hidden' : 'flex'}`}>
                <h2 className="total-price font-bold md:text-xl text-lg inline-block">
                  {format(toAmount(product.starting_price) || toAmount(product.price))}
                </h2>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="add_cart_btn text-mediumgray  border-lightgray text-2xl hover:text-bgcolor flex-center w-10 h-10 relative"
            data-id={product.id}
            aria-label={t('pages.cart.add_to_cart', 'Add to cart')}
            aria-busy={adding}
            disabled={adding}
            onClick={add}
          >
            {adding ? <span className="s-button-loader"></span> : <i className="sicon-add"></i>}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Port of `pages/cart.twig` `#related-products-container` + `relatedSystem.cart.js`
 * ("Other customers' favorites"): the cart products' tags, two at a time, give products
 * not in the cart; each batch shows up to two of them, and "Load more" takes the next
 * batch until the tags run out. The page remounts it (by key) when the cart's products
 * change, as Twig's reload after an add does.
 */
export function CartRelatedProducts({
  productIds,
  onAdded,
}: {
  productIds: number[];
  onAdded?: () => void;
}) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tagIds = useRef<string[] | null>(null);
  const tagIndex = useRef(0);
  const shown = useRef(new Set<number>());
  const busy = useRef(false);
  const alive = useRef(true);
  const idsKey = productIds.join(',');

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /** relatedSystem.cart.js `loadNextProducts`: batches until one gives a product. */
  const loadNext = useCallback(async () => {
    const tags = tagIds.current ?? [];
    const inCart = idsKey ? idsKey.split(',').map(Number) : [];
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      while (tagIndex.current < tags.length) {
        const batch = tags.slice(tagIndex.current, tagIndex.current + TAG_BATCH_SIZE);
        tagIndex.current += TAG_BATCH_SIZE;
        const response = await sdk()?.product?.fetch?.({ source: 'tags', source_value: batch });
        const fresh = (response?.data ?? []).filter(
          (product) => !inCart.includes(product.id) && !shown.current.has(product.id)
        );
        fresh.forEach((product) => shown.current.add(product.id));
        if (fresh.length > 0) {
          if (alive.current) setProducts((current) => [...current, ...fresh.slice(0, 2)]);
          return;
        }
      }
    } catch (error) {
      console.warn((error as Error)?.message);
      return;
    } finally {
      busy.current = false;
      if (alive.current) {
        setLoading(false);
        setHasMore(tagIndex.current < tags.length);
      }
    }
  }, [idsKey]);

  useEffect(() => {
    if (!idsKey) return;
    let cancelled = false;
    fetchCartTagIds(idsKey.split(',').map(Number)).then((tags) => {
      if (cancelled || !alive.current) return;
      tagIds.current = tags;
      if (tags.length === 0) {
        setHasMore(false);
        return;
      }
      void loadNext();
    });
    return () => {
      cancelled = true;
    };
  }, [idsKey, loadNext]);

  return (
    <div id="related-products-container">
      <h3 className="text-darkgray">{t('pages.cart.rel_you')}</h3>
      <div id="products-list" className="flex flex-col gap-2 mb-2">
        {products.map((product) => (
          <RelatedProductRow key={product.id} product={product} onAdded={onAdded} />
        ))}
        {loading && <span className="s-button-loader block mx-auto my-4" id="products-loading-spinner"></span>}
      </div>
      {hasMore && (
        <button
          type="button"
          id="load-more-btn"
          className="mb-2 fancy flex-center relative font-semibold w-full text-sm transition-all duration-200 ease-in-out cursor-pointer px-2 py-1 rounded-theme border-2 bg-transparent border-primary text-primary"
          data-style="outline"
          style={{ backgroundColor: 'var(--color-bg)' }}
          onClick={() => void loadNext()}
        >
          <span className="top-key" style={{ color: 'var(--color-bg)' }}></span>
          <span id="content_btn" className="content" style={{ color: 'var(--color-bg)' }}>
            <span className="text" style={{ color: 'var(--color-primary)' }}>
              {t('pages.cart.more_pro')}
            </span>
            <span className=" icon" style={{ color: 'var(--color-primary)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="16" fill="none">
                <path
                  fill="currentColor"
                  d="M9.864.429c.698.232.712.238.712.238v.001l-.002.003q0 .004-.003.01l-.012.037-.047.128a15.5 15.5 0 0 1-.886 1.936c-.619 1.134-1.587 2.555-2.933 3.452-.344.23-.697.435-1.047.62h19.365v1.5H5.646c.35.184.703.389 1.047.619 1.346.897 2.314 2.318 2.933 3.453a15.5 15.5 0 0 1 .886 1.935l.047.128.012.036.003.011.001.003.001.001-.712.238-.71.238-.003-.006-.008-.025-.039-.104a14.014 14.014 0 0 0-.795-1.736c-.576-1.058-1.402-2.227-2.448-2.924-1.113-.742-2.333-1.214-3.287-1.5a14 14 0 0 0-1.481-.359L1.01 8.35l-.019-.003-.003-.001.053-.742-.053-.743h.003l.019-.004.082-.012q.111-.02.323-.063c.281-.058.684-.153 1.158-.296.954-.286 2.174-.758 3.287-1.5C6.907 4.29 7.733 3.12 8.31 2.063A14 14 0 0 0 9.104.325l.039-.104.008-.025.002-.006z"
                ></path>
              </svg>
            </span>
          </span>
          <span className="bottom-key-1" style={{ color: 'var(--color-bg)' }}></span>
          <span className="bottom-key-2" style={{ color: 'var(--color-bg)' }}></span>
        </button>
      )}
    </div>
  );
}
