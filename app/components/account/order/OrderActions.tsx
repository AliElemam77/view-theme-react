// Copied from the engine's `tailwind/routes/account/orders/single/OrderActions.tsx` for the order-page
// fork (see OrderSinglePage.tsx); keep in step with it on engine upgrades.
import { useState } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaModal } from '@salla.sa/twilight-components-react/modal';
import { useIsClient, useUser } from '@salla.sa/twilight-theme-engine/hooks';
import { useAsyncFn } from '@salla.sa/twilight-theme-engine/hooks/useAsyncFn';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useLocation, useNavigate } from '@salla.sa/twilight-theme-engine/providers';
import type { Order } from './types';

function ConfirmModal({
  visible,
  onVisibleChange,
  title,
  subTitle,
  iconStyle,
  confirmColor,
  onConfirm,
  busy,
}: {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  title: string;
  subTitle: string;
  iconStyle: 'success' | 'error';
  confirmColor?: 'danger';
  onConfirm: () => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  // The modal wrapper renders only in the browser, so mount after hydration to match the server.
  const isClient = useIsClient();
  if (!isClient) return null;
  return (
    <SallaModal
      width="sm"
      visible={visible}
      onModalVisibilityChanged={(e) => onVisibleChange(Boolean(e.detail))}
      {...{ 'modal-title': title }}
      subTitle={subTitle}
      iconStyle={iconStyle}
    >
      <div slot="footer" className="grid grid-cols-2 gap-3">
        <SallaButton
          width="wide"
          color={confirmColor}
          className="w-full cursor-pointer"
          onClick={onConfirm}
          disabled={busy}
        >
          {t('common.elements.ok')}
        </SallaButton>
        <SallaButton
          className="w-full"
          fill="outline"
          color="light"
          onClick={() => onVisibleChange(false)}
          disabled={busy}
        >
          {t('common.elements.cancel')}
        </SallaButton>
      </div>
    </SallaModal>
  );
}

function PaymentOrReorder({
  order,
  paymentExpired,
  canReorder,
  onReorder,
  busy,
}: {
  order: Order;
  paymentExpired: boolean;
  canReorder: boolean;
  onReorder: () => void;
  busy: boolean;
}) {
  const { t } = useTranslation();
  if (order.actions.payable) {
    return paymentExpired || !order.urls.checkout ? (
      <span className="text-red-500">{t('pages.orders.pending_payment_expired')}</span>
    ) : (
      <SallaButton width="wide" href={order.urls.checkout}>
        <i className="sicon sicon-wallet rtl:ml-2 ltr:mr-2"></i>
        <span>{t('pages.orders.finish_payment')}</span>
      </SallaButton>
    );
  }
  if (!canReorder) return null;
  return (
    <>
      <div className="text-sm">
        <h3 className="font-bold text-lg leading-none mb-1">{t('pages.orders.reorder')}</h3>
        <p className="text-mediumgray">{t('pages.orders.reorder_description')}</p>
      </div>
      <SallaButton
        data-testid="store-order-reorder-btn"
        shape="link"
        onClick={onReorder}
        disabled={busy}
      >
        <i className="sicon sicon-rotate rtl:ml-2 ltr:mr-2"></i>
        <span>{t('pages.orders.reorder')}</span>
      </SallaButton>
    </>
  );
}

/** The "Reorder & Cancel" card, its pending-payment state and the two confirmations. */
export function OrderActions({ order, paymentExpired }: { order: Order; paymentExpired: boolean }) {
  const { t } = useTranslation();
  // Token-based, so the server and the first client render agree (the user query loads later).
  const { isLoggedIn } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [showReorder, setShowReorder] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const { reorderable, cancellable, payable } = order.actions;
  const canReorder = isLoggedIn && reorderable;

  const [reorderState, handleReorder] = useAsyncFn(async () => {
    await window.salla?.order.createCartFromOrder(Number(order.id));
    setShowReorder(false);
    navigate('/cart');
  }, [navigate, order.id]);

  const [cancelState, handleCancel] = useAsyncFn(async () => {
    await window.salla?.order.cancel(Number(order.id));
    setShowCancel(false);
    navigate(location.pathname, { replace: true });
  }, [navigate, order.id, location.pathname]);

  if (!reorderable && !cancellable && !payable) return null;

  return (
    <>
      <div className="bg-primary-reverse border border-lightgray rounded-md p-5 divide-y divide-border-color space-y-4">
        {(reorderable || payable) && (
          <div className={payable ? 'flex-center' : 'center-between'}>
            <PaymentOrReorder
              order={order}
              paymentExpired={paymentExpired}
              canReorder={!!canReorder}
              onReorder={() => setShowReorder(true)}
              busy={reorderState.loading}
            />
          </div>
        )}

        {cancellable && (
          <div className="center-between pt-4">
            <div className="text-sm">
              <h3 className="font-bold text-lg leading-none mb-1">{t('pages.orders.cancel')}</h3>
              <p className="text-mediumgray">{t('pages.order.order_cancelation_desc')}</p>
            </div>
            <SallaButton
              data-testid="store-order-cancel-btn"
              shape="link"
              color="danger"
              onClick={() => setShowCancel(true)}
              disabled={cancelState.loading}
            >
              <i className="sicon sicon-cancel-circle rtl:ml-2 ltr:mr-2"></i>
              <span>{t('pages.orders.cancel')}</span>
            </SallaButton>
          </div>
        )}
      </div>

      {/* Always mounted: salla-modal moves itself under <body> and opens from `visible`. */}
      {canReorder && (
        <ConfirmModal
          visible={showReorder}
          onVisibleChange={setShowReorder}
          title={t('pages.orders.reorder')}
          subTitle={t('pages.orders.reorder_confirmation')}
          iconStyle="success"
          onConfirm={handleReorder}
          busy={reorderState.loading}
        />
      )}
      {cancellable && (
        <ConfirmModal
          visible={showCancel}
          onVisibleChange={setShowCancel}
          title={t('common.elements.warning')}
          subTitle={t('pages.orders.cancel_confirmation')}
          iconStyle="error"
          confirmColor="danger"
          onConfirm={handleCancel}
          busy={cancelState.loading}
        />
      )}
    </>
  );
}
