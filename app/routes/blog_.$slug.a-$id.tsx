import { createFileRoute } from '@tanstack/react-router';
import { BlogSingle } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { BlogSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/blog';
import { BlogSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { BlogSinglePage } from '../components/blog/BlogSinglePage';

/** Theme-owned blog article (`pages/blog/single.twig`). */
export const Route = createFileRoute('/{-$locale}/blog/$slug/a-{$id}')({
  loader: ({ params }): Promise<BlogSinglePageProps> =>
    BlogSingle.loader({ params: { slug: params.slug, id: params.id }, locale: params.locale }),
  head: withHead(BlogSingle),
  pendingComponent: () => <BlogSkeleton />,
  component: BlogSingleComponent,
});

function BlogSingleComponent() {
  const data: BlogSinglePageProps = Route.useLoaderData();
  return <BlogSinglePage {...data} />;
}
