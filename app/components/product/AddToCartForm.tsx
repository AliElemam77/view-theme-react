import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaCountDown } from '@salla.sa/twilight-components-react/count-down';
import { SallaMetadata } from '@salla.sa/twilight-components-react/metadata';
import { SallaFileUpload } from '@salla.sa/twilight-components-react/file-upload';
import { SallaGifting } from '@salla.sa/twilight-components-react/gifting';
import { SallaMultipleBundleProduct } from '@salla.sa/twilight-components-react/multiple-bundle-product';
// Use the eager (non-deferred) Core export: product options are an essential form
// control, and the deferred wrapper's visibility-triggered hydration races with the
// gallery's image layout shift and gets stuck on the skeleton, so options never appear.
import { SallaProductOptionsCore as SallaProductOptions } from '@salla.sa/twilight-components-react/product-options';
import { SallaProductSizeGuide } from '@salla.sa/twilight-components-react/product-size-guide';
import { SallaQuantityInput } from '@salla.sa/twilight-components-react/quantity-input';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { hapticImpact } from '@salla.sa/twilight-theme-engine/native-app';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { booleanValue, optionValue } from '../../lib/fieldValue';
import { CollapsePanel } from '../common/CollapsePanel';
import { PriceBit, usePriceFailed } from './ProductDetails';

/** The web component's `type="submit"` path skips its own loader, so drive the
    inner `<salla-button>` spinner by hand. */
type LoadableButton = HTMLElement & { load?: () => void; stop?: () => void };
const addButton = (form: HTMLFormElement | null): LoadableButton | null =>
  // Scoped to the add button: options render their own `salla-button`s (the map's
  // "pick location") earlier in the form, and the spinner would land on those.
  (form?.querySelector('salla-add-product-button salla-button') as LoadableButton | null) ?? null;

type ProductOptionsElement = HTMLElement & { validateAndScroll?: () => Promise<boolean> };

interface AddToCartFormProps {
  product: Product;
  stickyAddToCart?: boolean;
  giftingIntro?: string;
  formStartSlot?: ReactNode;
  formEndSlot?: ReactNode;
}

/** True when the click came from the buy-now widget (`<salla-mini-checkout-widget>`,
 *  a shadow-DOM element — hence `composedPath`, not `closest`). */
const isQuickBuyClick = (e: { nativeEvent: Event }) =>
  e.nativeEvent
    .composedPath()
    .some((node) => (node as HTMLElement).localName === 'salla-mini-checkout-widget');

// Forms whose buy-now widget was just clicked. The widget lives inside the product form and
// its click must never add the product to the cart, so the one submit that click can cause
// (it runs in the same task, right after the click) is dropped. The flag is cleared as soon
// as it has done that, or when the task ends — a later, deliberate add-to-cart press is
// never swallowed.
const quickBuyPending = new WeakSet<HTMLFormElement>();

const handleQuickBuyClick = (e: React.MouseEvent<HTMLFormElement>) => {
  if (!isQuickBuyClick(e)) return;
  const form = e.currentTarget;
  quickBuyPending.add(form);
  window.setTimeout(() => quickBuyPending.delete(form), 0);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (quickBuyPending.delete(e.currentTarget)) return;
  hapticImpact('medium');
  const btn = addButton(e.currentTarget);
  btn?.load?.();
  // Safety net: the cart events clear it on a real response; this covers a
  // silent validation bail (`salla.form.onSubmit` returns `false` either way).
  window.setTimeout(() => btn?.stop?.(), 8000);
  window.salla?.form.onSubmit('cart.addItem', e);
};

const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
  const form = e.currentTarget;
  // Not reportValidity(): it focuses and scrolls to the first empty required option mid-edit.
  const isComplete = Array.from(form.elements).every(
    (el) => !(el as HTMLInputElement).willValidate || (el as HTMLInputElement).validity.valid
  );
  if (isComplete) {
    window.salla?.product?.getPrice(new FormData(form));
    return;
  }
  // A new quantity can't be priced yet: show the empty options, like the add-to-cart button.
  if ((e.target as Element).closest?.('salla-quantity-input')) {
    void form.querySelector<ProductOptionsElement>('salla-product-options')?.validateAndScroll?.();
  }
};

/** The size-guide row of `partials/product/options.twig`. Twig gates the weight
 * row on a `whight` flag the page never passes, so only the size guide shows. */
