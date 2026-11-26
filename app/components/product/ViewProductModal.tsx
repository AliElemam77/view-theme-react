/**
 * View's `#modal-container` (layouts/extentions.twig) + `partials/modules.js`:
 * the quick view (`openQuek`) and related products (`openModelrelated`) the
 * product card's side buttons open. Unfolds with the `.one` / `.out` animations
 * of 01-settings/global.scss; the title and close button fade in once the
 * content is ready (`.is-ready`).
 */
import { useCallback, useEffect, useId, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaProductOptionsCore as SallaProductOptions } from '@salla.sa/twilight-components-react/product-options';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { useHostAttributes } from '@salla.sa/twilight-theme-engine/hooks/useHostAttributes';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks/useDocumentClass';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { formatSallaPlural } from '@salla.sa/twilight-theme-engine/utils';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useViewSettings } from '../../hooks/useViewSettings';
import { promoColorFor } from '../../lib/promoColors';
import { ProductCard, useCardSettings } from './ProductCard';
import { PRODUCT_MODAL_EVENT, type ProductModalRequest } from './productModals';

const ERROR_IMAGE = 'https://cdn.salla.sa/form-builder/bLYoq8X6LS0HuL4F1Ivx2agEbDOGllRi8XaphmKC.png';

type Phase = 'closed' | 'open' | 'closing';
type SallaProductSdk = { product?: { getDetails?: (id: number, with_: string[]) => Promise<{ data?: Product }> } };

function Spinner() {
  return (
    <div className="flex-center w-full py-5">
      <div className="s-button-loader w-5 h-5 rounded-full " />
    </div>
  );
}

function handleModalFormSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  window.salla?.form?.onSubmit?.('cart.addItem', event.nativeEvent);
}

function handleModalFormChange(event: React.FormEvent<HTMLFormElement>) {
  const form = event.currentTarget;
  const isComplete = Array.from(form.elements).every(
    (el) => !(el as HTMLInputElement).willValidate || (el as HTMLInputElement).validity.valid
  );
  if (isComplete) {
    window.salla?.product?.getPrice?.(new FormData(form));
  }
}

