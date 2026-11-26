import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SallaConditionalOffer } from '@salla.sa/twilight-components-react/conditional-offer';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaCartCoupons } from '@salla.sa/twilight-components-react/cart-coupons';
import { SallaCartSummaryCard } from '@salla.sa/twilight-components-react/cart-summary-card';
import { SallaLoyaltyPanel } from '@salla.sa/twilight-components-react/loyalty-panel';
import { SallaGifting } from '@salla.sa/twilight-components-react/gifting';
import { SallaTieredOffer } from '@salla.sa/twilight-components-react/tiered-offer';
import { HookSlot, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { SeoCartWidget } from '@salla.sa/twilight-theme-engine/cart';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { CartSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { stripUnsafeHtml } from '@salla.sa/twilight-theme-engine/utils';
import { loyalty } from '@salla.sa/twilight-theme-engine/api/loyalty';
import { cart } from '@salla.sa/twilight-theme-engine/api/cart';
import type { Cart, Money } from '@salla.sa/twilight-theme-engine/types';
import type { CartPageProps } from '@salla.sa/twilight-theme-engine/routes/cart';
import { BreadcrumbNav } from '../blog/BreadcrumbNav';
import { booleanValue } from '../../lib/fieldValue';
import { CartItem } from './CartItem';
import { CartRelatedProducts } from './CartRelatedProducts';

/** Whether a failed request was answered 404 (the engine's API client throws ky's `HTTPError`). */
function isNotFound(error: unknown): boolean {
  return (error as { response?: { status?: number } } | null)?.response?.status === 404;
}

function toAmount(value: number | Money | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return typeof value === 'number' ? value : value.amount;
}

const html = (text: string) => ({ __html: stripUnsafeHtml(text) });

/** `cart.twig` `#free-shipping`: the message (`|raw`) with the remaining amount as money. */
function FreeShipping({ bar }: { bar: NonNullable<Cart['free_shipping_bar']> }) {
  const { t, isRTL } = useTranslation();
  const { format } = useMoney();
  const isFree = !!bar.has_free_shipping;
  const flip = isRTL ? 'flip-x' : '';
  // `format` gives a node, so the message is split around `:amount`.
  const [before, ...rest] = String(t('pages.cart.free_shipping_alert')).split(':amount');
  const after = rest.join(':amount');

  return (
    <div className="shadow-default p-4 rounded-theme mb-5 relative" id="free-shipping">
      <div className="flex rtl:space-x-reverse space-x-3 items-center">
        <i className={`bg-primary text-white rounded-icon sicon-shipping-fast ${flip}`}></i>
        <div className="flex-1">
          <h4 className="shipping-item font-bold text-sm mb-1.5 text-darkgray">
            {t('pages.cart.free_shipping')}
          </h4>
          <p className="shipping-item text-sm font- text-mediumgray ">
            {isFree ? (
              <span id="free-shipping-msg" dangerouslySetInnerHTML={html(String(t('pages.cart.has_free_shipping')))} />
            ) : (
              <span id="free-shipping-msg">
                <span dangerouslySetInnerHTML={html(before)} />
                {rest.length > 0 && format(toAmount(bar.remaining as number | Money))}
                <span dangerouslySetInnerHTML={html(after)} />
              </span>
            )}{' '}
            <span className={`emoji ${isFree ? '' : 'hidden'}`} id="free-shipping-applied">
              🎉
            </span>
          </p>
        </div>
      </div>
      <div className={`mt-8 bg-border-color rounded-full ${isFree ? ' hidden' : ''}`} id="free-shipping-bar">
        <div
          className="progress-bg transition-all duration-200 h-2.5 bg-primary relative rounded-full flex justify-end"
          style={{ width: `${bar.percent}%` }}
        >
          <i className={`inline-block sicon-shipping-fast absolute -top-5 rtl:left-0 ltr:right-0 ${flip}`}></i>
        </div>
      </div>
    </div>
  );
}

/**
 * Port of `pages/cart.twig`.
 *
 * Items are the {@link CartItem} fork; the sidebar is Twig's: "Other customers' favorites"
 * ({@link CartRelatedProducts}), free shipping, `<salla-loyalty-panel>`, gifting,
 * `<salla-cart-coupons>`, `<salla-cart-summary-card>` (totals + checkout) and the tiered
 * offer. React-only: an error state with a retry when the cart can't be loaded (the engine
 * keeps its skeleton up for good), and a cart the API no longer knows (404) is dropped
 * from the SDK and shown empty. Upgrade notes: `FORKS.md`.
 */
function CartPageContent({ page }: CartPageProps) {
  const { store, theme } = useTwilight();
  const { t } = useTranslation();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  // `partials/product/options.twig`: single / multiple options as buttons.
  const optionsConfig: Record<string, { type: string }> = {};
  if (booleanValue(settings.show_singleOption, true)) optionsConfig['single-option'] = { type: 'button' };
  if (booleanValue(settings.show_multipleOption, true)) optionsConfig['multiple-option'] = { type: 'button' };
  const queryClient = useQueryClient();
  // Tells the SDK this is the cart page on a direct load, so `<salla-product-options>`
  // pre-checks each item's selected option.
  usePageConfig(page);
  const { data: loyaltyPoints } = useQuery(loyalty.queries.points());

  const cartIdQuery = useQuery(cart.queries.currentId());
  const cartId = cartIdQuery.data;

  const cartQuery = useQuery({
    ...cart.queries.detail(cartId!),
    enabled: !!cartId,
  });
  const cartData = cartQuery.data;

  // Refetch after a row changes or is deleted: the SDK doesn't push cart changes back
  // into React, so item totals would otherwise stay stale (Twig's cart.js redraws them).
  const refetchCart = useCallback(() => {
    if (cartId != null) {
      queryClient.invalidateQueries({ queryKey: cart.queries.detail(cartId).queryKey });
    }
  }, [cartId, queryClient]);

  // Also refetch on any SDK cart update (coupons, gifting, offers).
  // Root on/off: onUpdated registers a wrapper that only offUpdated can remove.
  useEffect(() => {
    window.salla?.event?.on?.('cart::updated', refetchCart);
    return () => {
      window.salla?.event?.off?.('cart::updated', refetchCart);
    };
  }, [refetchCart]);

  // The SDK's cart id names a cart the API no longer has (`cart/<id>` answered 404).
  const cartGone = isNotFound(cartQuery.error);

  // Drop that cart from the SDK (its stored id and cookies), so the next add to
  // cart starts a new one instead of failing against the old id.
  useEffect(() => {
    if (!cartGone) return;
    // `reset` is on the SDK's cart, but not in the engine's `SallaCart` type.
    (window.salla?.cart as { reset?: () => void } | undefined)?.reset?.();
  }, [cartGone]);

  // A failed request leaves its data undefined, so without this the skeleton
  // stayed up for good (e.g. `cart/<id>` answering an error).
  const failed = cartIdQuery.isError || (cartQuery.isError && !cartGone);
  // The SDK knew of no cart, or the API no longer has it.
  const noCart = (cartIdQuery.isSuccess && cartId == null) || cartGone;

  if (failed) {
    return (
      <div className="container">
        <BreadcrumbNav page={page} className="breadcrumbs w-full py-5" />
        <div className="no-content-placeholder">
          <i className="sicon-shopping-bag icon"></i>
          <p>{t('common.errors.error_occurred', 'Something went wrong')}</p>
          <button
            type="button"
            className="btn btn--outline-primary btn--rounded-full"
            onClick={() => {
              if (cartIdQuery.isError) cartIdQuery.refetch();
              else cartQuery.refetch();
            }}
          >
            {t('common.elements.try_again', 'Try again')}
          </button>
        </div>
      </div>
    );
  }

  if (!noCart && (cartId == null || cartData === undefined)) {
    return <CartSkeleton />;
  }

  const items = (!noCart && cartData?.items) || [];
  const options = (!noCart && cartData?.options) || [];
  const loyaltyData = cartData?.loyalty;
  const gift = cartData?.gift;
  const showLoyalty = !!loyaltyData && !!(loyaltyPoints || loyaltyData.prize?.points);
  const productIds = items.map((item) => item.product_id);

  return (
    <div className="container">
      {/* Analytics — no visible UI, fires GTM checkout events */}
      {cartData && !noCart && <SeoCartWidget cart={cartData} />}

      <BreadcrumbNav page={page} className="breadcrumbs w-full py-5" />
      <h1 className="sr-only">{t('blocks.header.cart')}</h1>
      <SallaConditionalOffer data-testid="store-cart-conditional-offer" />

      <HookSlot name="cart:start" />

      <div className="pt-5 flex flex-col items-start lg:flex-row pb-6 lg:pb-20">
        <div className="main-content flex-1 w-full">
          <HookSlot name="cart:items.start" context={{ cartItems: items }} />

          {items.length > 0 ? (
            items.map((item, index) => (
              <CartItem
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                onMutated={refetchCart}
              />
            ))
          ) : (
            <div data-testid="store-cart-empty" className="no-content-placeholder">
              <i className="sicon-shopping-bag icon"></i>
              <p>{t('pages.cart.empty_cart')}</p>
              <Link data-testid="store-cart-back-home" to="/" className="btn btn--outline-primary btn--rounded-full">
                {t('common.elements.back_home')}
              </Link>
            </div>
          )}

          {options.length > 0 && (
            <div className="cart-options">
              {options.map((option) => (
                <form
                  key={option.id}
                  className="first:pt-5 relative"
                  onChange={(e) => window.salla?.form.onChange('cart.updateItem', e)}
                  id={`item-${option.id}`}
                >
                  <input type="hidden" name="id" value={option.id} />
                  <input type="hidden" name="quantity" value={option.quantity} />
                  {option.options && option.options.length > 0 && (
                    // Raw element, like CartItem: the wrapper sets `options` too late and it renders empty.
                    <salla-product-options
                      key={JSON.stringify(option.options)}
                      data-testid="store-product-options"
                      options={JSON.stringify(option.options)}
                      product-id={option.id}
                      {...({ config: JSON.stringify(optionsConfig) } as Record<string, string>)}
                      className="twig_option"
                    />
                  )}
                </form>
              ))}
            </div>
          )}

          <SallaOffer data-testid="store-cart-offer" />
          <HookSlot name="cart:items.end" />
        </div>

        <HookSlot name="cart:summary.start" />
        {items.length > 0 && cartData && (
          <div className="sticky top-24 w-full lg:w-96 rtl:lg:mr-6 ltr:lg:ml-8">
            <CartRelatedProducts
              key={[...productIds].sort((a, b) => a - b).join(',')}
              productIds={productIds}
              onAdded={refetchCart}
            />

            {cartData.free_shipping_bar && <FreeShipping bar={cartData.free_shipping_bar} />}

            {/* `salla-loyalty-panel` renders the points widget, or the reset tile once a prize
                has been exchanged — guard on both so the card is never empty. */}
            {showLoyalty && (
              <div className="shadow-default mb-5 rounded-theme p-3 xs:p-7 bg-primaryops">
                <SallaLoyaltyPanel
                  data-testid="store-cart-loyalty"
                  customerPoints={loyaltyPoints ?? undefined}
                  prizePoints={loyaltyData?.prize?.points != null ? String(loyaltyData.prize.points) : undefined}
                  prizeTitle={loyaltyData?.prize?.title}
                />
              </div>
            )}

            <div id="cart-gifting" className="shadow-default bg-primaryops xs:p-2 rounded-theme mb-5 relative">
              <SallaGifting
                data-testid="store-cart-gifting"
                id="salla-gifting"
                className="mt-5"
                widgetTitle={t('pages.cart.gift_widget_title')}
                widgetSubtitle={gift?.text}
                {...(gift?.type ? { [`${gift.type}Products`]: true } : {})}
                vertical
              />
            </div>

            {store?.settings?.cart?.apply_coupon_enabled && (
              <div className="shadow-default p-4 rounded-theme mb-5 relative">
                <HookSlot name="cart:coupon.start" />
                <SallaCartCoupons data-testid="store-cart-coupons" />
                <HookSlot name="cart:coupon.end" />
              </div>
            )}

            <HookSlot name="cart:summary-card.start" />
            <SallaCartSummaryCard data-testid="store-cart-summary" />
            <HookSlot name="cart:summary-card.end" />
            <HookSlot name="cart:summary.end" />

            <SallaTieredOffer data-testid="store-cart-tiered-offer" />
          </div>
        )}
      </div>

      <HookSlot name="cart:end" />
    </div>
  );
}

export function CartPage(props: CartPageProps) {
  return <CartPageContent {...props} />;
}
