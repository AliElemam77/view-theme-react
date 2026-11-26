/**
 * Data access for Salla landing pages ("special offer" pages, `landing-page.twig`).
 *
 * The engine has no landing-page API module, so this calls the same Storefront API
 * endpoints the Salla SDK and web components use, through the engine's public client:
 * - details: `GET landing/{id}` — `salla.api.landing.getDetails(id)` in the SDK;
 * - products: `GET products?source=landing-page&source_value={id}` — what
 *   `<salla-products-list source="landing-page">` requests (a scalar `source_value`,
 *   not the `source_value[]` the engine's `product.list` sends).
 */
import { api } from '@salla.sa/twilight-theme-engine/api/client';
import { parseNextPageToken } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/** A store feature as `store-features.twig` reads it (`items[]`). */
export interface LandingFeature {
  icon?: string;
  title?: string;
  text?: string;
}

/** The `landing` variable of `landing-page.twig`, normalised. */
export interface Landing {
  id: number | string;
  title: string;
  content: string;
  /** Product ids of the offer (`landing.products|map(p => p.id)`). */
  product_ids: Array<number | string>;
  offer_ends_at: string | null;
  testimonials_type: string | null;
  show_quantity: boolean;
  is_slider: boolean;
  is_expired: boolean;
  show_store_features: boolean;
  /** Items for the `home.store-features` component, when the API sends them. */
  store_features: LandingFeature[];
}

export interface LandingProductsPage {
  items: Product[];
  next: string | null;
}

type Raw = Record<string, unknown>;

const isObject = (value: unknown): value is Raw => !!value && typeof value === 'object';

function truthy(value: unknown): boolean {
  if (typeof value === 'string') return value !== '' && value !== '0' && value !== 'false';
  return Boolean(value);
}

/** A date the API may send as a string or as `{ date }` (Carbon). */
function dateString(value: unknown): string | null {
  if (typeof value === 'string') return value || null;
  if (isObject(value) && typeof value.date === 'string') return value.date || null;
  return null;
}

function productIds(value: unknown): Array<number | string> {
  const list = Array.isArray(value) ? value : isObject(value) && Array.isArray(value.data) ? value.data : [];
  return list
    .map((item) => (isObject(item) ? item.id : item))
    .filter((id): id is number | string => typeof id === 'number' || (typeof id === 'string' && id !== ''));
}

function features(value: unknown): LandingFeature[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).map((item) => ({
    icon: typeof item.icon === 'string' ? item.icon : undefined,
    title: typeof item.title === 'string' ? item.title : undefined,
    text:
      typeof item.text === 'string'
        ? item.text
        : typeof item.description === 'string'
          ? item.description
          : undefined,
  }));
}

/** The API's landing record as {@link Landing}; null when there is none. */
export function normalizeLanding(raw: unknown, fallbackId: number | string): Landing | null {
  if (!isObject(raw)) return null;
  return {
    id: (raw.id as number | string | undefined) ?? fallbackId,
    title: typeof raw.title === 'string' ? raw.title : typeof raw.name === 'string' ? raw.name : '',
    content: typeof raw.content === 'string' ? raw.content : '',
    product_ids: productIds(raw.products),
    offer_ends_at: dateString(raw.offer_ends_at),
    testimonials_type: typeof raw.testimonials_type === 'string' && raw.testimonials_type ? raw.testimonials_type : null,
    show_quantity: truthy(raw.show_quantity),
    is_slider: truthy(raw.is_slider),
    is_expired: truthy(raw.is_expired),
    show_store_features: truthy(raw.show_store_features),
    store_features: features(raw.store_features ?? raw.features),
  };
}

/** `GET landing/{id}`. Rejects with the HTTP error, so `orThrow` turns a 404/410 into not-found. */
export async function fetchLanding(id: string): Promise<Landing | null> {
  const response = await api.get(`landing/${encodeURIComponent(id)}`).json<{ data?: unknown }>();
  return normalizeLanding(response?.data, id);
}

/** One page of the offer's products, as `<salla-products-list source="landing-page">` loads them. */
export async function fetchLandingProducts(id: number | string, next?: string | null): Promise<LandingProductsPage> {
  const searchParams = new URLSearchParams();
  searchParams.set('source', 'landing-page');
  searchParams.set('source_value', String(id));
  const token = parseNextPageToken(next);
  if (token.cursor) searchParams.set('cursor', token.cursor);
  if (token.page !== undefined) searchParams.set('page', String(token.page));
  const response = await api
    .get(`products?${searchParams.toString()}`)
    .json<{ data?: Product[]; cursor?: { next?: string | null } }>();
  return { items: response?.data ?? [], next: response?.cursor?.next ?? null };
}
