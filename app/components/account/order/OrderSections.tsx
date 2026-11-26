// Copied from the engine's `tailwind/routes/account/orders/single/OrderSections.tsx` for the order-page
// fork (see OrderSinglePage.tsx); keep in step with it on engine upgrades.
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useQuery } from '@tanstack/react-query';
import { order as orderApi } from '@salla.sa/twilight-theme-engine/api/order';
import { Reservations } from './OrderItemRow';
import type { FormatMoney, Order, TwigOrder, TwigRating } from './types';

function RatingAction({
  disabled,
  endedKey,
  color,
  fill,
  icon,
  onClick,
}: {
  disabled: boolean;
  endedKey: string;
  color: 'dark' | 'danger';
  fill: 'outline';
  icon: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="tooltip-toggle tooltip-toggle--hover icon-trigger mobile-shifted">
      {disabled && (
        <div className="tooltip-content shadow-md rounded">
          <small> {t(endedKey)}.</small>
        </div>
      )}
      <SallaButton
        loaderPosition="center"
        disabled={disabled}
        shape="icon"
        fill={fill}
        color={color}
        size="medium"
        onClick={disabled ? undefined : onClick}
      >
        <i className={`${icon} text-xl`}></i>
      </SallaButton>
    </div>
  );
}

/** A store or shipping rating the customer left, with its edit / delete buttons. */
export function RatingSection({
  title,
  rating,
  type,
  allowUpdate,
}: {
  title: string;
  rating: TwigRating;
  type: 'store' | 'shipping';
  allowUpdate: boolean;
}) {
  const dispatch = (event: string, payload: Record<string, unknown>) =>
    window.salla?.event?.dispatch(event, payload);
  const locked = !rating.can_update;

  return (
    <section className="flex justify-between items-start bg-primary-reverse border border-lightgray p-5 rounded-md">
      <div>
        <h2 className="text-lg font-bold mb-5">{title}</h2>
        <p className="mb-2">{rating.content}</p>
        <SallaRatingStars withLabel value={rating.stars} />
      </div>
      <div className="rating-actions">
        {allowUpdate && (
          <>
            <RatingAction
              disabled={locked}
              endedKey="pages.order.edit_period_ended"
              color="dark"
              fill="outline"
              icon="sicon-format-border-color"
              onClick={() => dispatch('rating::edit', { type, feedback_id: String(rating.id) })}
            />
            <RatingAction
              disabled={locked}
              endedKey="pages.order.delete_period_ended"
              color="danger"
              fill="outline"
              icon="sicon-trash-2"
              onClick={() => dispatch('rating::delete', { feedback_id: String(rating.id) })}
            />
          </>
        )}
      </div>
    </section>
  );
}

interface Shipment {
  id?: number;
  name?: string;
  logo?: string;
  number?: string;
  tracking?: string | null;
}

function ShippingRow({ shipment }: { shipment: Shipment }) {
  const { t } = useTranslation();
  // Twig treats the string "0" as empty.
  const hasNumber = !!shipment.number && shipment.number !== '0';

  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center bg-primary-reverse px-5 py-3 border-b border-lightgray rounded-t-md text-sm space-y-4 md:space-y-0">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        {shipment.logo && (
          <img src={shipment.logo} className="max-w-16 max-h-8" alt={shipment.name} />
        )}
        <span>{shipment.name}</span>
      </div>
      <div className="flex space-x-5 rtl:space-x-reverse">
        {hasNumber && (
          <span>
            {t('pages.orders.shipment_no')}: <span className="font-bold">{shipment.number}</span>
          </span>
        )}
        {shipment.tracking && (
          <a
            className="font-bold text-primary hover:opacity-80 flex items-center"
            href={shipment.tracking}
            target="_blank"
            rel="noreferrer"
          >
            <span className="sicon-shipping rtl:ml-1 ltr:mr-1"></span>
            {t('pages.orders.tracking_url')}
          </a>
        )}
      </div>
    </div>
  );
}

/**
 * The shipping company rows above the items (Twig's per-package titles). The order carries only
 * its first shipment, so the rest come from the shipments endpoint.
 */
export function ShippingHeader({ twig, order }: { twig: TwigOrder; order: Order }) {
  const { data } = useQuery({
    ...orderApi.queries.shipments(String(order.id)),
    enabled: order.features.shippable && !twig.is_pickable,
  });
  if (twig.is_pickable) return null;

  const shipments: Shipment[] = data?.length
    ? data.map((shipment) => ({ ...shipment, tracking: shipment.tracking_url }))
    : twig.shipping
      ? [{ ...twig.shipping, tracking: twig.shipping.tracing_link }]
      : [];

  return (
    <>
      {shipments.map((shipment) => (
        <ShippingRow key={shipment.id ?? shipment.name} shipment={shipment} />
      ))}
    </>
  );
}

/** An option's price as a number: the API sends a number, `{ amount }` or an empty array. */
const optionPrice = (price: unknown): number =>
  typeof price === 'number' ? price : ((price as { amount?: number } | null)?.amount ?? 0);

/** The order-level options table (`order.options`), with Twig's reservations partial for booking options. */
export function OrderOptionsTable({
  options,
  money,
  currency,
}: {
  options: NonNullable<TwigOrder['options']>;
  money: FormatMoney;
  currency: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-primary-reverse border border-lightgray p-5 rounded-md">
      <h2 className="mb-3.5 text-sm font-bold">{t('pages.cart.cart_options')}</h2>
      <table className="table-fixed w-full border border-lightgray">
        <thead>
          <tr className="border-b border-lightgray">
            <th scope="col" className="p-3 text-start text-sm">
              {t('pages.order.option_name')}
            </th>
            <th scope="col" className="p-3 text-sm">
              {t('pages.order.option_content')}
            </th>
            <th scope="col" className="p-3 rtl:text-left ltr:text-right text-sm">
              {t('pages.products.price')}
            </th>
          </tr>
        </thead>
        <tbody>
          {options.flatMap((option) =>
            (option.options ?? []).map((value) => (
              <tr
                key={`${value.name}:${value.value}`}
                className="border-b last:border-b-0 border-lightgray"
              >
                <td className="text-sm p-3">{value.name} :</td>
                <td className="text-center p-3 font-medium text-xs">
                  {value.reservations?.length ? (
                    <Reservations reservations={value.reservations} />
                  ) : (
                    value.value
                  )}
                </td>
                <td className="rtl:text-start ltr:text-end p-3 font-medium text-xs">
                  <strong>{money(optionPrice(value.price), currency)}</strong>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
