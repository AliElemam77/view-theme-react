import { createFileRoute } from '@tanstack/react-router';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import { Blog } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BlogListPage, type BlogListPageProps } from '../components/blog/BlogListPage';

/**
 * Theme-owned blog index (`pages/blog/index.twig`). Twig pages its articles
 * (`<salla-infinite-scroll next-page="{{ articles.next_page }}">`), but the
 * engine's overview has no cursor, so the first page comes from
 * `blog/articles` too; the overview's articles stay the fallback.
 */
export const Route = createFileRoute('/{-$locale}/blog')({
  loader: async ({ params }): Promise<BlogListPageProps> => {
    const [data, list] = await Promise.all([
      Blog.loader({ locale: params.locale }),
      blog.articles.list().catch(() => null),
    ]);
    const paged = list && list.data.length > 0;
    return {
      page: data.page,
      categories: data.categories,
      slides: data.slides,
      articles: paged ? list.data : data.articles,
      cursor: paged ? list.cursor : null,
    };
  },
  head: withHead(Blog),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogComponent,
});

function BlogComponent() {
  const data = Route.useLoaderData();
  return <BlogListPage {...data} hook="blog" />;
}
