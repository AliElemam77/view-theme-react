import { createFileRoute } from '@tanstack/react-router';
import { OrderSingle } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import type { OrderSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { OrderSinglePage } from '../components/account/order/OrderSinglePage';

/**
 * Theme-owned order route: the engine's loader, head and skeleton, and the theme fork of its
 * order page (`components/account/order/OrderSinglePage.tsx`, View's `single.twig`).
 */
export const Route = createFileRoute('/{-$locale}/account/orders/$id')({
  loader: ({ params }): Promise<OrderSinglePageProps> =>
    OrderSingle.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(OrderSingle),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: OrderSingleComponent,
});

function OrderSingleComponent() {
  const data: OrderSinglePageProps = Route.useLoaderData();
  // Twig's `customer-orders-single` body class: the engine's route-class map only names the
  // legacy `/order/$id` redirect. Scopes View's single-orders.scss, which Twig loads here.
  useDocumentClass({ body: { class: 'customer-orders-single' } });
  // A param-only navigation (order to order) reuses the component: remount per order.
  return <OrderSinglePage key={data.order.id} {...data} />;
}
