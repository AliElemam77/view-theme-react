import { createFileRoute } from '@tanstack/react-router';
import { BlogCategoryRoute } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogCategoryLoaderData } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BlogListPage } from '../components/blog/BlogListPage';

/** Theme-owned blog category: Twig renders it with `pages/blog/index.twig`. */
export const Route = createFileRoute('/{-$locale}/blog/$slug/c-{$id}')({
  loader: ({ params }): Promise<BlogCategoryLoaderData> =>
    BlogCategoryRoute.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogCategoryRoute),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogCategoryRouteComponent,
});

function BlogCategoryRouteComponent() {
  const { page, categories, articles, cursor, blogCategory }: BlogCategoryLoaderData = Route.useLoaderData();
  return (
    <BlogListPage
      page={page}
      categories={categories}
      articles={articles}
      cursor={cursor}
      filter={{ category: String(blogCategory.id) }}
      hook="blog:category"
    />
  );
}
