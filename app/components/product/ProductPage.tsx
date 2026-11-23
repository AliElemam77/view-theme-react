import { Fragment, useEffect, useMemo, useState } from 'react';
import { SallaQuickOrder } from '@salla.sa/twilight-components-react/quick-order';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { SallaComments } from '@salla.sa/twilight-components-react/comments';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { Breadcrumb, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { PageBlocks } from '@salla.sa/twilight-theme-engine/home';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductGallery } from './ProductGallery';
import { ProductDetails } from './ProductDetails';
import { AddToCartForm } from './AddToCartForm';
import { BlockHookSlot } from '../common';
import { ProductsSlider } from '../home';

/**
 * "Similar products" slider. A separate component (not inline in
 * `ProductPage`) so `relatedCount` lives *inside* the product's keyed
 * `<Fragment>` and resets for free on every product → product navigation,
 * instead of needing a `useEffect` to reset it by hand.
 */
function RelatedProducts({ productId, title }: { productId: number; title: string }) {
  const [relatedCount, setRelatedCount] = useState<number | null>(null);
  
  return (
    <>
      <HookSlot name="product:related.start" />
      {relatedCount !== 0 && (
        <RenderWhenVisible estimatedHeight="0px">
          <div className="container">
            <ProductsSlider
              data={{
                products: { source: 'related', source_value: productId },
                title,
                display_all_url: '',
              }}
              onResolve={setRelatedCount}
            />
          </div>
        </RenderWhenVisible>
      )}
      <HookSlot name="product:related.end" />
    </>
  );
}

