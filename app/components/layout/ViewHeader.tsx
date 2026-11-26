/**
 * Port of View's `components/header/header.twig` + app.js `initiateStickyMenu`:
 * row 1 is the burger (phones), the logo and the desktop menu; under the animated
 * line, row 2 is the user menu, currency and language on one side, theme mode,
 * bullet delivery, cart, wishlist and search on the other. Every colour comes from
 * `--color-header-bg` / `--color-header-text` (css.twig).
 *
 * Sticky (`header_is_sticky`): the header keeps its height in the flow; once the
 * page scrolls past it the inner bar is fixed (`fixed-pinned`) and, after 200px,
 * slides in (`fixed-header`). With `has_mearged_header` on the home page the
 * header sits over the first block (`index_abso`) and its text takes
 * `color_text_header_merge` until it pins.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { SallaUserMenu } from '@salla.sa/twilight-components-react/user-menu';
import { SallaCartSummary } from '@salla.sa/twilight-components-react/cart-summary';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, optionValue } from '../../lib/fieldValue';
import { HOME_ROUTE_ID } from '../../lib/routeIds';
import { CurrencyDropdown, LanguageDropdown, ThemeModeDropdown } from './ViewHeaderDropdowns';
import { ViewDesktopMenu, ViewMobileMenu } from './ViewMainMenu';
import { ViewSearchPanel } from './ViewSearchPanel';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const CART_ICON =
  'M6.253 7.178v-.814c0-2.846 2.372-5.114 5.25-5.114s5.25 2.268 5.25 5.114v.81c.427.145.815.333 1.168.573 1.124.761 1.765 1.953 2.293 3.513a.75.75 0 1 1-1.421.48c-.494-1.46-1-2.269-1.714-2.752-.726-.492-1.799-.738-3.647-.738H9.653c-1.917 0-3.069.25-3.87.823-.793.566-1.38 1.549-1.904 3.372-.491 1.704-.842 2.926-1.013 3.887-.17.953-.14 1.541.04 2.009a3.6 3.6 0 0 0 1.316 1.652c.572.395 1.718.746 3.26.975 1.507.224 3.277.317 5 .27a.75.75 0 1 1 .042 1.5c-1.797.049-3.657-.047-5.262-.286-1.57-.233-3.017-.62-3.893-1.225a5.1 5.1 0 0 1-1.86-2.343c-.328-.842-.31-1.753-.12-2.815.186-1.047.56-2.344 1.036-3.997l.012-.042c.555-1.927 1.264-3.313 2.473-4.177.406-.29.853-.51 1.343-.675m1.5-.814c0-1.975 1.657-3.614 3.75-3.614s3.75 1.64 3.75 3.614v.483a15 15 0 0 0-1.82-.097h-3.78c-.683 0-1.316.029-1.9.102z';
const CART_PLUS =
  'M18.003 13.25a.75.75 0 0 1 .75.75v3.25h3.25a.75.75 0 0 1 0 1.5h-3.25V22a.75.75 0 0 1-1.5 0v-3.25h-3.25a.75.75 0 0 1 0-1.5h3.25V14a.75.75 0 0 1 .75-.75M10.503 10.25a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5z';
const HEART_ICON =
  'M3.145 1.355c2.98-1.829 5.655-1.1 7.27.113.266.2.449.336.585.429.135-.093.318-.23.584-.429 1.615-1.213 4.29-1.942 7.27-.113 2.062 1.264 3.221 3.905 2.814 6.94-.409 3.049-2.382 6.498-6.562 9.591l-.104.077C13.551 19.038 12.59 19.75 11 19.75s-2.552-.712-4.003-1.787q-.052-.037-.104-.077C2.713 14.793.74 11.344.33 8.295c-.407-3.035.753-5.676 2.814-6.94m7.698.638h.001zm.312 0h.001zm-1.64.675c-1.197-.899-3.203-1.496-5.586-.035-1.458.895-2.456 2.894-2.111 5.462.342 2.554 2.03 5.67 5.967 8.585 1.582 1.172 2.16 1.57 3.215 1.57s1.632-.398 3.214-1.57c3.938-2.914 5.625-6.031 5.968-8.585.344-2.568-.654-4.567-2.112-5.462-2.382-1.46-4.39-.864-5.586.035l-.02.015c-.271.204-.503.378-.689.5a2.4 2.4 0 0 1-.315.177 1.1 1.1 0 0 1-.46.107 1.1 1.1 0 0 1-.461-.107 2.4 2.4 0 0 1-.315-.177c-.186-.122-.418-.297-.688-.5z';

type SallaEvents = {
  event?: {
    on?: (name: string, fn: (payload: unknown) => void) => void;
    off?: (name: string, fn: (payload: unknown) => void) => void;
  };
  cart?: { getCurrentCart?: () => Promise<{ data?: { cart?: { total?: unknown } } } | undefined> };
};

/** The cart total for the cart link's tooltip (app.js `V__replace`: refreshed on `cart::updated`). */
function useCartTotal(): string {
  const [total, setTotal] = useState('');
  useEffect(() => {
    type Bus = NonNullable<SallaEvents['event']>;
    let boundTo: Bus | undefined;
    let cancelled = false;

    const setFromCart = (cart: unknown) => {
      const value = (cart as { total?: unknown } | undefined)?.total;
      if (value !== undefined && value !== null) setTotal(String(value));
    };

    const bind = () => {
      if (cancelled) return;
      const salla = window.salla as unknown as SallaEvents | undefined;
      if (salla?.event && !boundTo) {
        boundTo = salla.event;
        boundTo.on?.('cart::updated', setFromCart);
      }
      if (salla?.cart?.getCurrentCart) {
        Promise.resolve(salla.cart.getCurrentCart())
          .then((res) => {
            if (!cancelled) setFromCart(res?.data?.cart);
          })
          .catch(() => undefined);
      }
    };

    bind();
    document.addEventListener('theme::ready', bind);
    return () => {
      cancelled = true;
      document.removeEventListener('theme::ready', bind);
      boundTo?.off?.('cart::updated', setFromCart);
    };
  }, []);
  return total;
}

