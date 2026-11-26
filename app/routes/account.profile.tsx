import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@salla.sa/twilight-theme-engine/routes/account';
import type { ProfilePageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ProfilePage } from '../components/account/ProfilePage';

/**
 * Theme-owned profile route: the engine's loader, head and skeleton, View's profile form
 * (`components/account/ProfilePage.tsx`) instead of the engine's `<salla-user-profile>` page.
 */
export const Route = createFileRoute('/{-$locale}/account/profile')({
  loader: ({ params }): Promise<ProfilePageProps> => Profile.loader({ locale: params.locale }),
  head: withHead(Profile),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: ProfileComponent,
});

function ProfileComponent() {
  const data: ProfilePageProps = Route.useLoaderData();
  // Twig's `customer-profile` body class: the engine's route-class map only names the legacy
  // `/profile` redirect. Scopes View's single-orders.scss, which Twig loads on this page.
  useDocumentClass({ body: { class: 'customer-profile' } });
  return <ProfilePage {...data} />;
}