function SizeGuideSection({ product }: { product: Product }) {
  const { t } = useTranslation();
  if (!product.has_size_guide) return null;
  return (
    <section className="">
      <div className="center-between">
        <b className="form-label rtl:space-x-reverse space-x-1">
          <i className="sicon-pencil-ruler"></i>
          <span>{t('pages.products.size_guides')}</span>
        </b>
        <SallaButton
          shape="link"
          color="primary"
          className="!p-0 text-sm with-arrow"
          onClick={() => window.salla?.event?.dispatch('size-guide::open', String(product.id))}
        >
          {t('pages.products.show_size_guides')}
          <i className="sicon-keyboard_arrow_left"></i>
        </SallaButton>
      </div>
      <SallaProductSizeGuide />
    </section>
  );
}

/** The attachments section of `partials/product/options.twig`. */
function AttachmentsSection({ product }: { product: Product }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!product.can_add_note && !product.can_upload_file) return null;
  const noteId = `note_${product.id}`;
  const fileId = `file_${product.id}`;
  const toggle = (id: string) => setOpen((current) => ({ ...current, [id]: !current[id] }));

  return (
    <section>
      <div className="flex flex-col sm:items-start sm:mb-3 mb-1.5">
        <label className="form-label">
          <b className="block">{t('pages.products.attachments')}</b>
        </label>
        <div className="mt-1 sm:mt-0 w-full text-end">
          <div className="flex rtl:space-x-reverse space-x-3">
            {product.can_add_note && (
              <button
                data-testid="store-product-add-note"
                className={`btn--collapse transition ${open[noteId] ? 'is-opened' : 'is-closed'}`}
                type="button"
                aria-expanded={!!open[noteId]}
                aria-controls={noteId}
                onClick={() => toggle(noteId)}
              >
                <span className="flex items-center gap-1 text-sm font-bold">
                  <i className="sicon-chat-conversation-alt text-beige-500 text-base text-primary"></i>
                  {t('pages.products.add_note')}
                </span>
                <i className="sicon-send-down text-primary text-2xl"></i>
              </button>
            )}
            {product.can_upload_file && (
              <button
                data-testid="store-product-attach-file"
                className={`btn--collapse transition ${open[fileId] ? 'is-opened' : 'is-closed'}`}
                type="button"
                aria-expanded={!!open[fileId]}
                aria-controls={fileId}
                onClick={() => toggle(fileId)}
              >
                <span className="flex items-center gap-1 text-sm font-bold">
                  <i className="sicon-paperclip text-beige-500 text-base text-primary"></i>
                  {t('pages.products.add_file')}
                </span>
                <i className="sicon-send-down text-primary text-2xl"></i>
              </button>
            )}
          </div>
          {product.can_add_note && (
            <CollapsePanel id={noteId} open={!!open[noteId]}>
              <div className="pt-4">
                <textarea
                  className="animated animatedfadeInDown fadeInDown form-input h-16 bg-gray-50 block rounded-theme"
                  placeholder={t('pages.products.notes_placeholder')}
                  name="notes"
                  cols={30}
                  rows={10}
                  defaultValue={product.notes}
                ></textarea>
              </div>
            </CollapsePanel>
          )}
          {product.can_upload_file && (
            <CollapsePanel id={fileId} open={!!open[fileId]}>
              <div className="pt-4 px-1">
                <SallaFileUpload
                  accept="image/png, image/jpeg, image/jpg, image/gif, video/*, application/pdf"
                  className="product-option-uploader"
                >
                  <div className="product-option-uploader-placholder">
                    <span className="product-option-uploader-placholder-icon">
                      <i className="sicon-camera"></i>
                    </span>
                    <p className="profile-filepond-placholder-text">{t('common.uploader.drag_and_drop')}</p>
                    <span className="filepond--label-action">{t('common.uploader.browse')}</span>
                  </div>
                </SallaFileUpload>
              </div>
            </CollapsePanel>
          )}
        </div>
      </div>
    </section>
  );
}