/** `.line-inner` grows in once the loader is gone (loading-screen-assets.twig). */
function useLoaderDone(): boolean {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const w = window as Window & { __viewLoaded?: boolean };
    if (w.__viewLoaded) {
      setDone(true);
      return;
    }
    const onLoaded = () => setDone(true);
    document.addEventListener('view::loaded', onLoaded);
    return () => document.removeEventListener('view::loaded', onLoaded);
  }, []);
  return done;
}

interface StickyState {
  pinned: boolean;
  slid: boolean;
  height?: number;
}

/** app.js `initiateStickyMenu` + `setHeaderHeight`. */
function useStickyHeader(enabled: boolean) {
  const navRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<StickyState>({ pinned: false, slid: false });

  const measure = useCallback(() => {
    const nav = navRef.current;
    const inner = innerRef.current;
    if (!nav || !inner) return { pinY: 0, height: 0 };
    const height = inner.clientHeight;
    const pinY = nav.getBoundingClientRect().top + window.scrollY + height;
    return { pinY, height };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return;
    let { pinY, height } = measure();
    const onScroll = () => {
      const y = window.scrollY;
      setState((current) => {
        const next = { pinned: y >= pinY, slid: y >= 200, height };
        return current.pinned === next.pinned && current.slid === next.slid && current.height === next.height
          ? current
          : next;
      });
    };
    const recalc = () => {
      ({ pinY, height } = measure());
      onScroll();
    };
    recalc();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(recalc);
    if (innerRef.current) observer?.observe(innerRef.current);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', recalc);
    window.addEventListener('load', recalc);
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', recalc);
      window.removeEventListener('load', recalc);
    };
  }, [enabled, measure]);

  return { navRef, innerRef, ...state };
}

