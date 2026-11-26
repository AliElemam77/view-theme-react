/** `app.pbr()` (app-helpers.js): deterministic promotion badge colours keyed by product id. */
export const PROMO_COLORS = [
  '#FF3B30', '#FF453A', '#FF5E3A', '#FF6B6B', '#FF9500', '#FFB300', '#FFCA28', '#FFD60A', '#FFC107',
  '#FBC02D', '#34C759', '#00C853', '#4CD964', '#00E676', '#1DE9B6', '#00BFA5', '#5AC8FA', '#40C4FF',
  '#0091EA', '#007AFF', '#2962FF', '#3D5AFE', '#5856D6', '#7C4DFF', '#AF52DE', '#C158DC', '#D500F9',
  '#FF2D55', '#F06292', '#EC407A', '#FF6B81', '#FF8A80', '#E91E63', '#F50057',
] as const;

/** Returns a deterministic promotion badge colour for a product id. */
export function promoColorFor(id: number | string | undefined): string {
  const numeric = Number(id);
  const index = Number.isFinite(numeric) ? Math.abs(Math.trunc(numeric)) % PROMO_COLORS.length : 0;
  return PROMO_COLORS[index] ?? PROMO_COLORS[0];
}
