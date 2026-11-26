// Copied from the engine's `tailwind/routes/account/orders/single/OrderHeader.tsx` for the order-page
// fork (see OrderSinglePage.tsx); keep in step with it on engine upgrades.
import { useState } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { useDate, useNumber } from '@salla.sa/twilight-theme-engine/hooks';
import { isNativeApp } from '@salla.sa/twilight-theme-engine/native-app';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Order } from './types';

const PRINT_WINDOW = 'noopener, toolbar=yes, scrollbars=yes, resizable=yes, width=900, height=700';

/** Inside the Salla app the app prints `url` (`mobile::ui.print`); a browser opens a print window. */
function openPrint(url: string) {
  if (isNativeApp()) window.salla?.event.dispatch('mobile::ui.print', { url });
  else window.open(url, '_blank', PRINT_WINDOW);
}

function OrderStatus({ order, paymentExpired }: { order: Order; paymentExpired: boolean }) {
  const { t } = useTranslation();
  if (paymentExpired) {
    return <span className="text-red-500">{t('pages.orders.pending_payment_expired')}</span>;
  }
  return (
    <span
      className="text-primary inline-flex items-center rtl:space-x-reverse space-x-1"
      style={{ color: order.status.color }}
    >
      <i className={`mt-1 ${order.status.icon}`}></i>
      <span> {order.status.name}</span>
    </span>
  );
}

/** Twig's `order.print_url()`; `urls.receipt` is the buyer's bank-transfer image. */
function PrintAction({ order }: { order: Order }) {
  const { t } = useTranslation();
  const { store } = useTwilight();
  const [printNoticeOpen, setPrintNoticeOpen] = useState(false);
  const print = () =>
    openPrint(
      order.urls.print ??
        `${(store?.url ?? '').replace(/\/$/, '')}/account/orders/${order.id}/print`
    );

  return order.actions.invoice_printable === false ? (
    <div
      className={`tooltip-toggle tooltip-toggle--clickable inline-block${printNoticeOpen ? ' visible' : ''}`}
    >
      <button
        type="button"
        className="text-primary border border-primary rounded text-center px-4 py-2 cursor-pointer"
        onClick={() => setPrintNoticeOpen(true)}
      >
        <i className="sicon-printer2 v-align"></i> {t('pages.orders.print')}
      </button>
      <div className="tooltip-content shadow-md rounded text-mediumgray">
        <small>
          {' '}
          {t('pages.orders.to_order_invoice_contact_vendor')}
          <br />
          {t('pages.orders.print_order_details')}{' '}
          <button type="button" className="text-primary underline cursor-pointer" onClick={print}>
            {t('pages.orders.click_here')}
          </button>
        </small>
        <SallaButton
          shape="link"
          color="danger"
          size="small"
          className="close-tooltip"
          onClick={() => setPrintNoticeOpen(false)}
        >
          <i className="sicon-cancel"></i>
        </SallaButton>
      </div>
    </div>
  ) : (
    <SallaButton fill="outline" size="small" onClick={print}>
      <i className="sicon-printer2 v-align"></i> {t('pages.orders.print')}
    </SallaButton>
  );
}

/** The date / status / print row at the top of the order page (the links sit in the title row, as in Twig). */
export function OrderHeader({ order, paymentExpired }: { order: Order; paymentExpired: boolean }) {
  const { t } = useTranslation();
  const { format: formatDate } = useDate();
  const { format: formatNumber } = useNumber();
  const refundReceipt = order.urls.refund_receipt;

  return (
    <table className="min-w-full rounded-md overflow-hidden">
      <tbody>
        <tr className="bg-primary-reverse border border-lightgray overflow-hidden flex md:table-row flex-row md:flex-row flex-wrap md:flex-no-wrap py-1.5 md:py-0">
          <td
            data-testid="store-order-status"
            className="single-order-header-item w-full md:w-auto  px-3 md:px-6 py-2 md:py-4 md:h-20 whitespace-nowrap text-sm "
          >
            <div className="rtl:ml-2 ltr:mr-2 font-normal text-mediumgray">
              {t('pages.orders.date')}
            </div>
            <b>{formatNumber(formatDate(order.created_at.date))}</b>
          </td>

          <td className="single-order-header-item flex justify-between items-center w-full md:w-auto px-3 md:px-6 py-2 md:py-4 md:h-20 whitespace-nowrap text-sm ">
            <OrderStatus order={order} paymentExpired={paymentExpired} />

            <div className="flex items-center">
              {order.type === 'quote' && (
                <span className="text-red-500 ms-4">
                  {t('pages.orders.your_order_is_under_review')}
                </span>
              )}

              <PrintAction order={order} />
              {refundReceipt && (
                <SallaButton
                  className="ms-2"
                  fill="outline"
                  size="small"
                  onClick={() => openPrint(refundReceipt)}
                >
                  <i className="sicon-printer2 v-align"></i>{' '}
                  {t('pages.orders.print_refund_receipt')}
                </SallaButton>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
