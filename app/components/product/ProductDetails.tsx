/**
 * Port of `pages/templates/base_content.twig` (`imformation_base`, `product_card_pic: main`)
 * and the bits of `sub_content.twig` it includes: the countdown / wishlist / share row,
 * brand (or store) logo with the title, subtitle, tax / SKU / barcode, the clipped
 * description, price with the discount badge and rating, the weight / remained / sold
 * row, tags, the "related products" button, installment and branch availability.
 */
import { useEffect, useState } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaCountDown } from '@salla.sa/twilight-components-react/count-down';
import { SallaInstallment } from '@salla.sa/twilight-components-react/installment';
import { SallaRatingStars } from '@salla.sa/twilight-components-react/rating-stars';
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { formatSallaPlural } from '@salla.sa/twilight-theme-engine/utils';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ActionBtn } from '../common/ActionBtn';
import { booleanValue, optionValue } from '../../lib/fieldValue';
import { CATEGORY_ICON, REMAINED_ICON, SOLD_ICON, TAG_ICON, TAX_ICON, WEIGHT_ICON } from './productIcons';

const Svg = ({ html }: { html: string }) => <span className="contents" dangerouslySetInnerHTML={{ __html: html }} />;

/** `product::price.updated.failed` (product.js): the price row gives way to "out of stock". */
export function usePriceFailed(): boolean {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const salla = window.salla as unknown as
      | {
          event?: { on?: (n: string, f: () => void) => void; off?: (n: string, f: () => void) => void };
        }
      | undefined;
    const onFailed = () => setFailed(true);
    const onUpdated = () => setFailed(false);
    salla?.event?.on?.('product::price.updated.failed', onFailed);
    salla?.event?.on?.('product::price.updated', onUpdated);
    return () => {
      salla?.event?.off?.('product::price.updated.failed', onFailed);
      salla?.event?.off?.('product::price.updated', onUpdated);
    };
  }, []);
  return failed;
}

/** `sub_content.twig` `price_bit` (`total` adds the classes product.js updates). */
export function PriceBit({ product, total = false }: { product: Product; total?: boolean }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const tc = (name: string) => (total ? `${name} ` : '');
  return (
    <div className={`flex whitespace-nowrap  ${total ? 'price-wrapper' : ''} gap-4 items-center`}>
      <div
        className={`${product.is_on_sale ? '' : 'hidden'} price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap`}
      >
        <h2 className={`${tc('total-price')}text-price font-bold md:text-xl text-lg inline-block`}>
          {format(product.sale_price ?? undefined)}
        </h2>
        <span className={`${tc('before-price')}text-mediumgray line-through opacity-85 font-semibold text-base`}>
          {format(product.regular_price)}
        </span>
      </div>
      <div className={`${tc('starting-or-normal-price')}gap-4 ${product.is_on_sale ? 'hidden' : 'flex'}`}>
        {product.starting_price ? (
          <span className={total ? 'starting-price-title' : undefined}>{t('pages.products.starting_price')}</span>
        ) : null}
        <h2 className={`${tc('total-price')}font-bold md:text-xl text-lg inline-block`}>
          {format(product.starting_price || product.price)}
        </h2>
      </div>
    </div>
  );
}

/** `sub_content.twig` `social_bit`: the offer countdown, the category shortcut, wishlist and share. */
function SocialBit({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const wishlist = useWishlist();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const priceLight = optionValue(s.price_color_light) || '#F55157';
  const inputDate = optionValue(s.input_date);
  const date =
    booleanValue(s.is_date, true) && inputDate
      ? inputDate
      : String((product as { discount_ends?: unknown }).discount_ends ?? '');
  const inWishlist = wishlist.has(Number(product.id));

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
      {booleanValue(s.show_counter, true) && (
        <div
          className="has-overlay flex-1 discount countersingl flex items-center justify-between text-sm relative  px-1.5 py-1 rounded-theme"
          style={{ border: `1px solid ${priceLight}75` }}
        >
          <span className="z-2">{t('blocks.appBanner.discountssss')}</span>
          <SallaCountDown className="offer-count relative z-2 flex-1" digits="en" size="sm" date={date} />
        </div>
      )}
      <div className="items-center gap-1.5 flex  justify-between w-full md:w-auto">
        {booleanValue(s.mini_category, false) && (
          <Link
            to={product.category?.url || '#'}
            title={product.category?.name}
            className="!m-0 inline-flex s-social-share-btn s-button-element s-button-icon s-button-outline s-button-light-outline s-button-loader-center"
          >
            <Svg html={CATEGORY_ICON} />
          </Link>
        )}
        <SallaButton
          className={`btn--wishlist animated inline-flex${inWishlist ? ' s-product-card-wishlist-added pulse-anime' : ''}`}
          data-id={product.id}
          onClick={() => wishlist.toggle(Number(product.id))}
          shape="icon"
          fill="outline"
          color="light"
          ariaLabel={t('pages.products.add_to_wishlist')}
        >
          <i className="sicon-heart"></i>
        </SallaButton>
        <SallaSocialShare className="inline-flex" aria-label={t('common.share', 'Share')} />
      </div>
    </div>
  );
}

