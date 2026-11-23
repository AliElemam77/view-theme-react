/** Small helpers shared by the View home-block ports (V_*.twig → React). */

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
