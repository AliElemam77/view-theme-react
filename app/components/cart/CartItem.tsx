import { useCallback, useEffect, useRef, useState } from 'react';
import type { Money, CartItem as CartItemType } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useHostAttributes } from '@salla.sa/twilight-theme-engine/hooks/useHostAttributes';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { SallaCartItemOffers } from '@salla.sa/twilight-components-react/cart-item-offers';
import { SallaFileUpload } from '@salla.sa/twilight-components-react/file-upload';
import { SallaMultipleBundleProduct } from '@salla.sa/twilight-components-react/multiple-bundle-product';
// Eager export: the deferred one wraps the host in a sizing <div>, so `flex-1` would land
// on the wrapper instead of the input, and it shows a skeleton until scrolled into view.
import { SallaQuantityInputCore as SallaQuantityInput } from '@salla.sa/twilight-components-react/quantity-input';
import { booleanValue } from '../../lib/fieldValue';
import { CollapsePanel } from '../common/CollapsePanel';

interface CartItemProps {
  item: CartItemType;
  isFirst?: boolean;
  /** Twig's `loop.last`: the last row has no bottom margin. */
  isLast?: boolean;
  /** Called after a successful update / delete so the page can refetch. */
  onMutated?: () => void;
}

/** Fields `partials/product/options.twig` reads that the engine's `CartItem` type leaves out. */
type CartItemExtras = {
  has_bundle_products?: boolean;
};

function toNumber(value: number | Money | undefined | null): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return value;
  return value.amount;
}

function moneyCurrency(value: number | Money | undefined | null): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value.currency;
}

function useMoneyOf() {
  const { format } = useMoney();
  return (value: number | Money | undefined | null) =>
    format(toNumber(value), { currency: moneyCurrency(value) });
}

/**
 * `partials/product/options.twig` included `with {product: item}`: the item's options,
 * bundle and attachments (note + file upload bound to the cart item). Twig's weight row
 * needs a `whight` flag the cart never passes, and cart items carry no size guide.
 */
