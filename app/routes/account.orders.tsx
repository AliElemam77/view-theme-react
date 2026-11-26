import { createFileRoute } from '@tanstack/react-router';
import { Orders } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import type { OrdersPageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';

/**
 * Theme-owned orders route, otherwise the engine's: it only adds Twig's body class (below).
 */
export const Route = createFileRoute('/{-$locale}/account/orders')({
  validateSearch: (search: Record<string, unknown>) => {
    const status = (search.status as string) || undefined;
    return status ? { status } : {};
  },
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps, params }): Promise<OrdersPageProps> =>
    Orders.loader({ search: { status: deps.status }, locale: params.locale }),
  head: withHead(Orders),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: OrdersComponent,
});

function OrdersComponent() {
  const data: OrdersPageProps = Route.useLoaderData();
  // Twig's `customer-orders-index` body class: the engine's route-class map only names the
  // legacy `/orders` redirect. Scopes View's single-orders.scss, which Twig loads on this page.
  useDocumentClass({ body: { class: 'customer-orders-index' } });
  return <Orders.Component {...data} />;
}
