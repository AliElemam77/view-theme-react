/**
 * Port of View's `<custom-salla-product-card>` (`assets/js/partials/product-card.js`),
 * the card every product list renders. Registered as `product:card` in
 * `app/router.tsx`, so the engine's own lists use it too.
 *
 * The store-wide card switches are `window.wing` in `master.twig`; here they are
 * read from the theme settings with the same defaults (`useCardSettings`).
 */
import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaProgressBar } from '@salla.sa/twilight-components-react/progress-bar';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useHostAttributes } from '@salla.sa/twilight-theme-engine/hooks/useHostAttributes';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { booleanValue, optionValue } from '../../lib/fieldValue';
import { registerNativeBookingHook } from '../../lib/nativeBooking';
import { PRODUCT_IMAGE_PLACEHOLDER } from '../../lib/productImage';
import { promoColorFor } from '../../lib/promoColors';
import { openQuickView, openRelatedProducts } from './productModals';

export type ProductCardLayout = 'vertical' | 'horizontal' | 'fullImage' | 'minimal' | 'special';

export interface ProductCardProps {
  product: Product;
  layout?: ProductCardLayout;
  className?: string;
  withShadow?: boolean;
  withQuantity?: boolean;
  withoutAddButton?: boolean;
  index?: number;
  imagePriority?: boolean;
  sizes?: string;
}

/** `ProductCard.DEFAULT__ICON`: the bag-plus icon of `product_cart_icon: def`. */
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

