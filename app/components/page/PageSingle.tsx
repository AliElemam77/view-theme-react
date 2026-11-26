import { Fragment, useMemo } from 'react';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import type { StaticPage } from '@salla.sa/twilight-theme-engine/routes/page';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { BlockHookSlot } from '../common';
import { BreadcrumbNav } from '../blog/BreadcrumbNav';

/** `page-single.twig`'s ribbon title (`style="clip-path: …"`). */
const RIBBON = 'polygon(0 0, 100% 0, calc(100% - 0.8em) 50%, 100% 100%, 0 100%, 0.8em 50%)';

/** Engine `StaticPage` plus the `type` our forked loader threads through. */
export type PageWithType = StaticPage & { type?: string };

export interface PageSingleProps {
  page: PageWithType;
}

/**
 * Theme fork of the engine `PageSingle` (rendered by `app/routes/$slug.page-$id.tsx`).
 *
 * Adds the classic-storefront `information_page.information_page` app hook: on a
 * `customised` page the whole body IS the app-injected block, so we render only
 * the hook — exactly like `page-single.twig`. Every other page type gets Twig's
 * layout: the breadcrumb, a full-width `bock_page` band with the ribbon title,
 * the content card and `<salla-comments>` below it, keyed by the page id so
 * moving from one page to another loads the new page's comments.
 *
 * Upgrade notes: `FORKS.md`.
 */
export function PageSingle({ page }: PageSingleProps) {
  const { commentsKey } = useComments();

  // Matches the engine: strip `&nbsp;` from the merchant-authored HTML.
  const cleanContent = useMemo(
    () => (page.content ? page.content.replace(/&nbsp;/g, ' ') : ''),
    [page.content]
  );

  if (page.type === 'customised') {
    return (
      <BlockHookSlot
        name="information_page.information_page"
        wrapper="s-information-page"
        className="!mt-0"
        scope={page.id != null ? { page_id: page.id } : undefined}
      />
    );
  }

  return (
    // Keyed by the page id: the loader gives every page the same `slug` (the route
    // id), and TanStack keeps the route mounted between two pages, so the comments
    // list would otherwise keep the page it first loaded for.
    <Fragment key={page.id ?? page.slug}>
      <BreadcrumbNav page={page} className="breadcrumbs w-full py-5 container" />
      <div className="flex justify-center flex-col gap-2">
        {/* `bock_page has-overlay` and the ribbon: 01-settings/global.scss, as in Twig. */}
        <div className="content--single-page py-8 text-center w-full bock_page has-overlay relative flex-center">
          <h1
            className="font-bold text-2xl text-bgcolor ribbon bg-primary-d w-fit py-2 px-8 z-2"
            style={{ clipPath: RIBBON }}
          >
            {page.title}
          </h1>
        </div>
        <div
          className="content-entry rounded-theme bg-primary-reverse container p-4"
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />
      </div>
      {page.id != null && (
        <SallaComments
          key={commentsKey}
          data-testid="store-page-comments"
          itemId={Number(page.id)}
          type={'page' as never}
          className="container"
        />
      )}
    </Fragment>
  );
}
