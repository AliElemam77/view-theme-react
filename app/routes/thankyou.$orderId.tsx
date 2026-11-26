import { createFileRoute } from '@tanstack/react-router';
import { ThankYou } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import type { ThankYouPageProps } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ThankYouPage } from '../components/pages/ThankYouPage';

/** Theme-owned: the engine loader, View's `pages/thank-you.twig` layout (`ThankYouPage`). */
export const Route = createFileRoute('/{-$locale}/thankyou/$orderId')({
  loader: ({ params }): Promise<ThankYouPageProps> =>
    ThankYou.loader({ params: { orderId: params.orderId }, locale: params.locale }),
  head: withHead(ThankYou),
  component: ThankYouComponent,
});

function ThankYouComponent() {
  const data: ThankYouPageProps = Route.useLoaderData();
  return <ThankYouPage {...data} />;
}