function CartItemOptions({ item }: { item: CartItemType }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const extras = item as CartItemType & CartItemExtras;

  const config: Record<string, { type: string }> = {};
  if (booleanValue(settings.show_singleOption, true)) config['single-option'] = { type: 'button' };
  if (booleanValue(settings.show_multipleOption, true)) config['multiple-option'] = { type: 'button' };

  const noteId = `note_${item.id}`;
  const fileId = `file_${item.id}`;
  const toggle = (id: string) => setOpen((current) => ({ ...current, [id]: !current[id] }));

  return (
    <>
      {item.options && item.options.length > 0 && (
        // Raw element, not the React wrapper: the wrapper assigns `options` after the
        // element's constructor has run, so it falls back to fetching the product's default
        // options (nothing selected). As attributes they are set before connect. The element
        // parses `options` once, so key on the data to remount when it changes.
        <salla-product-options
          key={JSON.stringify(item.options)}
          data-testid="store-product-options"
          options={JSON.stringify(item.options)}
          // Twig passes `product.id`, and `product` is the cart item here.
          product-id={item.id as unknown as number}
          {...({ config: JSON.stringify(config) } as Record<string, string>)}
          className="twig_option"
        />
      )}

      {extras.has_bundle_products && (
        <SallaMultipleBundleProduct bundleSections={JSON.stringify(item)} />
      )}

      {(item.can_add_note || item.can_upload_file) && (
        <section>
          <div className="flex flex-col sm:items-start sm:mb-3 mb-1.5">
            <label className="form-label">
              <b className="block">{t('pages.products.attachments')}</b>
            </label>
            <div className="mt-1 sm:mt-0 w-full text-end">
              <div className="flex rtl:space-x-reverse space-x-3">
                {item.can_add_note && (
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
                {item.can_upload_file && (
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

              {item.can_add_note && (
                <CollapsePanel id={noteId} open={!!open[noteId]}>
                  <div className="pt-4">
                    <textarea
                      className="animated animatedfadeInDown fadeInDown form-input h-16 bg-gray-50 block rounded-theme"
                      placeholder={t('pages.products.notes_placeholder')}
                      name="notes"
                      cols={30}
                      rows={10}
                      defaultValue={item.notes}
                    ></textarea>
                  </div>
                </CollapsePanel>
              )}

              {item.can_upload_file && (
                <CollapsePanel id={fileId} open={!!open[fileId]}>
                  <div className="pt-4 px-1">
                    <SallaFileUpload
                      accept="image/png, image/jpeg, image/jpg, image/gif, video/*, application/pdf"
                      className="product-option-uploader"
                      files={JSON.stringify(item.attachments ?? [])}
                      cartItemId={String(item.id)}
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
      )}
    </>
  );
}

/** Donating rows have no control; hidden-quantity rows show a static number;
 * everything else gets `<salla-quantity-input>`. */
function CartItemQuantity({ item }: { item: CartItemType }) {
  // The inner input copies the host's attributes (the form reads `name` from it).
  const quantityRef = useHostAttributes({
    name: 'quantity',
    'cart-item-id': item.id,
    max: item.max_quantity || null,
  });

  if (item.type === 'donating') return <span></span>;

  if (item.is_hidden_quantity) {
    return (
      <>
        <input type="hidden" value={item.quantity} name="quantity" aria-label="Quantity" />
        <span className="w-10 text-center">{item.quantity}</span>
      </>
    );
  }

  return (
    <SallaQuantityInput
      ref={quantityRef}
      cartItemId={item.id}
      max={item.max_quantity ?? undefined}
      className="transtion transition-color duration-200 flex-1"
      aria-label="Quantity"
      value={item.quantity}
      name="quantity"
    />
  );
}

/**
 * Port of a `pages/cart.twig` item row (`form#item-{id}` > `section.cart-item`).
 *
 * Twig's `onchange="salla.form.onChange('cart.updateItem', event)"` is a native `change`
 * listener on the form (React's `onChange` would fire on every keystroke in the note):
 * a valid form posts the whole item to `salla.cart.updateItem`, then the page refetches.
 * Delete runs `salla.cart.deleteItem` and lets the page refetch (or drops the row).
 * Upgrade notes: `FORKS.md`.
 */
export function CartItem({ item, isFirst = false, isLast = false, onMutated }: CartItemProps) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const money = useMoneyOf();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  const hideOptions = booleanValue(settings.hide_options_in_cart, false);
  const [deleting, setDeleting] = useState(false);
  // Set once the item is deleted with no `onMutated` to refetch the cart.
  const [removed, setRemoved] = useState(false);
  // Set synchronously on delete, so a quantity change the web component fires a moment
  // later (it debounces) never posts an id that is already gone.
  const deletingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const onMutatedRef = useRef(onMutated);
  onMutatedRef.current = onMutated;

  const handleChange = useCallback(
    (event: Event) => {
      const form = event.currentTarget as HTMLFormElement;
      if (deletingRef.current) return;
      // `salla.form.onChange` bails on a form with an empty required field.
      if (!form.checkValidity()) return;
      Promise.resolve(window.salla?.cart.updateItem(new FormData(form)))
        .then(() => onMutatedRef.current?.())
        .catch(() => {
          // The SDK notifies the error; the summary card and totals stay as they were.
        });
    },
    []
  );

  useEffect(() => {
    const form = formRef.current;
    form?.addEventListener('change', handleChange);
    return () => form?.removeEventListener('change', handleChange);
  }, [handleChange]);

  const handleDelete = async () => {
    if (deletingRef.current) return;
    deletingRef.current = true;
    setDeleting(true);
    try {
      await window.salla?.cart.deleteItem(item.id);
      if (onMutated) onMutated();
      else setRemoved(true);
    } catch {
      deletingRef.current = false;
      setDeleting(false);
    }
  };

  if (removed) return null;

  const hasDetailedOffers = !!item.detailed_offers?.length;
  const isFreeProduct = toNumber(item.price) === 0 && !!item.has_discount;
  const total = hasDetailedOffers ? item.total_special_price : item.total;
  const imageClass =
    'flex-none w-20 h-20 border border-lightgray bg-primary-reverse rounded-theme object-center object-cover aspect-square';

  return (
    <form ref={formRef} id={`item-${item.id}`} className={isLast ? 'mb-0' : 'mb-4'}>
      <section
        data-testid={`store-cart-item-${item.id}`}
        className="cart-item p-3 rounded-theme relative border border-lightgray shadow-md block"
      >
        <input type="hidden" name="id" value={item.id} />
        <div
          className={`md:flex rtl:space-x-reverse md:space-x-3 items-center justify-between ${hideOptions ? '' : 'mb-4'}`}
        >
          <div className="flex flex-1 rtl:space-x-reverse space-x-3">
            <Link to={item.url} className="relative overflow-hidden shrink-0">
              <img
                src={item.product_image || undefined}
                alt={item.product_name}
                loading={isFirst ? 'eager' : 'lazy'}
                className={imageClass}
              />
              <div
                className={`free-ribbon absolute top-[11px] right-[-38px] w-32 bg-price text-white text-xs font-bold text-center py-1 rotate-45 shadow-md ${isFreeProduct ? '' : 'hidden'}`}
              >
                {t('pages.loyalty_program.free_product')}
              </div>
            </Link>
            <div className="flex flex-col justify-between xs:m-0 rtl:!ml-5 ltr:!mr-5">
              <h2 className="text-darkgray leading-6 text-base font-medium line-clamp-2">
                <Link to={item.url} className="text-base">
                  {item.product_name}
                </Link>
              </h2>
              <div>
                <span
                  className={`text-sm text-mediumgray  line-through item-regular-price ${item.offer ? '' : 'hidden'}`}
                >
                  {money(item.product_price)}
                </span>{' '}
                <span
                  className={`text-sm text-mediumgray  line-through item-original-price ${item.is_on_sale ? '' : 'hidden'}`}
                >
                  {money(item.original_price)}
                </span>{' '}
                <span
                  data-testid="store-cart-item-price"
                  className={`item-price ${item.has_discount ? 'text-price' : 'text-sm text-mediumgray '}`}
                >
                  {money(item.price)}
                </span>
              </div>
              <span className={`old-offers flex items-center gap-1 mx-1.5  ${hasDetailedOffers ? 'hidden' : ''}`}>
                <i className={`sicon-discount-calculator text-mediumgray  offer-icon ${item.offer ? '' : 'hidden'}`}></i>
                <span className={`text-sm text-mediumgray  offer-name ${item.offer ? '' : 'hidden'}`}>
                  {item.offer?.names}
                </span>
              </span>
              {hasDetailedOffers && (
                <SallaCartItemOffers
                  quantity={item.quantity}
                  itemId={String(item.id) as never}
                  productPrice={toNumber(item.product_price) ?? 0}
                  offers={JSON.stringify(item.detailed_offers)}
                />
              )}
            </div>
          </div>

          <div className="border-t border-b border-lightgray py-3 md:p-0 md:border-none mt-5 md:mt-0 flex md:gap-8 gap-3 justify-between items-center md:items-center flex-1 text-darkgray md:flex-nowrap flex-wrap">
            <p
              className={`text-sm text-mediumgray whitespace-nowrap item-weight-row ${item.weight_label ? '' : 'hidden'}`}
            >
              <strong>{t('pages.products.weight')}</strong> <span className="item-weight">{item.weight_label}</span>
            </p>
            <CartItemQuantity item={item} />
            <p className="text-primary flex-none font-bold text-sm rtl:md:pl-12 ltr:md:pr-12">
              <span>{t('pages.cart.total')}:</span>{' '}
              <span data-testid="store-cart-item-total" className="inline-block item-total">
                {item.is_available ? money(total) : t('pages.cart.out_of_stock')}
              </span>
            </p>
          </div>
        </div>

        <div className={hideOptions ? 'hidden' : ''}>
          <CartItemOptions item={item} />
        </div>

        <span className="absolute top-0 rtl:left-1.5 ltr:right-1.5 rtl:xs:left-5 ltr:xs:right-5 xs:top-5 block">
          <button
            data-testid="store-cart-delete-item"
            type="button"
            tooltip={t('pages.cart.remove')}
            flow="right"
            aria-label={t('pages.cart.remove')}
            aria-busy={deleting}
            disabled={deleting}
            onClick={handleDelete}
            className="group relative inline-flex h-10 w-10 flex-col items-center justify-end  overflow-y-clip remove-btn"
          >
            <svg
              viewBox="0 0 1.625 1.625"
              className="absolute -top-7 fill-lightgray group-hover:fill-danger delay-100 group-hover:top-6 group-hover:animate-[spin_1.4s] group-hover:duration-500 transition-all duration-500"
              height="15"
              width="15"
            >
              <path d="M.471 1.024v-.52a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099h-.39c-.107 0-.195 0-.195-.195"></path>
              <path d="M1.219.601h-.163A.1.1 0 0 1 .959.504V.341A.033.033 0 0 0 .926.309h-.26a.1.1 0 0 0-.098.098v.618c0 .054.044.098.098.098h.487a.1.1 0 0 0 .098-.099v-.39a.033.033 0 0 0-.032-.033"></path>
              <path d="m1.245.465-.15-.15a.02.02 0 0 0-.016-.006.023.023 0 0 0-.023.022v.108c0 .036.029.065.065.065h.107a.023.023 0 0 0 .023-.023.02.02 0 0 0-.007-.016"></path>
            </svg>
            <svg width="16" fill="none" viewBox="0 0 39 7" className="del origin-right duration-300 group-hover:rotate-90">
              <line
                strokeWidth="4"
                className="group-hover:stroke-danger transition-all duration-300"
                stroke="var(--light-gray-color)"
                y2="5"
                x2="39"
                y1="5"
              ></line>
              <line
                strokeWidth="3"
                className="group-hover:stroke-danger transition-all duration-300"
                stroke="var(--light-gray-color)"
                y2="1.5"
                x2="26.0357"
                y1="1.5"
                x1="12"
              ></line>
            </svg>
            <svg width="16" fill="none" viewBox="0 0 33 39">
              <path
                className="group-hover:fill-danger transition-all duration-300"
                fill="var(--light-gray-color)"
                d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
              ></path>
              <path
                className="group-hover:stroke-danger transition-all duration-300"
                strokeWidth="4"
                stroke="var(--light-gray-color)"
                d="M12 6L12 29"
              ></path>
              <path
                className="group-hover:stroke-danger transition-all duration-300"
                strokeWidth="4"
                stroke="var(--light-gray-color)"
                d="M21 6V29"
              ></path>
            </svg>
          </button>
        </span>
      </section>
    </form>
  );
}
