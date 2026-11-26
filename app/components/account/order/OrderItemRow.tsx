// Copied from the engine's `tailwind/routes/account/orders/single/OrderItemRow.tsx` for the order-page
// fork (see OrderSinglePage.tsx); keep in step with it on engine upgrades.
import { createElement } from 'react';
import { SallaOrderDetails } from '@salla.sa/twilight-components-react/order-details';
import { useDate, useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { FormatMoney, OrderItem, TwigItem } from './types';

function ItemAttachments({ item }: { item: OrderItem }) {
  const { t } = useTranslation();
  if (!item.attachments?.length) return null;
  return (
    <div className="flow-root rounded-md px-4 border border-lightgray">
      <dl className="text-sm text-dark divide-y divide-border-color">
        {item.attachments.map((attachment) => (
          <div
            key={`${attachment.type}:${attachment.url}`}
            className="py-3.5 md:flex items-center justify-between"
          >
            <dt className="mb-2 md:mb-0">{t('pages.products.attachments')}</dt>
            <dd
              className={`font-medium ${attachment.type === 'image' ? 'text-darkgray' : 'text-xs'}`}
            >
              {attachment.type === 'image' ? (
                <div className="flex rtl:space-x-reverse space-x-2.5">
                  <a href={attachment.url} target="_blank" rel="noreferrer">
                    <img
                      className="h-7 w-7 object-cover rounded-md"
                      src={attachment.url}
                      alt={item.name}
                    />
                  </a>
                </div>
              ) : (
                <a href={attachment.url}>{t('pages.orders.file_url')}</a>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** A date-only day (`2026-09-20`) as that calendar day wherever it is formatted, not UTC midnight. */
function calendarDay(day: unknown): Date | string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day));
  return match ? new Date(+match[1], +match[2] - 1, +match[3]) : String(day);
}

/** A reservation as Twig's `pages/partials/product/reservations.twig` reads it. */
export interface Reservation {
  day?: unknown;
  from?: unknown;
  to?: unknown;
  from_timestamp?: unknown;
}

/** Twig's `pages/partials/product/reservations.twig`: each reservation's day and time. */
export function Reservations({ reservations }: { reservations: Reservation[] }) {
  const { format: formatDate } = useDate();
  const { format: formatNumber, useArabicNumerals } = useNumber();
  const time = (value: unknown) =>
    useArabicNumerals
      ? formatNumber(String(value)).replace(/PM/g, 'م').replace(/AM/g, 'ص')
      : String(value);

  return (
    <ul className="font-medium text-xs text-mediumgray">
      {reservations.map((reservation) => (
        <li key={`${String(reservation.day)}:${String(reservation.from)}`} className="py-1">
          <span className="text-unicode">
            {formatNumber(formatDate(calendarDay(reservation.day)))}
            {reservation.from_timestamp
              ? ` (${time(reservation.from)} - ${time(reservation.to)})`
              : ''}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Twig's booking block: the location, then the reservations partial. */
function ItemReservations({ item, productType }: { item: OrderItem; productType?: string }) {
  const { t } = useTranslation();
  const reservations = item.product_reservations ?? [];
  if (productType !== 'booking' || !reservations.length) return null;

  return (
    <>
      {item.booking_location && (
        <ul className="font-medium text-xs text-mediumgray">
          <li className="py-1 flex justify-between items-baseline">
            <span className="mt-5 mb-3.5 text-sm font-bold">{t('common.elements.location')}</span>
            <span className="text-unicode">{item.booking_location}</span>
          </li>
        </ul>
      )}
      <h2 className="mt-5 mb-3.5 text-sm font-bold">
        {reservations.length > 1 ? t('pages.cart.reservations') : t('pages.cart.item_options')}
      </h2>
      <div className="rounded-md p-4 border border-lightgray mb-2">
        <Reservations reservations={reservations} />
      </div>
    </>
  );
}

function ItemSummary({
  item,
  twigItem,
  money,
  currency,
}: {
  item: OrderItem;
  twigItem?: TwigItem;
  money: FormatMoney;
  currency: string;
}) {
  const { t } = useTranslation();
  const product = twigItem?.product;
  const image = product?.image?.url || item.image || item.thumbnail;
  const price = item.amounts.amount ?? { amount: 0, currency };
  const priceText = money(price.amount, price.currency);
  const total = item.amounts.total ?? { amount: 0, currency };

  return (
    <div className="mb-5 last:mb-0">
      {product ? (
        <div className="flex rtl:space-x-reverse space-x-5 mb-4">
          <a href={product.url} className="shrink-0">
            <img
              src={image || '/images/placeholder.png'}
              alt={item.name}
              className={`w-18 h-14 object-${image ? 'cover' : 'contain'} rounded-md`}
            />
          </a>
          <div>
            <a
              href={product.url}
              className="block leading-5 mb-1.5 md:text-base font-semibold transition-colors text-mediumgray hover:text-primary"
            >
              {item.name}
            </a>
            <b>{priceText}</b>
          </div>
        </div>
      ) : (
        <div className="w-full  flex  justify-between text-sm py-2.5">
          <span className="w-40 inline-block font-normal">{item.name}</span>
          <b>{priceText}</b>
        </div>
      )}

      <div className="w-full flex justify-between text-sm py-2.5">
        <span className="w-40 inline-block font-normal">{t('pages.products.quantity')}</span>
        <b>{item.quantity}</b>
      </div>
      <div className="flex justify-between text-sm py-2.5">
        <span className=" w-40 inline-block font-normal">{t('pages.products.price')}</span>
        <b>{priceText}</b>
      </div>
      <div className="flex justify-between  text-sm py-2.5">
        <span className="w-40 inline-block font-normal">{t('pages.orders.total')}</span>
        <b>{money(total.amount, total.currency)}</b>
      </div>
    </div>
  );
}

/** One item of the order page (the body of `{% for item in package.items %}`). */
export function OrderItemRow({
  item,
  twigItem,
  money,
  currency,
}: {
  item: OrderItem;
  twigItem?: TwigItem;
  money: FormatMoney;
  currency: string;
}) {
  const { t } = useTranslation();
  const productId = twigItem?.product?.id;

  return (
    <div
      data-testid={`store-order-item-${item.id}`}
      data-order-item-id={item.id}
      data-order-item-product-id={productId}
      className="order-item bg-primary-reverse p-5 border-b border-lightgray first:rounded-t-md last:rounded-b-md last:border-none"
    >
      <ItemSummary item={item} twigItem={twigItem} money={money} currency={currency} />

      {item.availability_date && (
        <div className="flex gap-2 text-sm py-2.5 text-blue-500">
          <i className="sicon-info"></i>
          <span>
            {t('pages.products.expected_to_be')}:{' '}
            <b>{String(item.availability_date).slice(0, 10)}</b>
          </span>
        </div>
      )}

      <ItemReservations item={item} productType={twigItem?.product?.type ?? item.product?.type} />

      <SallaOrderDetails orderDetails={JSON.stringify(twigItem ?? item)} />

      {item.note && (
        <p className="mt-3 text-sm text-mediumgray">
          <span>{t('common.elements.note')} : </span>
          {item.note}
        </p>
      )}

      <ItemAttachments item={item} />

      {/* No React wrapper yet; Twilight upgrades it (adds `hydrated`) before React hydrates. */}
      {productId &&
        createElement('salla-review-order-item', {
          'product-id': productId,
          suppressHydrationWarning: true,
        })}
    </div>
  );
}
