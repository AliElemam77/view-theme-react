/**
 * The three dropdowns of View's `header.twig` second row: currency, language and
 * theme mode. They open on focus-within (pure CSS, as in Twig); the lists are
 * filled from the SDK like app.js `V__handelCurrency` / `V__handelLang`, and the
 * theme list applies modes like app.js `initThemes`.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { THEME_MODE_KEY, defaultThemeMode, resolveThemeMode, type ThemeMode } from '../../lib/viewTheme';

const ITEM =
  'flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary-reverse hover:text-primary-l transition-all duration-200 text-[var(--color-header-text)] w-full text-start bg-transparent border-0';
const LIST =
  'transition-all duration-200 transform scale-y-0 opacity-0 group-focus-within:scale-y-100 group-focus-within:opacity-100 origin-top absolute rtl:right-0 ltr:left-0 bg-[var(--color-header-bg)] w-40 z-10 shadow-lg rounded-md overflow-hidden';

function closeDropdownOnEscape(event: React.KeyboardEvent) {
  if (event.key === 'Escape') {
    (document.activeElement as HTMLElement | null)?.blur();
  }
}

type SallaSdk = {
  currency?: {
    list?: () => Promise<{ data?: Currency[] }>;
    api?: { change?: (code: string) => Promise<unknown> };
    change?: (code: string) => Promise<unknown>;
  };
  config?: {
    get?: (key: string, fallback?: unknown) => unknown;
    languages?: () => Promise<Language[] | Record<string, Language>>;
  };
  onReady?: () => Promise<unknown>;
};
interface Currency {
  code: string;
  name?: string;
  symbol?: string;
  status?: string;
}
interface Language {
  code?: string;
  iso_code?: string;
  name?: string;
  title?: string;
  country_code?: string;
  flag?: string;
  flag_url?: string;
}

const sdk = () => (typeof window !== 'undefined' ? (window.salla as unknown as SallaSdk | undefined) : undefined);

function Caret({ rotate = true }: { rotate?: boolean }) {
  return (
    <i
      className={`sicon-caret-down text-[var(--color-header-text)] transition-transform duration-200${
        rotate ? ' group-focus-within:rotate-180' : ''
      }`}
    />
  );
}

const CURRENCY_ICON =
  'M11.557 21.25c2.073 0 3.706 0 4.981-.172 1.308-.176 2.352-.545 3.174-1.366.821-.822 1.19-1.866 1.366-3.174.172-1.275.172-2.908.172-4.981v-1.114c0-2.073 0-3.706-.172-4.981-.176-1.308-.545-2.352-1.366-3.174-.822-.821-1.866-1.19-3.174-1.366C15.263.75 13.63.75 11.557.75h-1.114c-2.073 0-3.706 0-4.981.172-1.308.176-2.352.545-3.174 1.366-.821.822-1.19 1.866-1.366 3.174C.75 6.737.75 8.37.75 10.443v1.114c0 2.073 0 3.706.172 4.981.176 1.308.545 2.352 1.366 3.174.822.821 1.866 1.19 3.174 1.366 1.275.172 2.908.172 4.981.172zm-1.057-1.5c-2.143 0-3.674-.002-4.838-.158-1.142-.154-1.817-.444-2.313-.94-.497-.497-.787-1.172-.94-2.314-.157-1.164-.159-2.696-.159-4.838v-1c0-2.143.002-3.674.158-4.838.154-1.142.444-1.817.94-2.313.497-.497 1.172-.787 2.314-.94 1.164-.157 2.695-.159 4.838-.159h1c2.143 0 3.674.002 4.838.158 1.142.154 1.817.444 2.313.94.497.497.787 1.172.94 2.314.157 1.164.159 2.695.159 4.838v1c0 2.143-.002 3.674-.158 4.838-.154 1.142-.444 1.817-.94 2.313-.497.497-1.172.787-2.314.94-1.164.157-2.696.159-4.838.159zm-1.164-5.437c.272-.054.505-.21.657-.423l.611-.878c.064-.091.101-.2.101-.319v-1.29l1.177-.242v2.327l3.776-.777A3.9 3.9 0 0 0 16 11.477l-2.941.606v-1.164l2.6-.535c.177-.383.296-.798.341-1.234l-2.941.605V5.569c-.451.245-.852.571-1.177.955v3.473l-1.177.242V5c-.45.245-.85.57-1.176.955v4.525l-2.633.543a3.9 3.9 0 0 0-.341 1.233l2.974-.611v1.465l-3.187.656A3.9 3.9 0 0 0 6 15zm6.332.914c.173-.38.288-.794.332-1.227l-3.668.773c-.173.38-.288.794-.332 1.227z';
const LANGUAGE_ICON =
  'M11.058.75c2.19 0 3.91 0 5.253.18 1.377.186 2.47.573 3.328 1.431s1.245 1.95 1.43 3.327c.18 1.344.181 3.064.181 5.254v.116c0 2.19 0 3.91-.18 5.253-.186 1.377-.573 2.47-1.431 3.328s-1.95 1.245-3.328 1.43c-1.343.18-3.063.181-5.253.181h-.116c-2.19 0-3.91 0-5.254-.18-1.376-.186-2.468-.573-3.327-1.431-.858-.858-1.245-1.95-1.43-3.328C.75 14.968.75 13.248.75 11.058v-.116c0-2.19 0-3.91.18-5.254.186-1.376.573-2.468 1.431-3.327.859-.858 1.95-1.245 3.327-1.43C7.032.75 8.752.75 10.942.75zM11 2.25c-2.26 0-3.88.001-5.112.167-1.21.163-1.933.472-2.466 1.005S2.58 4.677 2.417 5.888C2.251 7.12 2.25 8.74 2.25 11s.001 3.88.167 5.112c.163 1.21.472 1.933 1.005 2.466s1.255.842 2.466 1.005c1.232.166 2.852.167 5.112.167s3.88-.001 5.112-.167c1.21-.163 1.933-.472 2.466-1.005s.842-1.255 1.005-2.466c.166-1.232.167-2.852.167-5.112s-.001-3.88-.167-5.112c-.163-1.21-.472-1.933-1.005-2.466s-1.255-.842-2.466-1.005C14.88 2.251 13.26 2.25 11 2.25m-.5 3a.75.75 0 0 1 .75.75v.629H16a.75.75 0 0 1 0 1.5h-1.946c-.54 1.6-1.441 3.1-2.455 4.436l1.477 1.536a.75.75 0 0 1-1.08 1.04l-1.348-1.402A34 34 0 0 1 7.9 16.552a.75.75 0 0 1-1.015-1.104 32 32 0 0 0 2.75-2.834 24 24 0 0 1-.68-.898c-.338-.467-.666-.96-.828-1.308a.75.75 0 0 1 1.36-.634c.096.205.346.596.684 1.065.135.188.278.38.422.566.762-1.037 1.418-2.14 1.864-3.276H6a.75.75 0 0 1 0-1.5h3.75V6a.75.75 0 0 1 .75-.75';
const SETTINGS_ICON =
  'M13.5 10.25a.75.75 0 0 1 .75.75v.469a3.7 3.7 0 0 1 1.82.958l.52-.341a.75.75 0 0 1 .82 1.256l-.5.328a3.55 3.55 0 0 1 0 2.661l.5.327a.75.75 0 0 1-.82 1.256l-.52-.34a3.7 3.7 0 0 1-1.82.957V19a.75.75 0 0 1-1.5 0v-.469a3.7 3.7 0 0 1-1.82-.958l-.52.341a.75.75 0 0 1-.82-1.256l.5-.327a3.55 3.55 0 0 1 0-2.661l-.5-.328a.75.75 0 0 1 .82-1.256l.52.34a3.7 3.7 0 0 1 1.82-.957V11a.75.75 0 0 1 .75-.75m0 2.643c-.758 0-1.42.378-1.808.945a2.05 2.05 0 0 0 0 2.324c.387.567 1.05.945 1.808.945s1.42-.378 1.808-.945a2.05 2.05 0 0 0 0-2.324 2.18 2.18 0 0 0-1.808-.945M6 12.25a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1 0-1.5zm11-6a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1 0-1.5zm0-6a.75.75 0 0 1 0 1.5H1a.75.75 0 0 1 0-1.5z';

/** app.js `V__handelCurrency`: the store's enabled currencies; picking one switches and reloads. */
export function CurrencyDropdown() {
  const { t } = useTranslation();
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    let alive = true;
    const salla = sdk();
    Promise.resolve(salla?.onReady?.())
      .then(() => salla?.currency?.list?.())
      .then((response) => {
        if (alive) setCurrencies((response?.data ?? []).filter((c) => c.status === 'enabled'));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const change = (code: string) => {
    const currency = sdk()?.currency;
    const run = currency?.api?.change ?? currency?.change;
    // As `<salla-localization-modal>`: switch through the SDK, then load the page again.
    Promise.resolve(run?.call(currency?.api ?? currency, code)).then(() =>
      window.location.assign(window.location.href)
    );
  };

  return (
    <div className="flex-center">
      <div className="group relative inline-block" onKeyDown={closeDropdownOnEscape}>
        <button
          type="button"
          className="flex-center focus:outline-none gap-2"
          tooltip={t('blocks.header.currency')}
          aria-label={t('blocks.header.currency')}
          aria-haspopup="true"
          flow="down"
        >
          <Caret />
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" aria-hidden="true">
            <path fill="var(--color-header-text)" d={CURRENCY_ICON} />
          </svg>
        </button>
        {currencies.length > 0 && (
          <ul id="currency-list" className={LIST}>
            {currencies.map((currency) => (
              <li key={currency.code}>
                <button type="button" className={ITEM} onClick={() => change(currency.code)}>
                  {currency.symbol} - {currency.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** app.js `V__handelLang`: the store's languages; picking one loads the page in it. */
export function LanguageDropdown() {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [current, setCurrent] = useState('ar');

  useEffect(() => {
    let alive = true;
    const salla = sdk();
    Promise.resolve(salla?.onReady?.())
      .then(() => {
        setCurrent(String(salla?.config?.get?.('user.language_code', 'ar') ?? 'ar').toLowerCase());
        return salla?.config?.languages?.();
      })
      .then((list) => {
        const all = Array.isArray(list) ? list : Object.values(list ?? {});
        if (alive) setLanguages(all);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const change = (code: string) => {
    if (!code || code === current) return;
    const url = new URL(window.location.href);
    if (url.pathname.startsWith(`/${current}/`) || url.pathname === `/${current}`) {
      url.pathname = url.pathname.replace(new RegExp(`^/${current}(?=/|$)`), `/${code}`);
    }
    url.searchParams.set('lang', code);
    window.location.assign(url.toString());
  };

  return (
    <div className="flex-center">
      <div className="group relative inline-block" onKeyDown={closeDropdownOnEscape}>
        <button
          type="button"
          className="flex-center focus:outline-none gap-2"
          tooltip={t('blocks.header.language')}
          aria-label={t('blocks.header.language')}
          aria-haspopup="true"
          flow="down"
        >
          <Caret />
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" aria-hidden="true">
            <path fill="var(--color-header-text)" d={LANGUAGE_ICON} />
          </svg>
        </button>
        {languages.length > 1 && (
          <ul id="language-list" className={LIST}>
            {languages.map((lang) => {
              const code = String(lang.code || lang.iso_code || '').toLowerCase();
              const name = lang.name || lang.title || code.toUpperCase();
              const country = String(lang.country_code || code).toLowerCase();
              const flag = lang.flag || lang.flag_url || '';
              const isCurrent = code === current;
              return (
                <li key={code} data-code={code}>
                  <button
                    type="button"
                    aria-current={isCurrent || undefined}
                    className={`${ITEM}${isCurrent ? ' opacity-60 cursor-default' : ''}`}
                    onClick={() => change(code)}
                  >
                    {flag ? (
                      <img src={flag} alt="" aria-hidden="true" className="w-5 h-5 rounded-full" />
                    ) : (
                      <span className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center" aria-hidden="true">
                        <span className={`iti__flag iti__${country}`} style={{ transform: 'scale(0.9)' }} />
                      </span>
                    )}
                    <span className="w-full block">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface ModeItem {
  mode: ThemeMode;
  icon: string;
  label: string;
}

/** Sets `<html data-theme>` (the bootstrap script in ViewThemeHead does the same before paint). */
function applyMode(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', resolveThemeMode(mode));
}

/** `header.twig`'s theme-mode list + app.js `initThemes` (auto follows the OS, time re-checks hourly). */
export function ThemeModeDropdown() {
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  const enableDark = booleanValue(settings.enable_dark_mode);
  const enableCarbon = booleanValue(settings.enable_carbon_mode);
  const fallback = defaultThemeMode(settings);
  const [saved, setSaved] = useState<ThemeMode>(fallback);

  useEffect(() => {
    try {
      setSaved(((localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) ?? fallback) || fallback);
    } catch {
      /* storage unavailable */
    }
  }, [fallback]);

  // Keep `auto` / `time` live, as initThemes does.
  useEffect(() => {
    applyMode(saved);
    if (saved === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => applyMode('auto');
      media.addEventListener?.('change', onChange);
      return () => media.removeEventListener?.('change', onChange);
    }
    if (saved === 'time') {
      const id = window.setInterval(() => applyMode('time'), 60 * 60 * 1000);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [saved]);

  if (!enableDark && !enableCarbon) return null;

  const modes: ModeItem[] = [
    { mode: 'light', icon: 'sicon-cloud-day', label: t('blocks.header.light_mode', 'الوضع الفاتح') },
  ];
  if (enableDark) modes.push({ mode: 'dark', icon: 'sicon-moon', label: t('blocks.header.dark_mode', 'الوضع الداكن') });
  if (enableCarbon)
    modes.push({ mode: 'carbon', icon: 'sicon-cloud-heart', label: t('blocks.header.carbon_mode', 'وضع الكربون') });
  if (enableDark && enableCarbon) {
    modes.push(
      { mode: 'time', icon: 'sicon-clock', label: t('blocks.header.time_mode', 'حسب توقيتك') },
      { mode: 'auto', icon: 'sicon-compass-direction', label: t('blocks.header.system_default', 'الوضع التلقائي') }
    );
  }

  const pick = (mode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_MODE_KEY, mode);
    } catch {
      /* storage unavailable */
    }
    setSaved(mode);
    (document.activeElement as HTMLElement | null)?.blur();
  };

  return (
    <div className="flex-center">
      <div className="group relative inline-block" onKeyDown={closeDropdownOnEscape}>
        <button
          type="button"
          id="theme-toggle-btn"
          className="flex-center gap-2 focus:outline-none"
          aria-haspopup="true"
          aria-label={t('blocks.header.settings', 'الإعدادات')}
          tooltip={t('blocks.header.settings', 'الإعدادات')}
          flow="down"
        >
          <Caret rotate={false} />
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" aria-hidden="true">
            <path fill="var(--color-header-text)" d={SETTINGS_ICON} />
          </svg>
        </button>
        <ul
          id="theme-list"
          className="transition-all duration-200 transform scale-y-0 opacity-0 group-focus-within:scale-y-100 rtl:left-0 ltr:right-0 group-focus-within:opacity-100 origin-top absolute bg-[var(--color-header-bg)] w-48 z-10 shadow-lg rounded-md overflow-hidden"
          role="menu"
          aria-label={t('blocks.header.settings', 'الإعدادات')}
        >
          {modes.map((item) => {
            const selected = item.mode === saved;
            return (
              <li key={item.mode} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  data-mode={item.mode}
                  data-selected={selected || undefined}
                  className="w-full text-start flex text-[var(--color-header-text)] items-center gap-2 px-3 py-2 cursor-pointer hover:bg-primary-reverse hover:text-primary-l transition-all duration-150 bg-transparent border-0"
                  onClick={() => pick(item.mode)}
                >
                  <i className={`${item.icon} text-base`} aria-hidden="true" />
                  <span className="flex-1 text-sm">{item.label}</span>
                  <i className={`sicon-check text-primary${selected ? '' : ' hidden'}`} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