/** `ProductCard.DEFAULT__ICON`, used by the `def` cart icon. */
function DefaultCartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="31" height="34" viewBox="0 0 31 34" fill="none">
      <path
        d="M14.3177 30.7024H8.09314C6.957 30.7023 5.85841 30.2956 4.99615 29.5558C4.1339 28.816 3.56495 27.7919 3.39226 26.669L1.40251 13.7443C1.33301 13.2924 1.36206 12.8309 1.48765 12.3913C1.61325 11.9517 1.83242 11.5444 2.13015 11.1975C2.42787 10.8505 2.7971 10.572 3.21253 10.3811C3.62796 10.1902 4.07976 10.0914 4.53696 10.0914H22.5145C22.9717 10.0914 23.4235 10.1902 23.8389 10.3811C24.2543 10.572 24.6236 10.8505 24.9213 11.1975C25.219 11.5444 25.4382 11.9517 25.5638 12.3913C25.6894 12.8309 25.7184 13.2924 25.6489 13.7443L25.232 16.4523M19.8668 27.5315H29.3795M24.6231 22.7751V32.2879"
        stroke="white"
        strokeWidth="2.57355"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.76849 14.8461V6.91885C8.76849 5.65738 9.26961 4.44758 10.1616 3.55559C11.0536 2.66359 12.2634 2.16248 13.5249 2.16248C14.7863 2.16248 15.9961 2.66359 16.8881 3.55559C17.7801 4.44758 18.2812 5.65738 18.2812 6.91885V14.8461"
        stroke="white"
        strokeWidth="2.57355"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Port of `pages/templates/base_content.twig` (`form_base`, `product_card_pic: main`):
 * the metadata, then the form — options (`partials/product/options.twig`: single and
 * multiple options as buttons by default), the quantity and final-price grid, the
 * add-to-cart button with the store's cart icon (`btn-text-one/two` hover swap) and
 * gifting. Submit / buy-now / option pricing behave as before (`handleSubmit`,
 * `handleChange`, `handleQuickBuyClick`).
 */
