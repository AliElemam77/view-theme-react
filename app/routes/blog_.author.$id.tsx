import { createFileRoute } from '@tanstack/react-router';
import { BlogAuthorRoute } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogAuthorLoaderData } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BlogListPage } from '../components/blog/BlogListPage';

/** Theme-owned blog author: Twig renders it with `pages/blog/index.twig`. */
export const Route = createFileRoute('/{-$locale}/blog/author/$id')({
  loader: ({ params }): Promise<BlogAuthorLoaderData> =>
    BlogAuthorRoute.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(BlogAuthorRoute),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogAuthorRouteComponent,
});

function BlogAuthorRouteComponent() {
  const { page, categories, articles, cursor }: BlogAuthorLoaderData = Route.useLoaderData();
  return (
    <BlogListPage
      page={page}
      categories={categories}
      articles={articles}
      cursor={cursor}
      filter={{ author: String(page.id) }}
      hook="blog:author"
    />
  );
}