interface ProductDetailsProps {
  product: Product;
  /** Live SKU of the selected variant; defaults to `product.sku`. */
  sku?: string | null;
  /** Live barcode of the selected variant; defaults to `product.barcode`. */
  barcode?: string | null;
  showTags?: boolean;
}

export function ProductDetails({ product, sku = product.sku, barcode = product.barcode, showTags }: ProductDetailsProps) {
  const { t } = useTranslation();
  const { store, theme } = useTwilight();
  const s = (theme?.settings ?? {}) as Record<string, unknown>;
  const priceLight = optionValue(s.price_color_light) || '#F55157';
  const p = product as Product & {
    discount_percentage?: number;
    is_taxable?: boolean;
    sold_quantity?: number;
    show_availability?: boolean;
  };
  const showBrand = booleanValue(s.show_brand, true);
  const weight = String(product.weight ?? '').trim().split(/\s+/).filter(Boolean);
  const showAvailable = booleanValue(s.isavi, true);
  const showSold = booleanValue(s.howbuy, true);
  const tagsOn = showTags ?? booleanValue(s.show_tags, true);
  // Twig replaces `&nbsp;` with a newline before printing the description.
  const description = (product.description ?? '').replace(/&nbsp;/g, '\n');

  return (
    <>
      <SocialBit product={product} />
      <div className="flex items-center gap-2 text-darkgray">
        {product.brand?.name && showBrand ? (
          <div className="product-brand w-12">
            <Link className="brand-logo" to={product.brand.url || '#'} title={product.brand.name}>
              <img
                width={50}
                height={50}
                className="max-h-full object-contain"
                src={product.brand.logo}
                title={product.brand.name}
                alt={product.brand.name}
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>
        ) : (
          <img
            width={50}
            height={50}
            className="max-h-full object-contain"
            src={store?.logo}
            title={store?.name}
            alt={store?.name}
            loading="lazy"
            decoding="async"
          />
        )}
        <h1 className="text-base md:text-2xl sm:text-xl  leading-6 font-bold flex-1">{product.name}</h1>
      </div>

      {product.subtitle && (
        <h2 className="product-entry__sub-title sm:text-sm text-xs text-mediumgray  leading-6">{product.subtitle}</h2>
      )}
      {(sku || barcode || p.is_taxable) && (
        <div className="center-between">
          {p.is_taxable && (
            <span className="flex items-center gap-1 text-mediumgray">
              <Svg html={TAX_ICON} />
              <small className="font-semibold text-xxs sm:text-xs">{t('pages.products.tax_included')}</small>
            </span>
          )}
          {sku && (
            <div className="flex justify-between items-center sm:text-base text-xs gap-1 text-mediumgray">
              <div className="flex items-center">{t('pages.products.sku')}:</div>
              <div className="text-unicode text-primary product-sku">{sku}</div>
            </div>
          )}
          {barcode && (
            <div className="flex justify-between items-center sm:text-base text-xs gap-1 text-mediumgray">
              <div className="flex items-center">
                <i className="sicon-barcode mx-1"></i>
                {t('pages.products.barcode')}:
              </div>
              <div className="text-unicode text-primary product-barcode">{barcode}</div>
            </div>
          )}
        </div>
      )}
      <article
        className="article article--main text-darkgray relative text-sm leading-8 overflow-hidden transition-all max-h-0 duration-200"
        id="more-content"
        style={{ maxHeight: '5.25rem' }}
        // Merchant HTML, as Twig's `product_desc|raw`.
        dangerouslySetInnerHTML={{ __html: description }}
      />

      <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-3">
        <PriceBit product={product} />
        {p.discount_percentage && booleanValue(s.show_custom_discount_price, true) ? (
          <div
            className="has-overlay discount relative text-price px-1.5 py-1 font-bold rounded-theme"
            style={{ border: `1px solid ${priceLight}75` }}
          >
            {Number(p.discount_percentage).toFixed(1)}%
          </div>
        ) : null}
        {product.rating && (
          <div className="md:block flex justify-center w-full md:w-auto">
            <SallaRatingStars value={product.rating.stars} reviews={product.rating.count} size="medium" />
          </div>
        )}
      </div>

      {(weight.length > 0 || showSold || (showAvailable && typeof product.quantity === 'number')) && (
        <div className="flex justify-between items-center flex-wrap md:flex-nowrap gap-3 text-xs md:text-sm ">
          {weight.length > 0 && (
            <div
              className={`whitespace-nowrap flex-1 inline-flex items-center justify-center text-darkgray gap-1.5  font-medium${
                product.has_size_guide ? ' pb-5 border-b-[1px]' : ''
              }`}
            >
              <Svg html={WEIGHT_ICON} />
              <span>{t('pages.products.weight')}</span>
              <span className="text-primary font-semibold">{weight[0]}</span>
              {weight.length > 1 && <span>{weight.slice(1).join(' ')}</span>}
            </div>
          )}
          {showAvailable && typeof product.quantity === 'number' && (
            <>
              {weight.length > 0 && <small className="opacity-30">|</small>}
              <div className="md:block flex justify-center w-full md:w-auto flex-1 whitespace-nowrap">
                <div className="text-darkgray px-1 rtl:even:border-r ltr:even:border-l even:border-gray-200 dark:even:border-mediumgray carbon:even:border-mediumgray  inline-flex items-center justify-center gap-1.5 font-medium">
                  <Svg html={REMAINED_ICON} />
                  {t('pages.products.remained')}
                  <span className="text-primary font-semibold">{product.quantity}</span>
                </div>
              </div>
            </>
          )}
          {showSold && (
            <>
              {(weight.length > 0 || (showAvailable && typeof product.quantity === 'number')) && <small className="opacity-30">|</small>}
              <div className="md:block flex justify-center w-full md:w-auto flex-1 whitespace-nowrap">
                <div className="px-1 inline-flex items-center justify-center text-darkgray gap-1.5 font-medium">
                  <Svg html={SOLD_ICON} />
                  {t('pages.products.sold')}{' '}
                  <span className="text-primary font-semibold">
                    {(p.sold_quantity ?? 0) > 0
                      ? formatSallaPlural(t('pages.products.sold_times'), p.sold_quantity!)
                      : t('pages.products.sold_zero')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {tagsOn && product.tags?.length ? (
        <div className="">
          {product.tags.map((tag, index) => (
            <span key={tag.id ?? tag.name} className="contents">
              <Link
                to={tag.url || '#'}
                className="inline-flex items-center justify-center text-mediumgray hover:text-primary underline text-sm sm:mb-1 mb-0.5"
              >
                <Svg html={TAG_ICON} />
                <small>{tag.name}</small>
              </Link>
              {index < (product.tags?.length ?? 0) - 1 && <small className="opacity-45">|</small>}
            </span>
          ))}
        </div>
      ) : null}
      {!booleanValue(s.mini_category, false) && (
        <ActionBtn
          text={t('blocks.appBanner.related_products')}
          href={product.category?.url}
          dataStyle="outline"
          icon
          color="var(--color-bg)"
          backgroundColor="var(--color-primary)"
        />
      )}
      <HookSlot name="product:single.description" context={{ product }} />
      <SallaInstallment price={String(product.price ?? '')} />
      {(product as { show_availability?: boolean }).show_availability && (
        <section>
          <div className="center-between">
            <label className="flex items-center text-base">
              <span className="sicon-location rtl:ml-1 ltr:mr-1"></span>
              <span className="inline-block">{t('pages.products.availability')}</span>
            </label>
            <div className="mt-1 sm:mt-0 sm:col-span-2 text-end">
              <div className="flex rtl:space-x-reverse space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    window.salla?.event?.dispatch('scopes::open', { mode: 'availability', product_id: String(product.id) });
                  }}
                  className="with-arrow group text-primary flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
                >
                  <span>{t('pages.products.select_branch')}</span>
                  <span className="sicon-keyboard_arrow_left ms-2 transition-all rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1"></span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
