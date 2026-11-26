import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SallaQuickOrder } from '@salla.sa/twilight-components-react/quick-order';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { Breadcrumb, Link, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { PageBlocks } from '@salla.sa/twilight-theme-engine/home';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductGallery } from './ProductGallery';
import { ProductDetails } from './ProductDetails';
import { AddToCartForm } from './AddToCartForm';
import { TAG_ICON } from './productIcons';
import { BlockHookSlot } from '../common';
import { SallaProductsSlider } from '@salla.sa/twilight-components-react';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { ProductCard } from './ProductCard';

/**
 * single.twig's `<salla-products-slider source="related" block-title="similar_products">`,
 * with the theme card. A product with no related products shows nothing.
 */
function RelatedProducts({ productId, title }: { productId: number; title: string }) {
  const loader = useCallback(() => productApi.list({ source: 'related', sourceValue: productId }), [productId]);
  return (
    <>
      <HookSlot name="product:related.start" />
      <RenderWhenVisible estimatedHeight="0px">
        <div className="container">
          <SallaProductsSlider loader={loader} blockTitle={title} sliderProps={{ id: `related-${productId}-slider` }}>
            {(item: Product) => <ProductCard className="w-full" product={item} />}
          </SallaProductsSlider>
        </div>
      </RenderWhenVisible>
      <HookSlot name="product:related.end" />
    </>
  );
}

const CELL = 'font-medium text-primary-d md:text-xl text-xs md:py-4 pt-2 md:pe-2 pe-1';

