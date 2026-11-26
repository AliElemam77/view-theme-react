import { useCallback, useEffect, useRef, useState } from 'react';
import { ItemsList } from '@salla.sa/twilight-components-react';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import type { Pagination } from '@salla.sa/twilight-theme-engine/api/types';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useLocation } from '@salla.sa/twilight-theme-engine/providers';
import type { ArticleSummary, BlogCategoryType } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { ActionBtn } from '../common/ActionBtn';
import { BlogCard } from './BlogCard';
import { BreadcrumbNav } from './BreadcrumbNav';

const EMPTY: never[] = [];

/** Which articles the list pages through (`blog/articles?category=…`); none on the blog index. */
export interface BlogListFilter {
  category?: string;
  tag?: string;
  author?: string;
}

export interface BlogListPageProps {
  page: Page;
  articles?: ArticleSummary[];
  categories?: BlogCategoryType[];
  /** Blog index only: Twig shows the empty placeholder only when there are no slides either. */
  slides?: ArticleSummary[];
  cursor?: Pagination | null;
  filter?: BlogListFilter;
  /** Engine page hook prefix: `blog` → `blog:start` / `blog:end`, `blog:category` → `blog:category.start` … */
  hook?: string;
}

/** The cursor in the API's `next` (a bare token, or a next-page URL carrying `cursor=`). */
function cursorOf(next: string | null): string | undefined {
  if (!next) return undefined;
  const match = next.match(/[?&]cursor=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : next;
}

/**
 * The mobile categories sheet (`.dropdown-toggler.cat-filter`) and blog.js's
 * `initiateDropdowns`: the trigger toggles `dropdown--is-opened` on `<body>`
 * (blog.scss opens `.dropdown__menu` off it); any other click closes it.
 */
function useCategoriesSheet() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useDocumentClass({ body: { class: open ? 'dropdown--is-opened' : [] } });

  useEffect(() => {
    if (!open) return undefined;
    const close = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('click', close, true);
    return () => document.removeEventListener('click', close, true);
  }, [open]);

  return { open, toggle: () => setOpen((v) => !v), close: () => setOpen(false), triggerRef };
}

/**
 * Port of `pages/blog/index.twig`, which Twig renders for the blog index and for
 * a category, tag or author: breadcrumb + mobile categories sheet, a `lg:w-1/5`
 * sidebar of category buttons, and the `skeleton.twig` cards in an infinite
 * scroll (`<salla-infinite-scroll autoload>`). No slider and no heading, as in Twig.
 */
export function BlogListPage({
  page,
  articles = EMPTY,
  categories = EMPTY,
  slides = EMPTY,
  cursor,
  filter,
  hook = 'blog',
}: BlogListPageProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const sheet = useCategoriesSheet();
  const categoriesTitle = t('pages.blog_categories.categories');
  const next = cursor?.next ?? null;

  const nextRef = useRef<string | null>(next);
  useEffect(() => {
    nextRef.current = next;
  }, [next]);

  const { category, tag, author } = filter ?? {};
  const loader = useCallback(async () => {
    const result = await blog.articles.list({
      ...(category && { category }),
      ...(tag && { tag }),
      ...(author && { author }),
      cursor: cursorOf(nextRef.current),
    });
    nextRef.current = result.cursor?.next ?? null;
    return { items: result.data, next: result.cursor?.next ?? null };
  }, [category, tag, author]);

  const listKey = `${page.slug}:${page.id ?? ''}`;

  return (
    <div key={listKey} className=" container mb-8 sm:mb-24">
      <div className="center-between">
        <BreadcrumbNav page={page} className="breadcrumbs w-full py-5" />

        <div className="dropdown-toggler cat-filter lg:hidden">
          <button
            ref={sheet.triggerRef}
            aria-label={categoriesTitle}
            type="button"
            className="dropdown__trigger lg:hidden rtl:space-x-reverse space-x-1.5 flex items-center text-sm text-primary"
            aria-expanded={sheet.open}
            aria-haspopup="true"
            onClick={sheet.toggle}
          >
            <i className="sicon-filter text-xs pointer-events-none" aria-hidden="true"></i>
            <span className="fix-align pointer-events-none">{categoriesTitle}</span>
          </button>
          <div
            className="dropdown__menu"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabIndex={-1}
          >
            <div className="flex items-center p-4 border-b mb-1 lg:hidden relative">
              <h2 className="font-bold">{categoriesTitle}</h2>
              <button
                type="button"
                aria-label={t('blocks.header.close')}
                onClick={sheet.close}
                className="dropdown__close h-12 w-12 text-red-500 text-lg rounded-full absolute top-2 rtl:left-1 ltr:right-1 z-50"
              >
                <i className="sicon-cancel pointer-events-none" aria-hidden="true"></i>
              </button>
            </div>
            <ul className="pb-4 lg:pb-2 py-2 px-2 lg:px-0 space-y-px">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    className={`p-2.5 block text-sm hover:text-primary${cat.is_current ? ' is-active' : ''}`}
                    to={cat.url}
                  >
                    <span className="rtl:ml-auto ltr:mr-auto">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <nav
          data-testid="store-blog-categories"
          aria-label="Sidebar"
          className="hidden lg:block lg:sticky shrink-0 top-24 lg:w-1/5"
          id="filters-menu"
        >
          <h2 className="font-bold mb-3 ">{categoriesTitle}</h2>
          <ul>
            {categories.map((cat) => (
              <li key={cat.id} className={cat.is_current ? 'text-primary' : undefined}>
                <ActionBtn
                  text={cat.name}
                  className="mt-2"
                  href={cat.url}
                  dataStyle="filled"
                  color="var(--color-primary-reverse)"
                  backgroundColor="var(--color-primary)"
                  icon
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="main-content flex-1">
          {/* Twig has no heading here; kept for screen readers only. */}
          <h1 className="sr-only">{page.title}</h1>
          <HookSlot name={`${hook}${hook === 'blog' ? ':' : '.'}start`} />
          {articles.length > 0 ? (
            <>
              <HookSlot name="blog:index.items.start" />
              <ItemsList<ArticleSummary>
                items={articles}
                resetKey={listKey}
                loader={next ? loader : undefined}
                mode={next ? 'infinite' : 'static'}
                pageUrl={location.pathname + location.searchStr}
                className="s-infinite-scroll"
                itemsClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6"
                t={(key, fallback) => t(key, fallback || key)}
              >
                {(items) => items.map((article) => <BlogCard key={article.id} article={article} />)}
              </ItemsList>
              <HookSlot name="blog:index.items.end" />
            </>
          ) : (
            !slides.length && (
              <div className="no-content-placeholder">
                <i className="sicon-inbox icon"></i>
                <p>{t('pages.blog_categories.no_articles')}</p>
              </div>
            )
          )}
          <HookSlot name={`${hook}${hook === 'blog' ? ':' : '.'}end`} />
        </div>
      </div>
    </div>
  );
}