/** `window.wing` (master.twig), with its defaults. */
export function useCardSettings() {
  const { theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  return {
    cartIcon: optionValue(s.product_cart_icon) || 'sicon-cart2',
    nameLines: optionValue(s.product_name_lines) || 'line-clamp-1',
    hasRelated: booleanValue(s.has_rel_pro, true),
    noneRating: booleanValue(s.none_rating, false),
    hasCategory: booleanValue(s.has_category, true),
    noneSubtitle: booleanValue(s.none_subtitle, false),
    showDiscount: booleanValue(s.show_descound, true),
    showTags: booleanValue(s.show_card_tags, true),
    padding: booleanValue(s.is_padding, true),
    hideOutOfStock: booleanValue(s.hiddn_out_of_stock, false),
    showAvailablePieces: booleanValue(s.show_available_pieces, true),
    quickView: booleanValue(s.has_q_view, false),
    addOriginal: booleanValue(s.add_original, true),
    notifyInCard: booleanValue(s.notify_when_available_in_card, true),
  };
}

/** A price-like value (number, numeric string or `{ amount }`) as a number. */
export function amountOf(value: unknown): number {
  if (value && typeof value === 'object') return amountOf((value as { amount?: unknown }).amount);
  const n = parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : 0;
}

/** `salla.helpers.number` (the store's digits) once the SDK is up; plain digits before. */
export function useStoreNumber(value: number | string | undefined | null): string {
  const raw = value === undefined || value === null ? '' : String(value);
  const [shown, setShown] = useState(raw);
  useEffect(() => {
    const helpers = (window.salla as unknown as { helpers?: { number?: (v: unknown) => string } } | undefined)
      ?.helpers;
    setShown(helpers?.number ? String(helpers.number(raw)) : raw);
  }, [raw]);
  return shown;
}

function CardIcon({ status, cartIcon }: { status: string; cartIcon: string }) {
  if (status !== 'sale') return null;
  return cartIcon === 'def' ? <DefaultCartIcon /> : <i className={`text-base ${cartIcon}`} />;
}

function Discount({ product }: { product: Product }) {
  const sale = amountOf(product.sale_price);
  const regular = amountOf(product.regular_price);
  const discount = sale && regular && regular > sale ? Math.round(((regular - sale) / regular) * 100) : 0;
  const shown = useStoreNumber(discount);
  if (!discount) return null;
  return (
    <div className="absolute bottom-1 ltr:left-1 rtl:right-1">
      <div className="leading-none text-xs flex-center has-overlay discount relative text-price px-1.5 py-1 font-bold rounded-theme border border-price">
        <span className="leading-none mx-0.5">%{shown}</span>
        <b>-</b>
      </div>
    </div>
  );
}

function Quantity({ value }: { value: number | string | undefined | null }) {
  return <>{useStoreNumber(value)}</>;
}

const ProductCardView = memo(function ProductCardView({
  product,
  layout = 'vertical',
  className = '',
  withShadow = false,
  withQuantity = false,
  withoutAddButton = false,
  imagePriority = false,
}: ProductCardProps) {
  const { t } = useTranslation();
  const { store } = useTwilight();
  const { format } = useMoney();
  const wishlist = useWishlist();
  const wing = useCardSettings();
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  // The button copies host attributes (not properties) onto its inner salla-button.
  const addButtonRef = useHostAttributes({ width: 'wide' });

  useEffect(() => registerNativeBookingHook(), []);
  // An image that finished before hydration fired its load event too early to be seen.
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth) setLoaded(true);
  }, []);

  if (product.is_out_of_stock && wing.hideOutOfStock) return null;

  const horizontal = layout === 'horizontal';
  const fullImage = layout === 'fullImage';
  const minimal = layout === 'minimal';
  const isSpecial = layout === 'special';
  const fitType = (store?.settings as { product?: { fit_type?: string } } | undefined)?.product?.fit_type;
  const showDash = Boolean(
    (store?.settings as { product?: { show_price_as_dash?: boolean } } | undefined)?.product?.show_price_as_dash
  );
  const image = product.image?.url || (product as { thumbnail?: string }).thumbnail || '';
  const isPlaceholder = !image;
  const imageClass = isPlaceholder ? 'contain' : fitType || 'cover';
  const alt = product.image?.alt || product.name;
  const inWishlist = wishlist.has(Number(product.id));
  const donation = product.donation;
  const quantity = product.quantity;
  const status =
    product.is_out_of_stock && wing.notifyInCard && !['donating', 'financial_support'].includes(product.type)
      ? 'out-and-notify'
      : product.status;

  const price = (value: unknown): ReactNode => {
    if (!amountOf(value)) return showDash ? '-' : '';
    return format(value as number);
  };

  const addLabel = (() => {
    const custom = (product as { add_to__label?: string }).add_to__label;
    if (custom) return custom;
    if (product.status === 'sale' && product.type === 'booking') return t('pages.cart.book_now');
    if (product.status === 'sale') return t('pages.cart.add_to_cart');
    if (product.type !== 'donating') return t('pages.products.out_of_stock');
    return t('pages.products.donation_exceed');
  })();

  const badge = (() => {
    const preorder = (product as { preorder?: { label?: string } }).preorder?.label;
    if (preorder) return <div className="s-product-card-promotion-title">{preorder}</div>;
    if (product.promotion_title) {
      const color = promoColorFor(product.id);
      return (
        <div className="s-product-card-promotion-title" style={{ backgroundColor: color }}>
          {product.promotion_title}
        </div>
      );
    }
    if (withQuantity && quantity) {
      return (
        <div className="s-product-card-quantity">
          {t('pages.products.remained')} <Quantity value={quantity} />
        </div>
      );
    }
    if (withQuantity && product.is_out_of_stock) {
      return <div className="s-product-card-out-badge">{t('pages.products.out_of_stock')}</div>;
    }
    return null;
  })();

  const productPrice = (() => {
    if (product.is_on_sale) {
      return (
        <div className="s-product-card-sale-price">
          <h4>{price(product.sale_price)}</h4>
          <span>{price(product.regular_price)}</span>
        </div>
      );
    }
    if (amountOf(product.starting_price)) {
      return (
        <div className="s-product-card-starting-price">
          <p>{t('pages.products.starting_price')}</p>
          <h4>{price(product.starting_price)}</h4>
        </div>
      );
    }
    return <h4 className="s-product-card-price">{price(product.price)}</h4>;
  })();

  const formClass = [
    's-product-card-entry donating-wrap form product-form',
    !horizontal && !fullImage && !minimal && 's-product-card-vertical',
    horizontal && 's-product-card-horizontal',
    fitType && !isSpecial && !fullImage && !minimal && 's-product-card-fit-height',
    isSpecial && 's-product-card-special',
    fullImage && 's-product-card-full-image',
    minimal && 's-product-card-minimal',
    donation && 's-product-card-donation',
    withShadow && 's-product-card-shadow',
    product.is_out_of_stock && 's-product-card-out-of-stock',
    wing.padding && 'p-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const pieTotal = (quantity ?? 0) > 100 ? (quantity ?? 0) * 2 : 100;
  const piePercent = ((quantity ?? 0) / pieTotal) * 100;
  const discountEnds = (product as { discount_ends?: string | number }).discount_ends;
  const endDate = discountEnds
    ? (() => {
        const d = new Date(discountEnds);
        return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      })()
    : '';
  const showCategory = Boolean(product.category?.name && wing.hasCategory);
  const showPieces = !quantity && wing.showAvailablePieces;

  return (
    <form
      id={`product-card-${product.id}`}
      className={formClass}
      encType="multipart/form-data"
      method="post"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={`${fullImage ? 's-product-card-image-full' : 's-product-card-image'}${wing.padding ? ' pad' : ''} im_ relative`}>
        <Link to={product.url} className="relative block" aria-label={alt}>
          <img
            ref={imgRef}
            id={`product-img-${product.id}`}
            className={`s-product-card-image-${imageClass}`}
            src={image || PRODUCT_IMAGE_PLACEHOLDER}
            alt={alt}
            width={500}
            height={500}
            loading={imagePriority ? 'eager' : 'lazy'}
            fetchPriority={imagePriority ? 'high' : undefined}
            style={{ opacity: loaded ? 1 : 0 }}
            onLoad={() => setLoaded(true)}
          />
          {!loaded && (
            <span className="loading_image flex-center">
              <span className="ld" />
            </span>
          )}
        </Link>
        {wing.addOriginal && (
          <div className="absolute top-2 rtl:left-2 ltr:right-2">
            <img
              width={40}
              height={40}
              src="https://cdn.salla.sa/form-builder/SUsQ7WAWSmlGTi3YYtp8upMzllqtk5kJNvC1ZjJj.webp"
              alt={alt}
              className="original_image"
              style={{ opacity: 1 }}
            />
          </div>
        )}
        <div className="obts">
          {wing.quickView && (
            <div className="btn_side" flow="right" tooltip={t('pages.products.quick_view')}>
              <SallaButton
                className="Mws_opsbtn_eye"
                loaderPosition="center"
                shape="icon"
                fill="outline"
                color="light"
                name={`product-name-${product.id}`}
                onClick={() => openQuickView(Number(product.id))}
              >
                <i className="sicon-vision" />
              </SallaButton>
            </div>
          )}
          <div className="btn_side" flow="right" tooltip={t('pages.products.add_to_wishlist')}>
            <SallaButton
              shape="icon"
              fill="outline"
              color="light"
              id={`card-wishlist-btn-${product.id}-horizontalf`}
              name={`product-name-${product.id}`}
              ariaLabel="Add or remove to wishlist"
              className={`animated ${inWishlist ? ' s-product-card-wishlist-added pulse-anime' : 'not-added un-favorited'}`}
              onClick={() => wishlist.toggle(Number(product.id))}
              data-id={product.id}
            >
              <i className="sicon-heart" />
            </SallaButton>
          </div>
          {wing.hasRelated && (
            <div className="btn_side" flow="right" tooltip={t('pages.products.related_products')}>
              <SallaButton
                className="Mws_opsbtn_rel"
                loaderPosition="center"
                shape="icon"
                fill="outline"
                color="light"
                name={`product-related-name-${product.id}`}
                onClick={() => openRelatedProducts(Number(product.id))}
              >
                <i className="sicon-switch-flip" />
              </SallaButton>
            </div>
          )}
        </div>
        {!fullImage && !minimal && badge}
        {wing.showDiscount && <Discount product={product} />}
        {fullImage && <Link to={product.url} className="s-product-card-overlay" aria-label={product.name} />}
      </div>
      <div className="s-product-card-content">
        {isSpecial && quantity ? (
          <div className="s-product-card-content-pie">
            <span>
              <b>
                <Quantity value={quantity} />
              </b>{' '}
              {t('pages.products.remained')}
            </span>
            <svg viewBox="-2 -1 36 34" className="s-product-card-content-pie-svg">
              <circle cx="16" cy="16" r="15.9155" className="s-product-card-content-pie-svg-base" />
              <circle
                cx="16"
                cy="16"
                r="15.9155"
                className="s-product-card-content-pie-svg-bar"
                style={{ strokeDashoffset: 100 - piePercent }}
              />
            </svg>
          </div>
        ) : null}
        <div className={`s-product-card-content-main${isSpecial ? ' s-product-card-content-extra-padding' : ''}`}>
          {(showCategory || showPieces) && (
            <div className="center-between">
              {showCategory && (
                <Link
                  to={product.category?.url || '#'}
                  className="text-xxs md:text-xs p-1 leading-none rounded-sm line-clamp-1"
                >
                  {product.category?.name}
                </Link>
              )}
              {showPieces && typeof quantity === 'number' && (
                <span className="text-xxs whitespace-nowrap">
                  {t('pages.products.remained')} (<i className="sicon-delivery-parcel2 text-primary-l" />{' '}
                  <Quantity value={quantity} />)
                </span>
              )}
            </div>
          )}
          <h3 className={`s-product-card-content-title ${wing.nameLines}`}>
            <Link to={product.url}>{product.name}</Link>
          </h3>
          {product.subtitle && !minimal && !wing.noneSubtitle && (
            <p className={`s-product-card-content-subtitle opacity-80 ${wing.nameLines}`}>{product.subtitle}</p>
          )}
          {wing.showTags && product.tags?.length ? (
            <div className="tags flex items-center justify-start flex-wrap text-xs gap-1">
              {product.tags.map((tag) => (
                <Link key={tag.id ?? tag.name} to={tag.url || '#'}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        {donation && donation.can_donate && !minimal && !fullImage && (
          <DonationInput product={product} onAmount={setDonationAmount} />
        )}
        <div className={`s-product-card-content-sub${isSpecial ? ' s-product-card-content-extra-padding' : ''}`}>
          {!donation?.can_donate && productPrice}
          {product.rating?.stars && !wing.noneRating ? (
            <div className="s-product-card-rating">
              <i className="sicon-star2 before:text-orange-300" />
              <span>{product.rating.stars}</span>
            </div>
          ) : null}
        </div>
        {isSpecial && endDate && <salla-count-down date={endDate} end-of-day boxed labeled />}
        {!withoutAddButton && (
          <div className="s-product-card-content-footer gap-2">
            <SallaAddProductButton
              ref={addButtonRef}
              width="wide"
              productId={product.id}
              {...(donationAmount ? { donatingAmount: Number(donationAmount) } : {})}
              productStatus={status}
              productType={product.type}
              hasPreOrder={product.has_preorder_campaign}
            >
              <span className="btn-text-one flex-center gap-1.5">
                <CardIcon status={product.status} cartIcon={wing.cartIcon} />
                {addLabel}
              </span>
              <span className="btn-text-two flex-center gap-1.5">
                <CardIcon status={product.status} cartIcon={wing.cartIcon} />
                {addLabel}
              </span>
            </SallaAddProductButton>
          </div>
        )}
      </div>
    </form>
  );
});

/** `getDonationUI`: the progress bar and the amount field (digits only), passed to the add button. */
function DonationInput({ product, onAmount }: { product: Product; onAmount: (value: string) => void }) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  return (
    <>
      <SallaProgressBar donation={JSON.stringify(product.donation)} />
      <div className="s-product-card-donation-input">
        <label htmlFor={`donation-amount-${product.id}`}>
          {t('pages.products.donation_amount')} <span>*</span>
        </label>
        <input
          type="text"
          name="donating_amount"
          id={`donation-amount-${product.id}`}
          className="s-form-control"
          placeholder={t('pages.products.donation_amount')}
          value={value}
          onChange={(event) => {
            const digits = event.target.value.replace(/[^\d.]/g, '');
            setValue(digits);
            onAmount(digits);
          }}
        />
      </div>
    </>
  );
}

export function ProductCard(props: ProductCardProps) {
  return <ProductCardView {...props} />;
}