export function AddToCartForm({
  product,
  stickyAddToCart,
  giftingIntro,
  formStartSlot,
  formEndSlot,
}: AddToCartFormProps) {
  const { t } = useTranslation();
  const { theme, store } = useTwilight();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  const formRef = useRef<HTMLFormElement>(null);
  const priceFailed = usePriceFailed();

  // Stop the add-to-cart spinner once the cart request resolves (either way).
  // Unsubscribe through the same `cart` reference `on*` used.
  useEffect(() => {
    const stop = () => addButton(formRef.current)?.stop?.();
    const cart = window.salla?.cart?.event;
    cart?.onItemAdded?.(stop);
    cart?.onItemAddedFailed?.(stop);
    return () => {
      cart?.offItemAdded?.(stop);
      cart?.offItemAddedFailed?.(stop);
    };
  }, []);

  // stable ref: an inline arrow re-runs on every render and resets the user's selection
  const optionsRef = useCallback(
    (el: { setOptionsData?: (data: never[]) => void } | null) =>
      void el?.setOptionsData?.(product.options as never[]),
    [product.options]
  );

  // salla-product-options reads its `options` prop only in its constructor, and on
  // first load that runs before sdk.init has set page.id: seed it and wait for the SDK.
  const [optionsReady, setOptionsReady] = useState(false);
  useEffect(() => {
    const salla = window.salla;
    if (!salla) return;
    let alive = true;
    salla.config?.set?.('page.id', product.id);
    Promise.resolve(salla.onReady?.()).finally(() => {
      if (alive) setOptionsReady(true);
    });
    return () => {
      alive = false;
    };
  }, [product.id]);

  // The form reads `name` / `max` from the host's attributes, not the wrapper's properties.
  const maxQuantity = product.max_quantity;
  const quantityRef = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      el.setAttribute('name', 'quantity');
      if (maxQuantity) el.setAttribute('max', String(maxQuantity));
      else el.removeAttribute('max');
    },
    [maxQuantity]
  );

  const addButtonRef = useCallback((el: HTMLElement | null) => {
    el?.setAttribute('width', 'wide');
    el?.setAttribute('type', 'submit');
    el?.setAttribute('loader-position', 'end');
  }, []);

  const quickBuy = product.can_quick_buy ?? !!store?.settings?.buy_now;
  const hasPreorder = Boolean(product.has_preorder_campaign && product.preorder);
  const config: Record<string, { type: string }> = {};
  if (booleanValue(settings.show_singleOption, true)) config['single-option'] = { type: 'button' };
  if (booleanValue(settings.show_multipleOption, true)) config['multiple-option'] = { type: 'button' };
  const cartIcon = optionValue(settings.product_cart_icon) || 'sicon-cart2';
  const icon = cartIcon === 'def' ? <DefaultCartIcon /> : <i className={cartIcon}></i>;
  const label =
    (product as { add_to_cart_label?: string }).add_to_cart_label ||
    (product.status === 'sale' ? t('pages.cart.add_to_cart') : t('pages.products.out_of_stock'));
  const notify = product.notify_availability;

  return (
    <>
      {product.has_metadata && <SallaMetadata data-testid="store-product-metadata" />}
      <form
        ref={formRef}
        data-testid="store-product-form"
        className="form product-form"
        encType="multipart/form-data"
        method="post"
        onClickCapture={handleQuickBuyClick}
        onSubmit={handleSubmit}
        onChange={handleChange}
      >
        <input type="hidden" name="id" value={product.id} />
        {formStartSlot}
        {optionsReady && product.options && product.options.length > 0 && (
          <SallaProductOptions
            key={product.id}
            ref={optionsRef}
            data-testid="store-product-options"
            options={JSON.stringify(product.options)}
            productId={product.id}
            config={JSON.stringify(config)}
            className="twig_option"
          />
        )}
        {product.has_bundle_products && <SallaMultipleBundleProduct bundleSections={JSON.stringify(product)} />}
        <SizeGuideSection product={product} />
        <AttachmentsSection product={product} />
        {formEndSlot}
        {hasPreorder ? (
          <section className="mt-5">
            <SallaCountDown preOrder={JSON.stringify(product.preorder)} boxed labeled />
          </section>
        ) : null}
        <section className="flex-col flex">
          <div className="grid grid-cols-2 gap-3">
            {product.is_hidden_quantity || product.type === 'booking' ? (
              <input type="hidden" value="1" name="quantity" aria-label="Quantity" />
            ) : (
              <div className="sticky-product-bar__quantity flex-col flex">
                <label className="form-label">{t('pages.products.quantity')}</label>
                <SallaQuantityInput
                  ref={quantityRef}
                  data-testid="store-product-quantity"
                  max={product.max_quantity}
                  value={1}
                  name="quantity"
                  aria-label="Quantity"
                  className="w-full"
                />
              </div>
            )}
            <div className="flex flex-col">
              <label className="form-label">
                <b className="block">
                  {t('pages.products.price')}
                  <span className="ms-1">{t('pages.cart.final_total')}</span>
                </b>
              </label>
              {!priceFailed && <PriceBit product={product} total />}
              <div
                data-testid="store-product-out-of-stock"
                className={`out-of-stock min-h-7 leading-7 text-base text-red-600 !opacity-50 font-bold${priceFailed ? '' : ' hidden'}`}
              >
                {t('pages.products.out_of_stock')}
              </div>
            </div>
          </div>
          <SallaAddProductButton
            ref={addButtonRef}
            data-testid="store-product-add-to-cart"
            {...(quickBuy ? { quickBuy: true } : {})}
            {...(stickyAddToCart !== false ? { supportStickyBar: true } : {})}
            {...(product.is_require_shipping ? { requiredShipping: true } : {})}
            {...(hasPreorder ? { hasPreOrder: true } : {})}
            amount={
              typeof product.base_currency_price === 'object'
                ? product.base_currency_price.amount
                : product.base_currency_price
            }
            className="sm:mt-3 mt-1.5 w-full sticky-product-bar__btn"
            productStatus={product.status}
            productType={product.type}
            productId={product.id}
            {...(notify
              ? {
                  ...(notify.subscribed ? { isSubscribed: true } : {}),
                  channels: (notify.channels ?? []).join(','),
                  subscribedOptions: JSON.stringify(notify.subscribed_options ?? []),
                  ...(notify.options ? { notifyOptionsAvailability: true } : {}),
                }
              : {})}
          >
            <span className="btn-text-one flex-center gap-1.5">
              {icon}
              {label}
            </span>
            <span className="btn-text-two flex-center gap-1.5">
              {icon}
              {label}
            </span>
          </SallaAddProductButton>
        </section>
        {product.giftable && (
          <SallaGifting
            className="mt-5"
            widgetSubtitle={giftingIntro}
            productId={product.id}
            {...(product.is_require_shipping ? { physicalProducts: true } : {})}
          />
        )}
      </form>
    </>
  );
}
