import { createFileRoute } from '@tanstack/react-router';
import { Loyalty } from '@salla.sa/twilight-theme-engine/routes/loyalty';
import type { LoyaltyPageProps } from '@salla.sa/twilight-theme-engine/routes/loyalty';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { LoyaltyPage } from '../components/pages/LoyaltyPage';

/** Theme-owned: the engine loader, View's `pages/loyalty.twig` layout (`LoyaltyPage`). */
export const Route = createFileRoute('/{-$locale}/loyalty')({
  loader: ({ params }): Promise<LoyaltyPageProps> => Loyalty.loader({ locale: params.locale }),
  head: withHead(Loyalty),
  component: LoyaltyComponent,
});

function LoyaltyComponent() {
  const data: LoyaltyPageProps = Route.useLoaderData();
  return <LoyaltyPage {...data} />;
}
