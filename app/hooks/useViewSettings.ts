import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { booleanValue } from '../lib/fieldValue';
import { sectionSpacing } from '../lib/viewTheme';

/**
 * Store-wide View settings every block reads:
 * - `reveal`: the `reveal` class Twig adds when `has_animation` is on (default on),
 * - `spacing`: `sp_com_cu`, the bottom margin from `space_inner` (css.twig).
 */
export function useViewSettings() {
  const { theme } = useTwilight();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  const reveal = booleanValue(settings.has_animation, true) ? 'reveal' : '';
  return { settings, reveal, spacing: sectionSpacing(settings) };
}
