/** Small helpers shared by the View home-block ports (V_*.twig → React). */
import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { SectionSeparatorProps } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

/** Joins the truthy class names with single spaces (Twig's `{{ cond ? 'cls' }}` chains). */
export function cx(...parts: (string | false | null | undefined | 0)[]): string {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** The value as an array (`[]` for anything else). */
export function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Twig's `value|default(true)`: `default` also replaces the *empty* values, and
 * `false` is empty in Twig, so this is `true` for false/null/''/[] too.
 */
export function twigDefaultTrue(value: unknown): boolean {
  if (value === undefined || value === null || value === false || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return Boolean(value);
}

/** Twig truthiness: empty strings, 0, '0', empty arrays and null are false. */
export function twigTruthy(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (value === '0') return false;
  return Boolean(value);
}

/** Alias of `cx`, the name some ports use. */
export const cls = cx;

/** A text-like setting as a string (`''` for null, objects and the like), as Twig prints it. */
export function text(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

/** Twig's `position` (the block's index on the page), `0` when the engine didn't pass one. */
export function twigPosition(data: { position?: unknown }): number {
  const n = Number(data.position);
  return Number.isFinite(n) ? n : 0;
}

/**
 * A `collection` setting's rows. Rows saved by the theme editor key each field
 * as `<collection>.<field>` (twilight.json); Twig reads them as `item.<field>`,
 * so the prefix is stripped.
 */
export function collectionItems<T extends object = Record<string, unknown>>(
  value: unknown,
  prefix: string
): T[] {
  const lead = `${prefix}.`;
  return asArray<Record<string, unknown>>(value)
    .filter((row) => row && typeof row === 'object')
    .map((row) => {
      const out: Record<string, unknown> = {};
      for (const [key, v] of Object.entries(row)) {
        out[key.startsWith(lead) ? key.slice(lead.length) : key] = v;
      }
      return out as T;
    });
}

/** The separator fields every V_* block shares, ready to spread on `<SectionSeparator>`. */
export function separatorProps(data: Record<string, unknown>): SectionSeparatorProps {
  const x = data.star_position_x;
  return {
    saprator: optionValue(data.saprator),
    merge_with_adjacent: twigTruthy(data.merge_with_adjacent),
    use_custom_colors: twigTruthy(data.use_custom_colors),
    line_color: text(data.line_color) || undefined,
    star_color: text(data.star_color) || undefined,
    star_position_x: typeof x === 'number' || typeof x === 'string' ? x : undefined,
  };
}

const isProduct = (v: unknown): v is Product =>
  !!v && typeof v === 'object' && 'id' in v && 'name' in v;

const productId = (v: unknown): number | null => {
  const raw = v && typeof v === 'object' ? ((v as { value?: unknown; id?: unknown }).value ?? (v as { id?: unknown }).id) : v;
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) ? n : null;
};

/**
 * The products of an `items` / `source: products` setting. The home API usually
 * hands them over resolved (full products); when it sends ids (or `{value}`
 * options) instead, they are fetched with the `selected` source.
 */
export function usePickedProducts(value: unknown): { products: Product[]; isLoading: boolean } {
  const list = asArray(value);
  const resolved = list.length > 0 && list.every(isProduct);
  const ids = resolved ? [] : list.map(productId).filter((id): id is number => id !== null);

  const { data, isLoading } = useQuery({
    ...product.queries.list({ source: 'selected', sourceValue: ids, perPage: ids.length || 1 }),
    enabled: ids.length > 0,
  });

  if (resolved) return { products: list as Product[], isLoading: false };
  if (!ids.length) return { products: [], isLoading: false };
  const byId = new Map((data?.items ?? []).map((p) => [Number(p.id), p]));
  return {
    products: ids.map((id) => byId.get(id)).filter((p): p is Product => !!p),
    isLoading,
  };
}
