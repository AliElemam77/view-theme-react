/**
 * Port of View's `#search-panel` (`layouts/extentions.twig`) + `partials/search.js`:
 * a blurred full-screen panel with a live search box (3+ characters, 12 results),
 * the merchant's quick-search chips (`quick_search_keywords`, `%%`-separated) and
 * the "most searched" product cards (`most_searched_products`).
 */
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';

const MIN_CHARS = 3;

const imageOf = (p: Product) =>
  (p as { image?: { url?: string } }).image?.url || p.images?.[0]?.url || (p as { thumbnail?: string }).thumbnail || '';

/** The ids of an `items` / `source: products` setting (ids, `{value}` options or products). */
function pickedIds(value: unknown): number[] {
  const list = Array.isArray(value) ? value : (value as { value?: unknown } | null)?.value;
  if (!Array.isArray(list)) return [];
  return list
    .map((v) => (v && typeof v === 'object' ? ((v as { value?: unknown; id?: unknown }).value ?? (v as { id?: unknown }).id) : v))
    .map((v) => parseInt(String(v ?? ''), 10))
    .filter(Number.isFinite);
}

function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function ResultsSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-lg">
          <div className="w-14 h-14 rounded-md bg-black/10 animate-pulse flex-none" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 bg-black/10 rounded animate-pulse w-1/2" />
            <div className="h-3 bg-black/10 rounded animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ViewSearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const { settings } = useViewSettings();
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [entered, setEntered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const term = useDebounced(query.trim());
  const active = term.length >= MIN_CHARS;

  // search.js open / close: unhide, then animate in; animate out, then hide (300ms).
  useEffect(() => {
    if (open) {
      setShown(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
      const focus = setTimeout(() => inputRef.current?.focus(), 0);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(focus);
      };
    }
    setEntered(false);
    const id = setTimeout(() => setShown(false), 300);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const results = useQuery({
    ...product.queries.list({ source: 'search', keyword: term, perPage: 12 }),
    enabled: active,
  });
  const items = results.data?.items ?? [];
  const state = !active ? 'idle' : results.isFetching ? 'loading' : items.length ? 'has' : 'empty';

  const keywords = String(settings.quick_search_keywords ?? '')
    .replace(/"/g, '')
    .split('%%')
    .map((word) => word.trim())
    .filter(Boolean);
  const showKeywords = booleanValue(settings.has_search_keywords, true);
  const suggestionIds = pickedIds(settings.most_searched_products);
  const showSuggestions = booleanValue(settings.show_top_searched_products, true) && suggestionIds.length > 0;
  const suggestions = useQuery({
    ...product.queries.list({ source: 'selected', sourceValue: suggestionIds, perPage: suggestionIds.length || 1 }),
    enabled: shown && showSuggestions,
  });

  if (!shown) return null;

  const fade = entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2';
  const status =
    state === 'loading'
      ? t('pages.search.loading')
      : state === 'empty'
        ? t('pages.search.empty')
        : state === 'idle'
          ? t('pages.search.idle', { minChars: MIN_CHARS })
          : '';

  return (
    <div
      id="search-panel"
      className={`fixed inset-0 z-[99999]${state === 'loading' ? ' is-loading' : ''}${state === 'has' ? ' is-products-fetched' : ''}${
        state === 'idle' || state === 'empty' ? ' has-no-products' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-title"
    >
      <span
        data-overlay="search-panel"
        aria-hidden="true"
        className={`absolute inset-0 backdrop-blur-xl pointer-events-auto transition-all duration-200 transform ${
          entered ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        onClick={onClose}
      />
      <button
        type="button"
        data-close="search-panel"
        aria-label={t('blocks.header.close')}
        className="cl_w"
        onClick={onClose}
      />
      <div className="absolute inset-0 bg-black/50" data-close="search-panel" aria-hidden="true" onClick={onClose} />
      <div
        className={`relative mx-auto mt-20  mb-5 p-2 w-[92%] max-w-2xl rounded-theme bg-primary-reverse text-darkgray border border-lightgray shadow-2xl outline-none s-search-container !max-h-max h-auto transition-all duration-200 transform ${
          entered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
        }`}
      >
        <h2 id="search-title" className="sr-only">
          {t('blocks.header.search')}
        </h2>
        <div className={`s-search-input-wrapper transition-all duration-200 ${fade}`}>
          <span className="s-search-icon-wrap">
            <span className="s-search-icon">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                <path d="M30.276 28.391l-7.576-7.576c1.644-2.053 2.633-4.652 2.633-7.481 0-6.616-5.384-12-12-12s-12 5.384-12 12 5.384 12 12 12c2.829 0 5.428-0.989 7.481-2.633l7.576 7.576c0.26 0.26 0.601 0.391 0.943 0.391s0.683-0.131 0.943-0.391c0.521-0.521 0.521-1.364 0-1.885zM13.333 22.667c-5.147 0-9.333-4.187-9.333-9.333s4.187-9.333 9.333-9.333 9.333 4.187 9.333 9.333-4.187 9.333-9.333 9.333z" />
              </svg>
            </span>
          </span>
          <label htmlFor="search-input" className="sr-only">
            {t('blocks.header.search')}
          </label>
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            name="q"
            enterKeyHint="search"
            inputMode="search"
            autoComplete="off"
            placeholder={t('blocks.header.search_placeholder')}
            className="w-full bg-transparent text-darkgray placeholder:text-mediumgray outline-none s-search-input"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setChip(null);
            }}
          />
        </div>
        <p id="search-status" className="text-sm text-mediumgray text-center">
          {status}
        </p>
        <div
          id="search-results"
          className={`max-h-56 overflow-y-auto transition-all duration-200 ${fade}`}
          aria-busy={state === 'loading' || undefined}
        >
          {state === 'loading' ? (
            <ResultsSkeleton />
          ) : (
            active &&
            items.map((item) => (
              <Link
                key={item.id}
                to={item.url || '#'}
                className="flex items-center gap-3 py-3 hover:bg-lightgray/40 px-2 rounded-lg transition"
                onClick={onClose}
              >
                <img src={imageOf(item)} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-none" loading="lazy" referrerPolicy="no-referrer" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-darkgray truncate">{item.name}</div>
                  <div className="text-xs text-mediumgray truncate">{format(item.price)}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="relative mx-auto flex-center flex-col gap-5 container">
        {showKeywords && (
          <div className="flex-center flex-col sm:flex-row gap-2">
            <h3 className="text-white">{t('blocks.header.quick_search')}:</h3>
            {keywords.length > 0 && (
              <div id="suggestions" className={`flex flex-wrap items-center gap-2 mt-2 transition-all duration-200 ${fade}`}>
                {keywords.map((word) => (
                  <button
                    key={word}
                    type="button"
                    data-kw={word}
                    className={`qs-chip inline-flex items-center px-3 py-1.5 rounded-theme text-sm leading-none border border-primary-l backdrop-blur-md backdrop-saturate-150 transition hover:bg-white/20 ${
                      chip === word ? 'bg-white text-black border-white' : 'bg-white/10 text-white'
                    }`}
                    onClick={() => {
                      setChip(word);
                      setQuery(word);
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {showSuggestions && (
          <div className="flex-center flex-col">
            <h3 className="text-white">{t('blocks.header.quick_search_title')}</h3>
            <div
              id="product-suggestions"
              className={`flex flex-wrap items-center gap-2 mt-2 transition-all duration-200 ${fade}`}
              aria-busy={suggestions.isLoading || undefined}
            >
              {suggestions.isLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 px-2 rounded-theme bg-lightgray/30 animate-pulse">
                      <div className="w-14 h-14 rounded-md bg-lightgray/60 flex-none" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3 bg-lightgray/60 rounded w-2/3" />
                        <div className="h-3 bg-lightgray/60 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                : (suggestions.data?.items ?? []).map((item) => (
                    <Link
                      key={item.id}
                      to={item.url || '#'}
                      className="flex items-center gap-3 py-3 px-2 rounded-theme transition hover:opacity-95 bg-primary-reverse text-darkgray border border-lightgray flex-1"
                      onClick={onClose}
                    >
                      <img src={imageOf(item)} alt={item.name} className="w-14 h-14 object-cover rounded-md flex-none" loading="lazy" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-darkgray truncate">{item.name}</div>
                        <div className="text-xs text-mediumgray truncate">
                          {format(item.price)}
                          {item.category?.name ? ` • ${item.category.name}` : ''}
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