/** Product features specifications table matching View Twig table_bit */
function ProductFeaturesTable({ product }: { product: Product }) {
  const { t } = useTranslation();
  const options = (product.options || []) as Array<{
    type?: string;
    details?: Array<{ name?: string }>;
  }>;
  const colorOptions = options.filter((o) => o.type === 'color');
  const sizeOptions = options.filter((o) => o.type === 'single-option');

  return (
    <div className="overflow-x-auto bg-white rounded-theme border border-gray-100 p-4 shadow-sm my-4">
      <table className="container_table w-full">
        <tbody>
          {product.name && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                {t('pages.cart.nameTap', 'Product Name')}
              </th>
              <td className="py-3 px-4 text-start">{product.name}</td>
            </tr>
          )}
          {product.brand?.name && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                {t('pages.cart.brandTap', 'Brand')}
              </th>
              <td className="py-3 px-4 text-start">{product.brand.name}</td>
            </tr>
          )}
          {product.sku && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                <i className="sicon-barcode me-1.5" />
                {t('pages.products.sku', 'SKU')}
              </th>
              <td className="py-3 px-4 text-start font-mono text-primary">{product.sku}</td>
            </tr>
          )}
          {product.weight && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                {t('pages.products.weight', 'Weight')}
              </th>
              <td className="py-3 px-4 text-start">{product.weight}</td>
            </tr>
          )}
          {colorOptions.length > 0 && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                {t('pages.cart.colorTap', 'Colors')}
              </th>
              <td className="py-3 px-4 text-start">
                {colorOptions
                  .flatMap((o) => o.details || [])
                  .map((d) => d.name)
                  .filter(Boolean)
                  .join(' | ')}
              </td>
            </tr>
          )}
          {sizeOptions.length > 0 && (
            <tr className="border-b border-gray-100">
              <th className="font-semibold text-primary-d py-3 px-4 text-start w-1/3">
                {t('pages.cart.sizeTap', 'Sizes')}
              </th>
              <td className="py-3 px-4 text-start">
                {sizeOptions
                  .flatMap((o) => o.details || [])
                  .map((d) => d.name)
                  .filter(Boolean)
                  .join(' | ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Product description tab matching View Twig description_bit */
function ProductDescription({ description }: { description?: string }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;

  return (
    <div className="product__description p-4 sm:p-6 bg-white rounded-theme border border-gray-100 shadow-sm leading-8 text-darkgray my-4">
      <article
        className={`article article--main transition-all duration-300 ${
          expanded ? 'max-h-none' : 'max-h-96 overflow-hidden relative'
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: description }} />
        {!expanded && (
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </article>
      <button
        type="button"
        className="link--primary inline-block mt-3 font-semibold text-sm cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded
          ? t('pages.products.read_less', 'Show less')
          : t('pages.products.read_more', 'Read more')}
      </button>
    </div>
  );
}

/** Sticky bottom bar matching View custom_product_view */
function StickyProductBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (closed) return null;

  const imgSrc =
    product.images?.[0]?.url ||
    (product as { main_image?: string })?.main_image ||
    (product as { thumbnail?: string })?.thumbnail ||
    '';

  const priceValue =
    typeof product.price === 'object' && product.price
      ? (product.price as { amount: number }).amount
      : product.price;

  return (
    <aside
      id="custom_product_view"
      aria-label="Sticky product summary"
      className={`z-50 transition-all duration-300 custom-product-view fixed bottom-4 start-1/2 -translate-x-1/2 w-full max-w-lg px-4 ${
        visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between bg-primary-l text-white p-3 w-full rounded-theme shadow-xl gap-3 relative">
        <button
          type="button"
          className="closeStickyBtn"
          aria-label="Close sticky bar"
          onClick={() => setClosed(true)}
        />
        {imgSrc && (
          <div className="flex items-center justify-center bg-primary-reverse rounded overflow-hidden shrink-0 w-12 h-12 md:w-14 md:h-14">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain"
              width={56}
              height={56}
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 text-start px-2 min-w-0">
          <p className="text-sm font-bold text-white truncate">{product.name}</p>
          <div className="flex items-center gap-2 text-xs">
            {product.is_on_sale ? (
              <>
                <span className="text-price font-bold">
                  {typeof product.sale_price === 'object' && product.sale_price
                    ? (product.sale_price as { amount: number }).amount
                    : String(product.sale_price || '')}
                </span>
                <span className="text-gray-300 line-through">
                  {typeof product.regular_price === 'object' && product.regular_price
                    ? (product.regular_price as { amount: number }).amount
                    : String(product.regular_price || '')}
                </span>
              </>
            ) : (
              <span className="font-bold text-white">
                {priceValue != null ? String(priceValue) : ''}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <salla-add-product-button
            product-id={product.id}
            product-status={product.status}
            product-type={product.type}
            loader-position="center"
          />
        </div>
      </div>
    </aside>
  );
}

type ProductTab = 'info' | 'desc' | 'table' | 'rating';

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

  const handleTabClick = (tab: ProductTab, index: number) => {
    const tabOrder: ProductTab[] = ['info', 'desc', 'table', 'rating'];
    const currentIndex = tabOrder.indexOf(activeTab);
    setSlideDirection(index >= currentIndex ? 'slideInFromRight' : 'slideInFromLeft');
    setActiveTab(tab);
  };

  useEffect(() => {
    const salla = window.salla;
    if (!salla?.config?.set) return;
    if (salla.config.get('user.can_comment') != null) return;
    const canComment = salla.config.get('store.settings.product.user_can_comment');
    if (typeof canComment !== 'boolean') return;
    salla.config.set('user', { ...(salla.config.get('user') || {}), can_comment: canComment });
  }, []);

  useState(() => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage?.removeItem('breadcrumb-referrer');
    } catch {
      /* sessionStorage unavailable (private mode) */
    }
  });

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

        {/* View theme tabs header */}
        <ul className="V__tabs V__btn my-4 flex border-b-2 border-primary gap-1.5 md:gap-3">
          <li
            className={`i cursor-pointer relative ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => handleTabClick('info', 0)}
          >
            <span className="md:px-7 md:py-3 py-2 px-3.5 block font-medium">
              {t('blocks.appBanner.product_info', 'معلومات المنتج')}
            </span>
          </li>
          <li
            className={`i cursor-pointer relative ${activeTab === 'desc' ? 'active' : ''}`}
            onClick={() => handleTabClick('desc', 1)}
          >
            <span className="md:px-7 md:py-3 py-2 px-3.5 block font-medium">
              {t('blocks.appBanner.product_details', 'تفاصيل المنتج')}
            </span>
          </li>
          <li
            className={`i cursor-pointer relative ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => handleTabClick('table', 2)}
          >
            <span className="md:px-7 md:py-3 py-2 px-3.5 block font-medium">
              {t('blocks.appBanner.product_features', 'المميزات / الخصائص')}
            </span>
          </li>
          {store.settings?.rating?.show_on_product && (
            <li
              className={`i rating_tab cursor-pointer relative ${activeTab === 'rating' ? 'active' : ''}`}
              onClick={() => handleTabClick('rating', 3)}
            >
              <span className="md:px-7 md:py-3 py-2 px-3.5 block font-medium">
                {t('blocks.appBanner.product_reviews', 'آراء العملاء')}
              </span>
            </li>
          )}
        </ul>

        <HookSlot name="product:start" />

        {/* Tab 1: Product Info */}
        <div className={activeTab === 'info' ? 'block' : 'hidden'}>
          <div className="flex flex-col items-start md:flex-row" id={`product-${product.id}`}>
            <ProductGallery product={product} />

            <div className="main-content md:sticky md:overflow-hidden md:top-24 w-full md:w-2/4 md:pb-16">
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
              <HookSlot name="product:single.description.end" context={{ product }} />
              <PageBlocks hook="product:single.description.end" scope={blockScope} />

              <SallaQuickOrder className="mt-5 md:-mb-2 block" />
            </div>
          </div>
        </div>

        {/* Tab 2: Product Description */}
        <div
          className={activeTab === 'desc' ? 'block' : 'hidden'}
          style={activeTab === 'desc' ? { animation: `${slideDirection} 0.4s both` } : undefined}
        >
          <ProductDescription description={product.description} />
        </div>

        {/* Tab 3: Features Specifications Table */}
        <div
          className={activeTab === 'table' ? 'block' : 'hidden'}
          style={activeTab === 'table' ? { animation: `${slideDirection} 0.4s both` } : undefined}
        >
          <ProductFeaturesTable product={product} />
        </div>

        {/* Tab 4: Customer Reviews in-tab view */}
        {store.settings?.rating?.show_on_product && (
          <div
            className={activeTab === 'rating' ? 'block' : 'hidden'}
            style={activeTab === 'rating' ? { animation: `${slideDirection} 0.4s both` } : undefined}
          >
            <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
          </div>
        )}

        <SallaOffer />
      </div>

      <BlockHookSlot
        name="product.single.before_customer_reviews"
        wrapper="s-before-reviews"
        scope={blockScope}
      />

      {/* Main page customer reviews section (always rendered at bottom when enabled) */}
      {store.settings?.rating?.show_on_product && activeTab !== 'rating' && (
        <RenderWhenVisible estimatedHeight="0px" className="s-block--full-bg">
          <SallaComments key={commentsKey} itemId={product.id} type={'product' as never} />
        </RenderWhenVisible>
      )}

      <BlockHookSlot
        name="product.single.before_product_recommendations"
        wrapper="s-before-related"
        scope={blockScope}
      />

      <RelatedProducts productId={product.id} title={t('pages.products.similar_products')} />

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