/** `sub_content.twig` `table_bit`: the features table (`.container_table`, striped by single-product.scss). */
function ProductFeaturesTable({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const settings = (theme?.settings ?? {}) as Record<string, unknown>;
  const options = (product.options || []) as Array<{ type?: string; details?: Array<{ name?: string }> }>;
  const names = (type: string, separator: string) =>
    options
      .filter((o) => o.type === type)
      .flatMap((o) => o.details || [])
      .map((d) => d.name)
      .join(` ${separator} `);
  const tags = settings.show_tags !== false ? (product.tags ?? []) : [];

  return (
    <table className="container_table">
      <tbody>
        {product.name && (
          <tr>
            <th className={CELL}>{t('pages.cart.nameTap')}</th>
            <td className={`${CELL} line-clamp-1`}>{product.name}</td>
          </tr>
        )}
        {product.brand?.name && settings.show_brand !== false && (
          <tr>
            <th className={CELL}>{t('pages.cart.brandTap')}</th>
            <td className={`${CELL} line-clamp-1`}>{product.brand.name}</td>
          </tr>
        )}
        {product.sku && (
          <tr>
            <th className={CELL}>
              <i className="mx-1 sicon-barcode"></i>
              {t('pages.products.sku')}
            </th>
            <td className={`${CELL} line-clamp-1`}>{product.sku}</td>
          </tr>
        )}
        {product.weight && (
          <tr>
            <th className={CELL}>{t('pages.products.weight')}</th>
            <td className={`${CELL} line-clamp-1`}>{product.weight}</td>
          </tr>
        )}
        {product.has_options && (
          <tr>
            <th className={CELL}>{t('pages.cart.colorTap')}</th>
            <td className={`${CELL} line-clamp-1`}>{names('color', '|')}</td>
          </tr>
        )}
        {product.has_options && (
          <tr>
            <th className={CELL}>{t('pages.cart.sizeTap')}</th>
            <td className={`${CELL} line-clamp-1`}>{names('single-option', '/')}</td>
          </tr>
        )}
        {tags.length > 0 && (
          <tr>
            <th className={CELL}>{t('pages.cart.tag')}</th>
            <td className={`${CELL} line-clamp-1`}>
              {tags.map((tag, index) => (
                <span key={tag.id ?? tag.name} className="contents">
                  <Link
                    to={tag.url || '#'}
                    className="inline-flex items-center justify-center hover:text-primary underline text-sm sm:mb-1 mb-0.5"
                  >
                    <span className="contents" dangerouslySetInnerHTML={{ __html: TAG_ICON }} />
                    <small>{tag.name}</small>
                  </Link>
                  {index < tags.length - 1 && <small className="opacity-45">|</small>}
                </span>
              ))}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

/** `sub_content.twig` `description_bit`: clipped with "read more" only when the product asks for it. */
function ProductDescription({ product }: { product: Product }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  // Twig replaces `&nbsp;` with a newline before printing the description.
  const html = (product.description ?? '').replace(/&nbsp;/g, '\n');
  const readMore = Boolean((product as { has_read_more?: boolean }).has_read_more);

  return (
    <div className="product__description p-2 px-5 sm:p-1 leading-7 mb-3 text-darkgray">
      {readMore ? (
        <>
          <article
            ref={ref}
            className="article article--main relative leading-8 overflow-hidden transition-all max-h-0 duration-200 py-4"
            id="more-content"
            style={{ maxHeight: expanded ? `${expanded}px` : '5.25rem' }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {expanded === null && (
            <button
              type="button"
              id="btn-show-more"
              className="link--primary inline-block mt-2 cursor-pointer bg-transparent border-0 p-0"
              onClick={() => setExpanded(ref.current?.scrollHeight ?? 0)}
            >
              {t('pages.products.read_more')}
            </button>
          )}
        </>
      ) : (
        <article className="article--main pb-1" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  );
}

const setIconShape = (el: HTMLElement | null) => el?.setAttribute('shape', 'icon');

const CART_PLUS_ICON =
  'M18 13.25a.75.75 0 0 1 .75.75v3.25H22a.75.75 0 0 1 0 1.5h-3.25V22a.75.75 0 0 1-1.5 0v-3.25H14a.75.75 0 0 1 0-1.5h3.25V14a.75.75 0 0 1 .75-.75m-6.5-12c2.878 0 5.25 2.268 5.25 5.113v.81q.64.217 1.168.574c1.124.762 1.766 1.953 2.293 3.513a.75.75 0 0 1-1.422.48c-.494-1.46-1-2.268-1.713-2.752-.726-.492-1.8-.738-3.647-.738H9.65c-1.917 0-3.07.25-3.872.822-.792.567-1.378 1.55-1.903 3.373-.49 1.704-.842 2.927-1.014 3.887-.17.953-.14 1.542.042 2.009a3.6 3.6 0 0 0 1.316 1.652c.571.395 1.717.747 3.26.976 1.506.224 3.277.316 5 .27a.75.75 0 0 1 .04 1.498c-1.796.05-3.655-.046-5.261-.285-1.57-.233-3.017-.619-3.893-1.225a5.1 5.1 0 0 1-1.86-2.343c-.328-.842-.31-1.753-.12-2.816.186-1.046.56-2.344 1.036-3.996l.013-.043c.555-1.926 1.263-3.312 2.472-4.176.406-.29.853-.51 1.343-.673v-.817c0-2.845 2.373-5.113 5.25-5.113m1 9a.75.75 0 0 1 0 1.5h-2a.75.75 0 0 1 0-1.5zm-1-7.5c-2.093 0-3.75 1.64-3.75 3.613v.49a16 16 0 0 1 1.9-.103h3.779q.99-.002 1.821.098v-.485c0-1.974-1.657-3.613-3.75-3.613';

/**
 * Port of `sub_content.twig` (`qekey_mini_bit`) + product.js `V__sticky`: the bar
 * slides up as soon as the page scrolls, and the close button hides it.
 */
function StickyProductBar({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  if (closed) return null;

  const image =
    (product as { image?: { url?: string } }).image?.url || product.images?.[0]?.url || undefined;
  const notify = product.notify_availability;

  return (
    <div
      id="custom_product_view"
      className={`z-50 transition-all duration-150 custom-product-view fixed bottom-0 left-1/2 -translate-x-1/2 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="center-between bg-primary-l text-white p-3 w-full rounded-theme  max-w-100">
        <button type="button" className="closeStickyBtn" aria-label={t('common.elements.close')} onClick={() => setClosed(true)} />
        <div className="flex-center bg-primary-reverse">
          <img
            src={image}
            alt={product.name}
            className="w-12 h-12 md:w-14 md:h-14 object-contain"
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex-1 text-start px-3">
          <p className="text-sm font-bold text-white line-clamp-1">{product.name}</p>
          <div className="flex whitespace-nowrap gap-4 items-center">
            <div
              className={`${product.is_on_sale ? '' : 'hidden'} price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap`}
            >
              <h2 className="total-price text-price font-bold md:text-xl text-lg inline-block">
                {format(product.sale_price ?? undefined)}
              </h2>
              <span className="before-price text-mediumgray line-through opacity-85 font-semibold text-sm">
                {format(product.regular_price)}
              </span>
            </div>
            <div className={`gap-4 ${product.is_on_sale ? 'hidden' : 'flex'}`}>
              {product.starting_price ? <span>{t('pages.products.starting_price')}</span> : null}
              <h2 className="total-price font-bold md:text-xl text-lg inline-block">
                {format(product.starting_price || product.price)}
              </h2>
            </div>
          </div>
        </div>
        <salla-add-product-button
          {...(product.is_require_shipping ? { 'required-shipping': true } : {})}
          {...(product.has_preorder_campaign ? { 'has-pre-order': true } : {})}
          amount={
            typeof product.base_currency_price === 'object'
              ? product.base_currency_price?.amount
              : product.base_currency_price
          }
          className="translate-y-0"
          product-status={product.status}
          product-type={product.type}
          product-id={product.id}
          loader-position="center"
          // Twig `shape="icon"`; not in the element's typings, and the component
          // copies host attributes onto its inner salla-button.
          ref={setIconShape}
          {...(notify
            ? {
                ...(notify.subscribed ? { 'is-subscribed': true } : {}),
                channels: (notify.channels ?? []).join(','),
                'subscribed-options': JSON.stringify(notify.subscribed_options ?? []),
                ...(notify.options ? { 'notify-options-availability': true } : {}),
              }
            : {})}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
            <path fill="#fff" d={CART_PLUS_ICON} />
          </svg>
        </salla-add-product-button>
      </div>
    </div>
  );
}

type ProductTab = 'info' | 'desc' | 'table' | 'rating';

const TABS: { id: ProductTab; label: string }[] = [
  { id: 'info', label: 'blocks.appBanner.product_info' },
  { id: 'desc', label: 'blocks.appBanner.product_details' },
  { id: 'table', label: 'blocks.appBanner.product_features' },
  { id: 'rating', label: 'blocks.appBanner.product_reviews' },
];

/**
 * Theme fork of the engine `ProductPage` (wired in from
 * `app/routes/$slug.p$id.tsx`).
 *
 * Implements View's exact tabbed interface (`V__tabs`, `V__btn`),
 * specifications table (`container_table`), sticky bar (`custom_product_view`),
 * and animated transitions.
 */
export function ProductPage({ product: initialProduct, page }: ProductPageProps) {
  const { theme, store } = useTwilight();
  const { t } = useTranslation();
  const { product } = useProduct(initialProduct);
  const { commentsKey } = useComments();
  const blockScope = useMemo(() => ({ product_id: product.id }), [product.id]);

  const [activeTab, setActiveTab] = useState<ProductTab>('info');
  const [slideDirection, setSlideDirection] = useState<'slideInFromRight' | 'slideInFromLeft'>(
    'slideInFromRight'
  );

  const showRating = Boolean(store.settings?.rating?.show_on_product);
  // product.js `V__tabs`: slide in from the side of the tab clicked.
  const handleTabClick = (tab: ProductTab, index: number) => {
    const currentIndex = TABS.findIndex((item) => item.id === activeTab);
    setSlideDirection(index > currentIndex ? 'slideInFromRight' : 'slideInFromLeft');
    setActiveTab(tab);
  };
  const tabClass = (tab: ProductTab, name: string) => (activeTab === tab ? `${name} active` : name);
  const tabStyle = (tab: ProductTab) =>
    activeTab === tab ? { animationName: slideDirection } : undefined;

  useEffect(() => {
    const salla = window.salla;
    if (!salla?.config?.set) return;
    if (salla.config.get('user.can_comment') != null) return;
    const canComment = salla.config.get('store.settings.product.user_can_comment');
    if (typeof canComment !== 'boolean') return;
    salla.config.set('user', { ...(salla.config.get('user') || {}), can_comment: canComment });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage?.removeItem('breadcrumb-referrer');
    } catch {
      /* sessionStorage unavailable (private mode) */
    }
  }, []);

  return (
    <Fragment key={product.id}>
      <BlockHookSlot
        name="product.single.before_product_info"
        wrapper="s-before-product-info"
        className="!mt-0"
        scope={blockScope}
      />

      <div className="container">
        {theme?.settings?.product_show_breadcrumbs !== false && <Breadcrumb page={page} />}

        {/* single.twig (`product_card_pic: main`): the tabs switch only the content
            column; the gallery stays beside it. */}
        <ul className="V__tabs V__btn" role="tablist">
          {TABS.filter((tab) => tab.id !== 'rating' || showRating).map((tab, index) => (
            <li
              key={tab.id}
              role="presentation"
              className={['i', tab.id === 'rating' && 'rating_tab', activeTab === tab.id && 'active']
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`tabpanel-${tab.id}`}
                className="w-full h-full bg-transparent border-0 p-0 block cursor-pointer"
                onClick={() => handleTabClick(tab.id, index)}
              >
                <span>{t(tab.label)}</span>
              </button>
            </li>
          ))}
        </ul>

        <HookSlot name="product:start" />

        <div
          className={`flex flex-col lg:flex-row items-start gap-3${(theme.settings as Record<string, unknown>).remove_related_p_in_pp ? " remove_related_products_btn" : ""}`}
          id={`product-${product.id}`}
        >
          <ProductGallery product={product} />

          <div className="main-content lg:overflow-hidden w-full lg:w-2/4 lg:pb-16">
            <HookSlot name="product:single.description.start" />
            <div className="V__tabs_content">
              <div
                id="tabpanel-info"
                role="tabpanel"
                aria-labelledby="tab-info"
                className={tabClass('info', 'imformation')}
                style={tabStyle('info')}
              >
                <HookSlot name="product:details.start" />
                <ProductDetails
                  product={initialProduct}
                  sku={product.sku}
                  barcode={product.barcode}
                  showTags={theme.settings.show_tags}
                />
                <HookSlot name="product:details.end" />

                <HookSlot name="product:single.form.start" />
                <AddToCartForm product={product} stickyAddToCart={theme.settings.sticky_add_to_cart} />
                <HookSlot name="product:single.form.end" />
              </div>
              <div
                id="tabpanel-desc"
                role="tabpanel"
                aria-labelledby="tab-desc"
                className={tabClass('desc', 'desc')}
                style={tabStyle('desc')}
              >
                <ProductDescription product={product} />
              </div>
              <div
                id="tabpanel-table"
                role="tabpanel"
                aria-labelledby="tab-table"
                className={tabClass('table', 'table')}
                style={tabStyle('table')}
              >
                <ProductFeaturesTable product={product} />
              </div>
              <div
                id="tabpanel-rating"
                role="tabpanel"
                aria-labelledby="tab-rating"
                className={tabClass('rating', 'rating')}
                style={tabStyle('rating')}
              >
                {showRating && (
                  <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
                )}
              </div>
            </div>
            <HookSlot name="product:single.description.end" context={{ product }} />
            <PageBlocks hook="product:single.description.end" scope={blockScope} />

            <SallaQuickOrder className="mt-5 md:-mb-2 block" />
          </div>
        </div>

        <SallaOffer />
      </div>

      <BlockHookSlot
        name="product.single.before_customer_reviews"
        wrapper="s-before-reviews"
        scope={blockScope}
      />

      <BlockHookSlot
        name="product.single.before_product_recommendations"
        wrapper="s-before-related"
        scope={blockScope}
      />

      <RelatedProducts productId={product.id} title={t('pages.products.similar_products', t('pages.products.related_products'))} />

      <BlockHookSlot
        name="product.single.after_product_recommendations"
        wrapper="s-after-related"
        scope={blockScope}
      />

      <HookSlot name="product:end" />

      {/* Sticky add to cart bar */}
      {theme.settings.sticky_add_to_cart !== false && <StickyProductBar product={product} />}
    </Fragment>
  );
}
