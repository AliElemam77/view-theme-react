import { createFileRoute } from '@tanstack/react-router';
import { notFound, orThrow } from '@salla.sa/twilight-theme-engine/providers';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import type { HeadDescriptor } from '@salla.sa/twilight-theme-engine/utils/head';
import { LandingPage } from '../components/pages/LandingPage';
import {
  fetchLanding,
  fetchLandingProducts,
  type Landing,
  type LandingProductsPage,
} from '../lib/landingPage';

interface LandingLoaderData {
  /** `page.slug` is what Twig's `is_page('landing-page')` and the SDK's `page.slug` read. */
  page: { slug: 'landing-page'; id: number | string; title: string };
  landing: Landing;
  products: LandingProductsPage;
}

/**
 * A Salla landing ("special offer") page: `/{locale}/landing/{id}`, the path the
 * engine's `redirect/book_now/{id}` route also sends to. Declared in `app/routes.ts`.
 */
export const Route = createFileRoute('/{-$locale}/landing/$id')({
  loader: async ({ params }): Promise<LandingLoaderData> => {
    // A 404/410 from the API renders `notFoundComponent`: Twig's `{% if not landing %}` state.
    const landing = await orThrow(fetchLanding(params.id));
    if (!landing) return notFound();

    // Expired offers show no products; a failed product list leaves the page up, as the
    // `<salla-products-list>` Twig renders fails on its own.
    const products = landing.is_expired
      ? { items: [], next: null }
      : await fetchLandingProducts(landing.id).catch(() => ({ items: [], next: null }));

    return {
      page: { slug: 'landing-page', id: landing.id, title: landing.title },
      landing,
      products,
    };
  },
  head: withHead({
    head: (_ctx, data: LandingLoaderData | undefined): HeadDescriptor => ({ title: data?.landing.title }),
  }),
  component: LandingPageRoute,
  notFoundComponent: () => <LandingPage landing={null} />,
});

function LandingPageRoute() {
  const { landing, products } = Route.useLoaderData();
  return <LandingPage key={landing.id} landing={landing} products={products} />;
}