function QuickView({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const wishlist = useWishlist();
  const wing = useCardSettings();
  const addRef = useHostAttributes({ fill: 'solid', width: 'wide', type: 'submit', 'loader-position': 'end' });
  const optionsRef = useCallback(
    (el: { setOptionsData?: (data: never[]) => void } | null) =>
      void el?.setOptionsData?.((product.options ?? []) as never[]),
    [product.options]
  );
  const image = product.images?.[0];
  const amount =
    typeof product.base_currency_price === 'object'
      ? product.base_currency_price?.amount
      : product.base_currency_price;
  const label = (() => {
    if (product.status === 'sale' && product.type === 'booking') return t('pages.cart.book_now');
    if (product.status === 'sale') return t('pages.cart.add_to_cart');
    if (product.type === 'donating') return t('pages.products.donation_exceed');
    return t('pages.products.out_of_stock');
  })();
  const icon = product.status === 'sale' ? <i className={`text-base ${wing.cartIcon}`} /> : null;
  const p = product as Product & {
    calories?: string;
    sold_quantity?: number;
    can_show_remained_quantity?: boolean;
    show_availability?: boolean;
    max_quantity?: number;
    is_giftable?: boolean;
    is_hidden_quantity?: boolean;
  };

  return (
    <div
      className="Moa_singlePage text-start main-content_Q center-between flex-col md:flex-row gap-3"
      id={`product-${product.id}`}
    >
      <div className="sidebar md:max-w-132 max-w-72 w-full md:w-2/4 relative shrink-0">
        <div className="flex flex-col items-center gap-2 absolute top-6 rtl:left-6 ltr:right-6 z-2">
          <salla-social-share className="inline-flex" aria-label={t('common.share', 'Share')} />
          <SallaButton
            className="btn--wishlist animated hidden sm:inline-flex"
            data-id={product.id}
            onClick={() => wishlist.toggle(Number(product.id))}
            shape="icon"
            fill="outline"
            color="light"
            ariaLabel={t('pages.products.add_to_wishlist')}
          >
            <i className="sicon-heart" />
          </SallaButton>
        </div>
        <Link className="relative" to={product.url || '#'} aria-label={product.name}>
          {product.promotion_title && (
            <div
              className="promotion-title"
              style={{ backgroundColor: promoColorFor(product.id) }}
            >
              {product.promotion_title}
            </div>
          )}
          {p.calories && (
            <div className="absolute z-[2] top-4 rtl:left-4 ltr:right-4 bg-white dark:bg-darkgray carbon:bg-darkgray shadow-sm flex flex-col justify-center items-center rounded-full w-20 h-20 md:w-24 md:h-24">
              <span className="text-red-500 text-xl leading-none font-bold">{p.calories}</span>
              <span className="text-xs text-mediumgray">{t('pages.products.calories', 'Calories')}</span>
            </div>
          )}
          {image?.url ? (
            image.video_url ? (
              <video controls className="h-full w-full object-cover">
                <source src={image.video_url} type="video/mp4" />
              </video>
            ) : (
              <img
                fetchPriority="high"
                src={image.url}
                alt={image.alt || product.name}
                className="max-h-132 h-full object-contain w-full"
                width={600}
                height={600}
              />
            )
          ) : (
            <p className="text-mediumgray">{t('pages.products.no_images')}</p>
          )}
        </Link>
      </div>
      <div className="overflow-auto w-full md:max-w-132 max-w-72 md:w-2/4 fg text-darkgray md:max-h-132 max-h-52">
        {product.rating && (
          <salla-rating-stars value={product.rating.stars} reviews={product.rating.count} size="small" />
        )}
        <h3 className="text-sm md:text-base leading-none font-bold">{product.name}</h3>
        <div className="Maw_data center-between flex-wrap">
          {product.subtitle && (
            <div className="Maw_data_subtitle">
              <h4 className="product-entry__sub-title md:text-sm text-xs leading-6">{product.subtitle}</h4>
            </div>
          )}
          <div className="Maw_data_numbers center-between gap-4">
            {product.sku && (
              <div className="flex justify-between sm:grid sm:grid-cols-3">
                <div className="flex items-center md:text-sm text-xs">{t('pages.products.sku')}</div>
                <div className="text-unicode md:text-sm text-xs">{product.sku}</div>
              </div>
            )}
            {product.weight && (
              <div className="center-between">
                <b className="center-between">
                  <span className="text-sm">{t('pages.products.weight')}:</span>
                </b>
                <span className="text-sm">{product.weight}</span>
              </div>
            )}
          </div>
        </div>
        <div className="center-between gap-2">
          <div className="flex items-center gap-2">
            <small className="color-grey md:text-sm text-xs text-scprimary">{t('pages.products.tax_included')}</small>
          </div>
          {(p.sold_quantity || (p.can_show_remained_quantity && typeof product.quantity === 'number')) && (
            <div className="rounded-md inline-flex md:text-sm text-xs justify-between gap-4">
              {p.sold_quantity ? (
                <div>
                  <i className="!text-scprimary sicon-fire rtl:ml-1.5 ltr:mr-1.5" />
                  {t('pages.products.sold')}{' '}
                  <span>{formatSallaPlural(t('pages.products.sold_times'), p.sold_quantity)}</span>
                </div>
              ) : null}
              {p.can_show_remained_quantity && typeof product.quantity === 'number' && (
                <div className="rtl:even:border-r ltr:even:border-l even:border-gray-200 dark:even:border-mediumgray carbon:even:border-mediumgray">
                  <i className="!text-scprimary sicon-box-bankers rtl:ml-1.5 ltr:mr-1.5" />
                  {t('pages.products.remained')} <span>{product.quantity}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="product__description sm:p-1 leading-7 mb-2 text-darkgray">
          <article
            className="article article--main relative  overflow-hidden transition-all max-h-0 duration-200 md:leading-6 leading-4 md:text-xs text-xxs"
            style={{ maxHeight: '5.25rem' }}
            // Merchant HTML, as the Twig quick view prints it.
            dangerouslySetInnerHTML={{ __html: product.description || t('pages.products.no_description') }}
          />
        </div>
        {product.tags?.length ? (
          <div>
            {product.tags.map((tag) => (
              <Link
                key={tag.id ?? tag.name}
                to={tag.url || '#'}
                className="rtl:ml-2 ltr:mr-2 inline-flex bg-lightgray dark:bg-darkgray carbon:bg-darkgray rounded-sm p-1 text-darkgray dark:text-mediumgray carbon:text-mediumgray hover:text-primary md:text-sm text-xs mb-1"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        ) : null}
        <salla-installment price={String(product.price ?? 0)} />
        {product.has_metadata && <salla-metadata />}
        <form
          className="form product-form fg"
          encType="multipart/form-data"
          method="post"
          onSubmit={handleModalFormSubmit}
          onChange={handleModalFormChange}
        >
          <SallaProductOptions
            ref={optionsRef}
            options={JSON.stringify(product.options ?? [])}
            productId={product.id}
            className="!mb-0"
            config='{"single-option":{"type":"button"},"multiple-option":{"type":"button"}}'
          />
          <input type="hidden" name="id" value={product.id} />
          {p.is_hidden_quantity || product.type === 'booking' ? (
            <input type="hidden" value="1" name="quantity" aria-label={t('pages.products.quantity')} />
          ) : (
            <div className="center-between gap-1.5">
              <label className="form-label font-bold">{t('pages.products.quantity')}</label>
              <salla-quantity-input
                max={p.max_quantity || 100}
                value={1}
                name="quantity"
                aria-label={t('pages.products.quantity')}
                className="border-gray-200 dark:border-mediumgray carbon:border-mediumgray flex justify-end"
              />
            </div>
          )}
          <section className="flex py-2 sm:pb-0 sm:border-t sm:border-solid sm:border-lightgray dark:sm:border-darkgray carbon:sm:border-darkgray">
            <div className="center-between w-full">
              <label className="form-label">
                <b className="block">{t('pages.products.price')}</b>
              </label>
              <div className="flex whitespace-nowrap price-wrapper gap-4 items-center">
                {product.is_on_sale ? (
                  <div className="price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap">
                    <h2 className="total-price text-price font-bold text-xl inline-block">
                      {format(product.sale_price ?? undefined)}
                    </h2>
                    <span className="before-price text-mediumgray  line-through">{format(product.regular_price)}</span>
                  </div>
                ) : (
                  <div className="starting-or-normal-price gap-4 flex">
                    {product.starting_price ? (
                      <span className="starting-price-title">{t('pages.products.starting_price')}</span>
                    ) : null}
                    <h2 className="total-price font-bold text-xl inline-block">
                      {format(product.starting_price || product.price)}
                    </h2>
                  </div>
                )}
              </div>
            </div>
          </section>
          <SallaAddProductButton
            ref={addRef}
            className="fl_bt"
            productStatus={product.status}
            productType={product.type}
            productId={product.id}
            amount={amount}
            quickBuy
            {...(product.is_require_shipping ? { requiredShipping: true } : {})}
          >
            <span className="s-button-text">
              <span className="btn-text-one flex-center gap-1.5">
                {icon} {label}
              </span>
              <span className="btn-text-two flex-center gap-1.5">
                {icon} {label}
              </span>
            </span>
          </SallaAddProductButton>
        </form>
        {p.is_giftable && <salla-gifting className="mt-5" product-id={product.id} />}
      </div>
    </div>
  );
}

function Related({ productId }: { productId: number }) {
  const { data, isLoading } = useQuery(productApi.queries.list({ source: 'related', sourceValue: productId }));
  if (isLoading) return <Spinner />;
  const items = data?.items ?? [];
  return (
    <div className="relative nani">
      <SallaSlider type="carousel" id={`related_${productId}`} autoPlay sliderConfig={{ slidesPerView: 'auto', spaceBetween: 16 }}>
        <div slot="items">
          {items.map((item) => (
            <div key={item.id} className="swiper-slide w-56">
              <ProductCard product={item} />
            </div>
          ))}
        </div>
      </SallaSlider>
    </div>
  );
}

export function ViewProductModal() {
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  const [phase, setPhase] = useState<Phase>('closed');
  const [request, setRequest] = useState<ProductModalRequest | null>(null);
  const [details, setDetails] = useState<Product | null | 'error'>(null);
  const ready = request?.kind === 'related' ? phase === 'open' : !!details;

  const close = useCallback(() => setPhase((current) => (current === 'open' ? 'closing' : current)), []);

  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<ProductModalRequest>).detail;
      setRequest(detail);
      setDetails(null);
      setPhase('open');
      if (detail.kind !== 'quick-view') return;
      const sdk = window.salla as unknown as SallaProductSdk | undefined;
      Promise.resolve(
        sdk?.product?.getDetails?.(detail.productId, [
          'images',
          'options',
          'rating',
          'sold_quantity',
          'category',
          'notify_availability',
          'tags',
        ])
      )
        .then((response) => setDetails(response?.data ?? 'error'))
        .catch(() => setDetails('error'));
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && close();
    window.addEventListener(PRODUCT_MODAL_EVENT, onRequest);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener(PRODUCT_MODAL_EVENT, onRequest);
      document.removeEventListener('keydown', onKey);
    };
  }, [close]);

  useDocumentClass({ body: { class: phase === 'closed' ? [] : ['modal-active'] } });

  // extentions.twig renders the container only with `has_q_view`; the related button needs it too.
  if (!settings) return null;

  const titleId = useId();
  const title =
    request?.kind === 'related' ? t('pages.products.related_products') : t('pages.products.quick_view');
  let content: ReactNode = <Spinner />;
  if (request?.kind === 'related') content = <Related productId={request.productId} />;
  else if (details === 'error')
    content = (
      <div className="text-center py-4">
        <img src={ERROR_IMAGE} alt={t('common.errors.error_occurred', 'Error')} className="mx-auto max-w-[150px]" />
      </div>
    );
  else if (details) content = <QuickView product={details} />;

  return (
    <div
      id="modal-container"
      role={phase === 'closed' ? undefined : 'dialog'}
      aria-modal={phase === 'closed' ? undefined : true}
      aria-labelledby={phase === 'closed' ? undefined : titleId}
      aria-hidden={phase === 'closed' ? true : undefined}
      className={[phase !== 'closed' && 'one', phase === 'closing' && 'out', phase === 'open' && ready && 'is-ready']
        .filter(Boolean)
        .join(' ')}
      style={{ transform: phase === 'closed' ? 'scale(0)' : 'scale(1)' }}
      onClick={(event) => {
        const target = event.target as HTMLElement;
        if (target === event.currentTarget || target.classList.contains('modal-background')) close();
      }}
      onAnimationEnd={(event) => {
        if (phase === 'closing' && event.target === event.currentTarget) {
          setPhase('closed');
          setRequest(null);
          setDetails(null);
        }
      }}
    >
      <div className="modal-background">
        <div className="modal">
          <div className="group modal-title inline-block">
            <h2
              id={titleId}
              className="text-xl text-center text-darkgray lg:text-end relative pb-3 before:absolute before:left-0 before:bottom-0 before:h-0.5 before:w-1/4 before:bg-primary before:transition-all before:duration-200 group-hover:before:w-full"
            >
              {phase === 'closed' ? '' : title}
            </h2>
          </div>
          <div id="pro__content" className={ready ? 'revealloding' : undefined}>
            {phase === 'closed' ? null : content}
          </div>
          {ready && (
            <button
              type="button"
              className="cl_w close-full-preview"
              aria-label={t('blocks.header.close')}
              onClick={close}
            />
          )}
        </div>
      </div>
    </div>
  );
}
