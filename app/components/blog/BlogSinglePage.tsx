import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot, useDate } from '@salla.sa/twilight-theme-engine/hooks';
import { useBlogLike } from '@salla.sa/twilight-theme-engine/hooks/useBlogLike';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { BlogSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BreadcrumbNav } from './BreadcrumbNav';

const PLACEHOLDER = '/images/placeholder.webp';
/** Twig's `has_image`: an image that is not the store placeholder. */
const hasImage = (url?: string): url is string => Boolean(url) && !/placeholder/i.test(url as string);

/**
 * Port of `pages/blog/single.twig`: the article card (title, date/author row,
 * image, like button, body, tags, comments) beside the related-articles sidebar.
 * The like button is the engine's `useBlogLike` (blog.js `initToggleLike`):
 * `#blog-like` gets `liked`, and the icon turns into a small loader while it saves.
 */
export function BlogSinglePage({ page, article, related = [] }: BlogSinglePageProps) {
  const { t } = useTranslation();
  const store = useStore();
  const { format: formatDate } = useDate();
  const { active, count, toggle, loading } = useBlogLike(
    Number(article.id) || 0,
    article.stats?.likes ?? 0
  );
  const { commentsKey } = useComments();
  const allowLikes = Boolean(store?.settings?.blog?.allow_likes_and_comments);
  const comments = article.stats?.comments ?? 0;

  return (
    <div key={article.id} className="container mb-8 sm:mb-24">
      {/* add breadcumbs container in pages to make a space in case breadcrumbs is off */}
      <BreadcrumbNav page={page} className="breadcrumbs w-full py-5 center-between" />
      <div className="md:flex items-start">
        <div className="main-content blog-category md:w-96 flex-1 bg-white lg:p-8 rounded-md mb-10 md:mb-0">
          <HookSlot name="blog:single.start" />
          <h1 className="font-bold text-3xl mb-5 leading-10">{article.name}</h1>
          <div className="mb-10 text-mediumgray rounded-md inline-flex text-sm rtl:space-x-reverse space-x-5">
            <div className=" flex items-center">
              <i className="sicon-calendar-date rtl:ml-1 ltr:mr-1"></i>
              <span className="">{formatDate(article.created_at)}</span>
            </div>
            <Link to={article.author?.url || '#'} className=" flex items-center hover:text-dark">
              <i className="sicon-user rtl:ml-1 ltr:mr-1"></i>
              <span className="">{article.author?.name}</span>
            </Link>
          </div>
          {hasImage(article.image) && (
            <img
              src={article.image}
              alt={article.name}
              title={article.name}
              className="h-80 mb-10 w-full object-cover rounded-md lazy"
              width={1280}
              height={320}
              // Twig lazy-loads it; it is the page's largest image, so load it first.
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          )}

          {allowLikes && (
            <div className="flex items-center gap-2.5 text-mediumgray text-base mb-2">
              <button
                type="button"
                id="blog-like"
                data-blog-id={article.id}
                className={`flex items-center gap-1${active ? ' liked' : ''}`}
                onClick={toggle}
                disabled={loading}
              >
                {loading ? (
                  <span className="loader loader--small"></span>
                ) : (
                  <i className="sicon-thumbs-up text-primary"></i>
                )}
                <span>{count}</span>
              </button>
              {comments > 0 && (
                <div className="flex items-center gap-1">
                  <i className="sicon-chat text-primary"></i>
                  {comments}
                </div>
              )}
            </div>
          )}

          <article
            className="leading-7 text-sm mb-10"
            dangerouslySetInnerHTML={{ __html: article.description?.replace(/&nbsp;/g, ' ') || '' }}
          />
          {article.tags && article.tags.length > 0 && (
            <div className="p-4 flex flex-wrap items-center border-t border-gray-200">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={tag.url}
                  className="py-2 px-4 rounded-large inline-flex items-center text-mediumgray hover:text-dark justify-center text-sm"
                >
                  <i className="font-medium sicon-tag rtl:ml-1.5 ltr:mr-1.5"></i>
                  <span className="fix-align whitespace-nowrap">{tag.name}</span>
                </Link>
              ))}
            </div>
          )}
          {allowLikes && (
            <SallaComments
              key={commentsKey}
              data-testid="store-blog-comments"
              itemId={Number(article.id) || 0}
              type={'blog' as never}
            />
          )}
          <HookSlot name="blog:single.end" />
        </div>

        <aside
          aria-label="Sidebar"
          className="sticky shrink-0 top-24 md:w-96 rtl:lg:mr-8 ltr:lg:ml-8 pb-11"
        >
          {related.length > 0 && (
            <>
              <h2 className="font-bold mb-3">{t('pages.blog_articles.related')}</h2>

              <HookSlot name="blog:single.items.start" />

              {related.map((item) => (
                <div key={item.id} className="mt-5 flex items-center bg-white dark:bg-primary-reverse carbon:bg-primary-reverse border border-transparent dark:border-lightgray carbon:border-lightgray p-5 rounded-md">
                  <div className="shrink-0">
                    <Link
                      to={item.url}
                      className="bg-border-color h-24 w-24 rounded-md overflow-hidden flex items-center justify-center"
                    >
                      <span className="sr-only">{item.name}</span>
                      {hasImage(item.image) ? (
                        <img
                          className="h-full w-full object-cover lazy"
                          src={item.image}
                          alt={item.name || 'article-image'}
                          width={1280}
                          height={720}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="auto"
                        />
                      ) : (
                        <img
                          className="sm:h-full w-10 object-contain opacity-60 lazy"
                          src={PLACEHOLDER}
                          alt="post image"
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          fetchPriority="auto"
                        />
                      )}
                    </Link>
                  </div>
                  <div className="rtl:mr-3 ltr:ml-3">
                    <div className="flex items-center text-sm text-mediumgray mb-2">
                      <i className="sicon-calendar-date rtl:ml-1 ltr:mr-1 rtl:pl-px ltr:pr-px"></i>
                      <time>{formatDate(item.created_at)}</time>
                    </div>

                    <h3 className="text-sm font-bold text-darkgray leading-6">
                      <Link to={item.url} className="hover:underline">
                        {item.name}
                      </Link>
                    </h3>
                  </div>
                </div>
              ))}

              <HookSlot name="blog:single.items.end" />
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