export function ViewHeader() {
  const { store, theme } = useTwilight();
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const lineActive = useLoaderDone();
  const cartTotal = useCartTotal();

  const isHome = useRouterState({
    select: (state) => state.matches.some((match) => match.routeId === HOME_ROUTE_ID),
  });
  const sticky = booleanValue(settings.header_is_sticky, true);
  const merged = booleanValue(settings.has_mearged_header, true) && isHome;
  const mergeColor = optionValue(settings.color_text_header_merge) || '#fff';
  const { navRef, innerRef, pinned, slid, height } = useStickyHeader(sticky);
  const isRtl = (theme as { is_rtl?: boolean } | undefined)?.is_rtl ?? true;
  const menuIcon = optionValue(settings.main_manue);
  const logoWidth = optionValue(settings.logo_header_width) || '150';

  const navClass = [
    'main-nav-container',
    merged ? 'index_abso absolute inset-0 z-50 absolute__header h-fit' : 'bg-[var(--color-header-bg)] shadow-default',
    pinned && 'fixed-pinned animated',
    slid && 'fixed-header',
  ]
    .filter(Boolean)
    .join(' ');
  // Twig sets the merge colour on <html> while unpinned; scoping it to the header
  // gives the header the same colours without touching the document.
  const navStyle = {
    ...(sticky && height ? { height } : {}),
    ...(merged && !pinned ? { '--color-header-text': mergeColor } : {}),
  } as CSSProperties;
  const cartTip = cartTotal ? `${t('pages.orders.final_total')} : ${cartTotal}`.trim() : t('blocks.header.cart');

  return (
    <header data-testid="store-header" className="store-header relative z-[5]">
      <HookSlot name="header:start" />
      <div className="lg:hidden">
        <salla-bullet-delivery-tag />
      </div>
      <div id="mainnav" ref={navRef} className={navClass} style={navStyle}>
        <div className="inner bg-inherit" ref={innerRef} style={{ transform: 'translate3d(0, 0%, 0)' }}>
          <div className="container">
            <div className="flex  justify-between relative flex-col gap-2 py-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  data-testid="store-header-mobile-toggle"
                  className="lg:hidden mburger mburger--collapse leading-none rtl:ml-4 ltr:mr-4 bg-transparent border-0 p-0"
                  aria-label={t('blocks.header.main_menu', 'Menu')}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                >
                  <i className={`${menuIcon} ${isRtl ? 'flip-x' : ''} text-[var(--color-header-text)] text-2xl`} aria-hidden="true" />
                </button>
                <a data-testid="store-header-logo" className="navbar-brand" href={store?.url || '/'}>
                  <img
                    className="W__lsize"
                    fetchPriority="high"
                    width={150}
                    height={150}
                    loading="eager"
                    src={store?.logo}
                    alt={store?.name || t('common.titles.home', 'Store')}
                    style={{ '--logo-width': `${logoWidth}px` } as CSSProperties}
                  />
                  {isHome ? <h1 className="sr-only">{store?.name}</h1> : <h2 className="sr-only">{store?.name}</h2>}
                </a>
                <ViewDesktopMenu />
              </div>
              <div id="animated-line" className="w-full h-px overflow-hidden">
                <div className={`h-full bg-[var(--color-header-text)] line-inner${lineActive ? ' active' : ''}`} />
              </div>
              <div className="center-between">
                <div className="flex items-center justify-between gap-4 lg:gap-7">
                  <SallaUserMenu
                    data-testid="store-header-user-menu"
                    avatarOnly
                    showHeader
                    tooltip={t('blocks.header.user_menu')}
                    flow="down"
                    className="text-[var(--color-header-text)]"
                  />
                  <CurrencyDropdown />
                  <LanguageDropdown />
                </div>
                <div className="flex items-center justify-between gap-4 lg:gap-7">
                  <ThemeModeDropdown />
                  <div className="hidden lg:block">
                    <salla-bullet-delivery-tag />
                  </div>
                  {/* The engine Link takes no attributes of its own, so the CSS tooltip sits on a wrapper. */}
                  <span className="flex-center" tooltip={cartTip} flow="down" id="carttotal">
                  <Link to="/cart" className="flex-center">
                    <SallaCartSummary data-testid="store-header-cart" className="h-6">
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none">
                        <path fill="var(--color-header-text)" fillRule="evenodd" d={CART_ICON} clipRule="evenodd" />
                        <path fill="var(--color-header-text)" d={CART_PLUS} />
                      </svg>
                    </SallaCartSummary>
                  </Link>
                  </span>
                  <span className="flex-center" tooltip={t('blocks.header.wishlist')} flow="down">
                  <Link to="/wishlist" aria-label={t('blocks.header.wishlist')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" fill="none" aria-hidden="true">
                      <path fill="var(--color-header-text)" fillRule="evenodd" d={HEART_ICON} clipRule="evenodd" />
                    </svg>
                  </Link>
                  </span>
                  <button
                    type="button"
                    data-open="search-panel"
                    className="header-btn flex-center z-10"
                    aria-label={t('blocks.header.search')}
                    tooltip={t('blocks.header.search')}
                    flow="down"
                    onClick={() => setSearchOpen(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      stroke="var(--color-header-text)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="10.5" cy="10.5" r="6.5" />
                      <path d="M19.646 20.354l-5-5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="btn--close-sm close-mobile-menu sicon-cancel hidden" aria-label={t('common.elements.close')} onClick={closeMenu} />
      <ViewMobileMenu open={menuOpen} onClose={closeMenu} />
      <ViewSearchPanel open={searchOpen} onClose={closeSearch} />
      <HookSlot name="header:end" />
    </header>
  );
}
