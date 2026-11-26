/**
 * Ports of View's `layouts/css.twig` and the inline theme-mode bootstrap in
 * `layouts/master.twig`, so the React theme paints with the same CSS variables
 * and the same `data-theme` attribute as the Twig theme, before first paint.
 */
import { optionValue } from './fieldValue';

type Settings = Record<string, unknown> | undefined | null;

/** `theme.settings.get(id, fallback)` for a scalar setting. */
function get(settings: Settings, id: string, fallback: string): string {
  const raw = settings?.[id];
  const value = optionValue(raw).trim();
  return value === '' ? fallback : value;
}

/** Strip anything that could break out of the `<style>` / CSS declaration. */
function cssValue(value: string): string {
  return value.replace(/[<>{};]/g, '');
}

export interface ThemeColor {
  primary?: string;
  reverse_text?: string;
}

/** `layouts/css.twig` — the per-mode custom properties, built from the merchant's settings. */
export function buildThemeCss(settings: Settings, color: ThemeColor | undefined): string {
  const g = (id: string, fallback: string) => cssValue(get(settings, id, fallback));
  const primary = cssValue(color?.primary || '#414042');
  const reverse = cssValue(color?.reverse_text || '#ffffff');

  const modeVars = (suffix: {
    bg: string;
    cards: string;
    price: string;
    cardsText: [string, string];
    light: string;
    medium: string;
    dark: string;
    footerBg: string;
    footerText: string;
    headerBg: string;
    headerText: string;
  }) => {
    const footerText = g(suffix.footerText, '#3C5E39');
    return [
      `--color-bg: ${g(suffix.bg, '#F2F6EF')};`,
      `--cards-color: ${g(suffix.cards, '#FFFFFF')};`,
      `--color-price: ${g(suffix.price, '#F55157')};`,
      `--cards-color-text: ${g(suffix.cardsText[0], suffix.cardsText[1])};`,
      `--light-gray-color: ${g(suffix.light, '#D6D6D6')};`,
      `--medium-gray-color: ${g(suffix.medium, '#666666')};`,
      `--dark-gray-color: ${g(suffix.dark, '#1D1F1F')};`,
      `--color-footer-bg: ${g(suffix.footerBg, '#F2F6EF')};`,
      `--color-footer-text: ${footerText};`,
      `--color-footer-text-ops: ${footerText}78;`,
      `--color-header-bg: ${g(suffix.headerBg, '#F2F6EF')};`,
      `--color-header-text: ${g(suffix.headerText, '#3C5E39')};`,
    ].join('');
  };

  // Dark and carbon recolour the primary. The engine writes the light primary
  // inline on <html> (style attribute), which beats any stylesheet rule, so the
  // per-mode primary needs !important to take over the way it does in Twig.
  const derivedPrimary = (id: string) =>
    `--color-primary: ${g(id, primary)} !important;` +
    '--color-primary-dark: color-mix(in hsl, var(--color-primary) 85%, black) !important;' +
    '--color-primary-light: color-mix(in hsl, var(--color-primary) 85%, white) !important;' +
    '--color-primary-ops: rgb(from var(--color-primary) r g b / 12%) !important;' +
    '--color-primary-reverse: color-contrast(var(--color-primary) vs white, black) !important;';

  return [
    `:root{--border-custom: ${g('boreder_radius_val', '8')}px;--rause-card: ${g('raduse_cards', '4')}px;}`,
    'html[data-theme="light"]{' +
      `--color-primary-ops: ${primary}1f;` +
      `--color-primary-reverse: ${reverse};` +
      modeVars({
        bg: 'store_bg_color',
        cards: 'cards_color',
        price: 'price_color_light',
        cardsText: ['cards_text', '#1D1F1F'],
        light: 'light_gray_color',
        medium: 'medium_gray_color',
        dark: 'dark_gray_color',
        footerBg: 'bg_footerlight_mode',
        footerText: 'text_footerlihgt_mode',
        headerBg: 'color_bg_header',
        headerText: 'color_text_header',
      }) +
      '}',
    'html[data-theme="dark"]{' +
      derivedPrimary('store_color_primary_dark') +
      modeVars({
        bg: 'store_bg_color_dark',
        cards: 'cards_color_dark',
        price: 'price_color_dark',
        cardsText: ['cards_text_dark', '#F2F6EF'],
        light: 'light_gray_dark_mode',
        medium: 'medium_gray_dark_mode',
        dark: 'dark_gray_dark_mode',
        footerBg: 'bg_footerdark_mode',
        footerText: 'text_footerdark_mode',
        headerBg: 'color_bg_header_dark',
        headerText: 'color_text_header_dark',
      }) +
      '}',
    'html[data-theme="carbon"]{' +
      derivedPrimary('store_color_primary_carbon') +
      modeVars({
        bg: 'store_bg_color_carbon',
        cards: 'cards_color_carbon',
        price: 'price_color_carbon',
        cardsText: ['cards_text_carbon', '#F2F6EF'],
        light: 'light_gray_carbon_mode',
        medium: 'medium_gray_carbon_mode',
        dark: 'dark_gray_carbon_mode',
        footerBg: 'bg_footer_carbon_mode',
        footerText: 'text_footer_carbon_mode',
        headerBg: 'color_bg_header_carbon',
        headerText: 'color_text_header_carbon',
      }) +
      '}',
  ].join('\n');
}

export const THEME_MODE_KEY = 'theme:mode';
export type ThemeMode = 'light' | 'dark' | 'carbon' | 'time' | 'auto';

/** The merchant's `default_theme_mode` (Twig default: `auto`). */
export function defaultThemeMode(settings: Settings): ThemeMode {
  const mode = get(settings, 'default_theme_mode', 'auto');
  return (['light', 'dark', 'carbon', 'time', 'auto'] as const).includes(mode as ThemeMode)
    ? (mode as ThemeMode)
    : 'auto';
}

/** `app.js` `resolveMode`: auto follows the OS, time is light 07:00–18:00. */
export function resolveThemeMode(mode: string): string {
  if (mode === 'auto') {
    return typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  if (mode === 'time') {
    const h = new Date().getHours();
    return h >= 7 && h < 18 ? 'light' : 'dark';
  }
  return mode;
}

/**
 * The inline bootstrap from `master.twig`, run before first paint so the page
 * never flashes the wrong mode. Twig's own boot script falls back to `auto`
 * and `app.js` then re-applies `def_theme`; this goes straight to the final
 * value so the two steps can't flash.
 */
export function themeModeScript(defaultMode: ThemeMode): string {
  return (
    `window.def_theme=${JSON.stringify(defaultMode)};` +
    '(function(){try{var saved=localStorage.getItem("theme:mode");' +
    'var mode=saved||window.def_theme||"auto";' +
    'if(mode==="auto")mode=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";' +
    'else if(mode==="time"){var h=new Date().getHours();mode=(h>=7&&h<18)?"light":"dark";}' +
    'document.documentElement.setAttribute("data-theme",mode);}catch(_){}}());'
  );
}

/** `css.twig`'s `sp_com_cu`: the bottom margin every View home block takes, from `space_inner`. */
export function sectionSpacing(settings: Settings): string {
  switch (get(settings, 'space_inner', 'md')) {
    case 'xxs':
      return 'mb-3 md:mb-6';
    case 'xs':
      return 'mb-6 md:mb-10';
    case 'md':
      return 'mb-8 md:mb-14';
    case 'lg':
      return 'mb-12 md:mb-20';
    case 'xl':
      return 'mb-16 md:mb-28';
    default:
      return 'mb-14 md:mb-24';
  }
}
