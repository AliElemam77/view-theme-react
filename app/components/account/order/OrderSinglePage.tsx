import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaRatingModal } from '@salla.sa/twilight-components-react/rating-modal';
import { SallaEditOrderButton } from '@salla.sa/twilight-components-react/edit-order-button';
import { SallaOrderBranch } from '@salla.sa/twilight-components-react/order-branch';
import { SallaOrderTotalsCard } from '@salla.sa/twilight-components-react/order-totals-card';
import { HookSlot, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { OrderSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import { OrderHeader } from './OrderHeader';
import { OrderItemRow } from './OrderItemRow';
import { OrderActions } from './OrderActions';
import { OrderOptionsTable, RatingSection, ShippingHeader } from './OrderSections';
import type { TwigOrder } from './types';

/**
 * Twig's `block inner_title` (`pages/customer/orders/single.twig`): the centred page title with
 * the inline gift tag, the edit-order button and the order links. It stands in for the layout's
 * own <h1>, which `.main-content:has(.order-title-row) > h1` (user-pages.scss) hides.
 */
function TitleRow({
  order,
  title,
  links,
}: {
  order: OrderSinglePageProps['order'];
  title?: string;
  links: TwigOrder['links'];
}) {
  const { t, direction } = useTranslation();
  const isGift = order.type === 'buy_as_gift' || order.source?.type === 'buy_as_gift';
  return (
    <div className="order-title-row flex justify-between items-center mb-2">
      <h1 className="font-bold text-lg text-center flex-1">
        {title}
        {isGift && (
          <span className="inline-block text-primary mx-2">
            <i className="sicon-gift-sharing"></i>&nbsp;{t('pages.orders.gift_tag')}
          </span>
        )}
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        <SallaEditOrderButton data-testid="store-order-edit-btn" orderId={String(order.id)} />
      </div>
      {!!links?.length && (
        <div className="flex space-x-2 rtl:space-x-reverse text-start flex-none px-2">
          {links.map((link) => (
            <a key={link.url} href={link.url} className="text-primary" target="_blank" rel="noreferrer">
              {link.label}{' '}
              <i className={direction === 'rtl' ? 'sicon-arrow-up-left' : 'sicon-arrow-up-right'}></i>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function RefundMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="min-w-full rounded-md overflow-hidden">
      <div className="bg-primary-reverse border border-lightgray flex items-center gap-1 rounded-md px-3 py-5 md:px-5">
        <i className="sicon-refund h-6 w-6"></i>
        <p className="font-medium text-base" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  );
}

function RatingNotices({ twig }: { twig: TwigOrder }) {
  const { t } = useTranslation();
  const { store } = useTwilight();
  const settings = store?.settings?.rating;
  const rated = !!twig.rating && !Array.isArray(twig.rating);

  return (
    <>
      {settings?.allow_update && rated && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-500 px-2 py-3 rounded-md text-sm">
          <i className="sicon-info"></i>
          <p>
            {t('pages.order.can_edit_or_delete_your_review_within')} {settings.update_period}{' '}
            {t('pages.order.days_since_added')}.
          </p>
        </div>
      )}
      {twig.can_rate && (
        <div className="rating-header gradient-bg center-between">
          <div>
            <h2 className="font-bold mb-1">{t('pages.order.order_rating_title')}</h2>
            <p className="text-sm">{t('pages.order.order_rating_message')}</p>
          </div>
          <SallaButton
            data-testid="store-order-rate-btn"
            color="light"
            className="btn--rounded-full !text-primary"
            onClick={() => window.salla?.event?.dispatch('rating::open')}
          >
            {t('pages.rating.rate')}
          </SallaButton>
        </div>
      )}
    </>
  );
}

function OrderRatings({ twig }: { twig: TwigOrder }) {
  const { t } = useTranslation();
  const { store } = useTwilight();
  const allowUpdate = !!store?.settings?.rating?.allow_update;
  const rating = Array.isArray(twig.rating) ? undefined : twig.rating;

  return (
    <>
      {rating?.store?.stars ? (
        <RatingSection
          title={t('pages.rating.rate_the_store')}
          rating={rating.store}
          type="store"
          allowUpdate={allowUpdate}
        />
      ) : null}
      {rating?.shipping?.stars ? (
        <RatingSection
          title={t('pages.rating.rate_shipping')}
          rating={rating.shipping}
          type="shipping"
          allowUpdate={allowUpdate}
        />
      ) : null}
    </>
  );
}

/**
 * Theme fork of the engine `OrderSinglePage` (rendered by `app/routes/account.orders.$id.tsx`),
 * moved to View's `pages/customer/orders/single.twig`: Twig's title row (`TitleRow`), the order
 * links as plain `text-primary` links there instead of buttons in the header, and the
 * reservations partial in the order options table.
 * The markup and the Twilight components read the order in Twig's shape (`componentsOrder`);
 * `order` supplies what that shape lacks and Twig computed on the server: the actions and the
 * receipt and payment URLs.
 */
export function OrderSinglePage({ order, page, componentsOrder }: OrderSinglePageProps) {
  // The order components read the order id from `salla.config.page.id`, which the router
  // only sets on client-side navigations — seed it so a direct load works too.
  usePageConfig(page);
  const { store } = useTwilight();
  const { format } = useMoney();
  const twig = (componentsOrder ?? { items: [] }) as unknown as TwigOrder;
  const paymentExpired =
    order.actions.payable && (order.payment?.pending_payment_ends_at ?? 0) === 0;
  const money = (amount: number, currency?: string) => format(amount, { currency });

  return (
    <>
      <TitleRow order={order} title={page.title} links={twig.links} />
      <div className="space-y-4">
        <HookSlot name="customer:orders.single.details.start" />

        <OrderHeader order={order} paymentExpired={paymentExpired} />

        {twig.is_pickable && <SallaOrderBranch data-testid="store-order-branch" stackCards />}

        <RefundMessage message={order.refund_message} />

        <RatingNotices twig={twig} />

        <div className="overflow-hidden space-y-5">
          <div className="shipping-orders">
            <ShippingHeader twig={twig} order={order} />
            {order.items.map((item, index) => (
              <OrderItemRow
                key={item.id}
                item={item}
                twigItem={twig.items[index]}
                money={money}
                currency={order.currency}
              />
            ))}
          </div>

          {!!twig.options?.length && (
            <OrderOptionsTable options={twig.options} money={money} currency={order.currency} />
          )}
        </div>

        {componentsOrder && (
          <SallaOrderTotalsCard
            data-testid="store-order-totals"
            order={JSON.stringify(componentsOrder)}
          />
        )}

        <OrderActions order={order} paymentExpired={paymentExpired} />

        <OrderRatings twig={twig} />

        <HookSlot name="customer:orders.single.details.end" />

        {(twig.can_rate || store?.settings?.rating?.allow_update) && (
          <SallaRatingModal data-testid="store-order-rating-modal" />
        )}
      </div>
    </>
  );
}
