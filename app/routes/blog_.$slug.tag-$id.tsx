import { createFileRoute } from '@tanstack/react-router';
import { BlogTagRoute } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogTagLoaderData } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BlogListPage } from '../components/blog/BlogListPage';

/** Theme-owned blog tag: Twig renders it with `pages/blog/index.twig`. */
export const Route = createFileRoute('/{-$locale}/blog/$slug/tag-{$id}')({
  loader: ({ params }): Promise<BlogTagLoaderData> =>
    BlogTagRoute.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogTagRoute),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogTagRouteComponent,
});

function BlogTagRouteComponent() {
  const { page, categories, articles, cursor, blogTag }: BlogTagLoaderData = Route.useLoaderData();
  return (
    <BlogListPage
      page={page}
      categories={categories}
      articles={articles}
      cursor={cursor}
      filter={{ tag: String(blogTag.id) }}
      hook="blog:tag"
    />
  );
}
