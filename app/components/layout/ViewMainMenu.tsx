/**
 * Port of View's `assets/js/partials/main-menu.js` (`<custom-main-menu>`), from the
 * store's `menus/header`:
 * - {@link ViewDesktopMenu}: the `lg+` `ul.main-menu` (root items, hover sub-menus,
 *   mega panels with a `salla-products-list` of the item's products).
 * - {@link ViewMobileMenu}: the drawer app.js `initiateMobileMenu` builds with
 *   mmenu-light below 1024px (offcanvas on the reading side, light sliding panels
 *   titled `blocks.header.main_menu`). React drives the same `mm-ocd` / `mm-spn`
 *   classes mmenu-light sets, so the look is the library's own CSS.
 */
import { useEffect, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { useRouterState } from '@tanstack/react-router';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { menu } from '@salla.sa/twilight-theme-engine/api/menu';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { MenuItem } from '@salla.sa/twilight-theme-engine/types';
import { menuProductIds } from '../../lib/menuOverflow';
import { ProductCard } from '../product/ProductCard';

const NO_ITEMS: MenuItem[] = [];
const kids = (item: MenuItem) => item.children ?? [];

export function useHeaderMenu(): MenuItem[] {
  const { data = NO_ITEMS } = useQuery(menu.queries.header());
  return data;
}

/** Twig's `<salla-products-list source="selected" shadow-on-hover>`, with the theme's card. */
function MegaProducts({ ids }: { ids: number[] }) {
  const { data } = useQuery(product.queries.list({ source: 'selected', sourceValue: ids, perPage: ids.length }));
  return (
    <div className="s-products-list">
      <div className="s-products-list-wrapper s-products-list-vertical-cards">
        {(data?.items ?? []).map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
}

function DesktopItem({ item, root }: { item: MenuItem; root: boolean }) {
  const children = kids(item);
  const productIds = menuProductIds(item);
  const hasProducts = productIds.length > 0;
  const className = [
    '!hidden lg:!block',
    root ? 'root-level lg:!inline-block' : 'relative',
    hasProducts && 'mega-menu',
    children.length > 0 && 'has-children',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={className}>
      <Link to={item.url || '#'} aria-label={item.title || 'category'} target={item.target}>
        <span>{item.title}</span>
      </Link>
      {children.length > 0 && (
        <div className={`sub-menu ${hasProducts ? 'w-full left-0 flex' : 'w-56'}`}>
          <ul className={hasProducts ? 'w-56 shrink-0 m-8 rtl:ml-0 ltr:mr-0' : ''}>
            {children.map((child) => (
              <DesktopItem key={child.id} item={child} root={false} />
            ))}
          </ul>
          {hasProducts && (
            <MegaProducts ids={productIds} />
          )}
        </div>
      )}
    </li>
  );
}

/** The `lg+` menu beside the logo (`<custom-main-menu class="lg:flex hidden">`). */
export function ViewDesktopMenu() {
  const items = useHeaderMenu();
  return (
    <div className="lg:flex hidden">
      <nav className="mobile-menu">
        <ul className="main-menu">
          {items.map((item) => (
            <DesktopItem key={item.id} item={item} root />
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** One mobile `li`; `path` is the chain of open item ids, `depth` this item's level. */
function MobileItem({
  item,
  path,
  depth,
  displayAll,
  onOpen,
}: {
  item: MenuItem;
  path: (string | number)[];
  depth: number;
  displayAll: string;
  onOpen: (depth: number, item: MenuItem) => void;
}) {
  const children = kids(item);
  const image = item.image ? (
    <img src={item.image} className="rounded-full" width={48} height={48} alt={item.title} />
  ) : null;

  if (!children.length) {
    return (
      <li className="lg:hidden text-sm font-bold">
        <Link
          to={item.url || '#'}
          aria-label={item.title || 'category'}
          target={item.target}
          className={`text-mediumgray ${item.image ? '!py-3' : ''}`}
        >
          {image}
          <span>{item.title || ''}</span>
        </Link>
      </li>
    );
  }

  const open = path[depth] === item.id;
  const isParent = open && path.length > depth + 1;
  return (
    <li
      className="lg:hidden text-sm font-bold"
      onClick={(event) => {
        // mmenu-light: a click on the li (not a link inside it) opens its panel.
        if ((event.target as HTMLElement).closest('a')) return;
        event.stopPropagation();
        onOpen(depth, item);
      }}
    >
      <span className={item.image ? '!py-3' : ''}>
        {image}
        {item.title}
      </span>
      <ul className={[open && 'mm-spn--open', isParent && 'mm-spn--parent'].filter(Boolean).join(' ') || undefined}>
        <li className="text-sm font-bold">
          <Link to={item.url || '#'} className="text-gray-500">
            {displayAll}
          </Link>
        </li>
        {children.map((child) => (
          <MobileItem
            key={child.id}
            item={child}
            path={path}
            depth={depth + 1}
            displayAll={displayAll}
            onOpen={onOpen}
          />
        ))}
      </ul>
    </li>
  );
}

/** Finds the titles of the open panels, deepest last. */
function openTitles(items: MenuItem[], path: (string | number)[]): string[] {
  const titles: string[] = [];
  let level = items;
  for (const id of path) {
    const item = level.find((entry) => entry.id === id);
    if (!item) break;
    titles.push(item.title);
    level = kids(item);
  }
  return titles;
}

export function ViewMobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const items = useHeaderMenu();
  const [path, setPath] = useState<(string | number)[]>([]);
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => setMounted(true), []);
  // A link inside navigates without closing the drawer itself.
  useEffect(() => {
    onClose();
    setPath([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useDocumentClass({ body: { class: open ? ['mm-ocd-opened', 'menu-opened'] : [] } });

  const isRtl = (theme as { is_rtl?: boolean } | undefined)?.is_rtl ?? true;
  const titles = openTitles(items, path);
  const title = titles[titles.length - 1] || t('blocks.header.main_menu');
  const onOpen = (depth: number, item: MenuItem) => setPath((current) => [...current.slice(0, depth), item.id]);
  // mmenu-light: a click on the navbar (the nav itself) goes back one panel.
  const onNavClick = (event: MouseEvent<HTMLElement>) => {
    if (event.target === event.currentTarget) setPath((current) => current.slice(0, -1));
  };

  if (!mounted) return null;

  return createPortal(
    <div className={`mm-ocd mm-ocd--${isRtl ? 'right' : 'left'}${open ? ' mm-ocd--open' : ''}`}>
      <div className="mm-ocd__content">
        <nav
          id="mobile-menu"
          className={`mobile-menu mm-spn mm-spn--light mm-spn--navbar${path.length ? '' : ' mm-spn--main'}`}
          data-mm-spn-title={title}
          onClick={onNavClick}
        >
          <ul className={`main-menu mm-spn--open${path.length ? ' mm-spn--parent' : ''}`}>
            {items.map((item) => (
              <MobileItem
                key={item.id}
                item={item}
                path={path}
                depth={0}
                displayAll={t('blocks.home.display_all')}
                onOpen={onOpen}
              />
            ))}
          </ul>
          <button type="button" className="btn--close close-mobile-menu sicon-cancel lg:hidden" aria-label={t('common.elements.close')} onClick={onClose} />
        </nav>
      </div>
      <div className="mm-ocd__backdrop" onMouseDown={onClose} onTouchStart={onClose} />
    </div>,
    document.body
  );
}
