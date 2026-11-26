/**
 * Port of View's `pages/landing-page.twig`: a Salla landing ("special offer") page.
 * Rendered by `app/routes/landing-page.tsx` (its loader reads `GET landing/{id}`;
 * see `app/lib/landingPage.ts`). Styles: `04-components/landing-page.scss`, all
 * scoped under the `.landing-page` wrapper Twig renders, as Twig loads them only here.
 *
 * Three states, as in Twig:
 * - no landing (`landing === null`): the not-found header (the route's `notFoundComponent`),
 * - `landing.is_expired`: the offer-finished header,
 * - otherwise: header with the countdown, the offer's products, the quick-buy bar,
 *   and the optional store features and testimonials sections.
 *
 * Product cards: View's card (`product-card.js`) hides its add button on the landing
 * page and shows the quantity badge when `landing.show_quantity` (`window.showQuantity`);
 * the products list blanks each product's URL there, so a card does not open the product.
 */
import { useCallback, useMemo, useRef } from 'react';
import { ProductCardSkeleton, SallaProductsList, SallaProductsSlider } from '@salla.sa/twilight-components-react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaCountDown } from '@salla.sa/twilight-components-react/count-down';
import { SallaReviews } from '@salla.sa/twilight-components-react/reviews';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useNavigate, useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from '../product/ProductCard';
import { booleanValue } from '../../lib/fieldValue';
import { fetchLandingProducts, type Landing, type LandingFeature, type LandingProductsPage } from '../../lib/landingPage';

export interface LandingPageProps {
  /** Null renders Twig's `{% if not landing %}` (not-found) state. */
  landing: Landing | null;
  /** The first page of the offer's products, loaded with the landing. */
  products?: LandingProductsPage;
}

/** `<salla-products-list source="landing-page">` sets `product.url = ''` on every card. */
const withoutUrl = (product: Product): Product => ({ ...product, url: '' });

function HeaderLogo() {
  const { store } = useTwilight();
  return (
    <Link to="/" aria-label={`${store?.name ?? ''} logo`} className="header-content-logo">
      <img
        src={store?.logo}
        width="75"
        height="75"
        alt="logo"
        className="logo lazy"
        loading="lazy"
        decoding="async"
        fetchPriority="auto"
      />
    </Link>
  );
}

function BackHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="text-center mt-6">
      <SallaButton color="primary" className="btn--rounded-full !text-white" onClick={() => navigate('/')}>
        {t('common.elements.back_home', 'Back to Home')}
      </SallaButton>
    </div>
  );
}

/** View's `home/store-features.twig`, which the landing page includes with `{% component %}`. */
function StoreFeatures({ items }: { items: LandingFeature[] }) {
  return (
    <section data-testid="store-home-features" className="s-block s-block--features container">
      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] md:grid-cols-[repeat(3,minmax(0,1fr))] gap-4 sm:gap-6 xl:gap-8">
        {items.map((item, index) => (
          <div key={`${item.icon ?? ''}:${item.title ?? ''}:${index}`} className="s-block--features__item">
            <div className="feature-icon">
              <i className={item.icon}></i>
            </div>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** View's `home/testimonials.twig` with only `type` passed (no limit, sort or display-all). */
function Testimonials({ type }: { type: string }) {
  return (
    <section data-testid="store-home-testimonials" className="s-block s-block--testimonials container overflow-hidden">
      <SallaReviews type={type as 'all' | 'products' | 'store'} />
    </section>
  );
}

function LandingProducts({ landing, products }: { landing: Landing; products: LandingProductsPage }) {
  const { t } = useTranslation();
  const { theme } = useTwilight();
  const isVertical = booleanValue((theme?.settings as Record<string, unknown> | undefined)?.vertical_fixed_products, true);
  const nextRef = useRef<string | null>(products.next);

  const card = useCallback(
    (product: Product, className?: string) => (
      <ProductCard
        key={product.id}
        className={className}
        product={withoutUrl(product)}
        layout="vertical"
        withoutAddButton
        withQuantity={landing.show_quantity}
      />
    ),
    [landing.show_quantity]
  );

  // The slider loads everything it shows at once: the first page, already loaded.
  const sliderLoader = useCallback(async () => products, [products]);

  // The list loads further pages as the customer scrolls, as `<salla-products-list>` does.
  const listLoader = useCallback(async () => {
    const page = await fetchLandingProducts(landing.id, nextRef.current);
    nextRef.current = page.next;
    return page;
  }, [landing.id]);

  if (landing.is_slider) {
    return (
      <SallaProductsSlider
        loader={sliderLoader}
        blockTitle={t('pages.offer.included_products', 'Included Products')}
        sliderProps={{ id: `landing-${landing.id}-slider` }}
      >
        {(product: Product) => card(product, 's-products-slider-card')}
      </SallaProductsSlider>
    );
  }

  return (
    <section className="s-block">
      <div className="s-block__title">
        <div className="right-side">
          <h2>{t('pages.offer.included_products', 'Included Products')}</h2>
        </div>
      </div>
      <SallaProductsList<Product>
        items={products.items}
        loader={listLoader}
        mode={products.next ? 'infinite' : 'static'}
        className={isVertical ? 'vertical-products' : 'horizontal-products'}
        itemsClassName="s-products-list-vertical-cards"
        skeleton={<ProductCardSkeleton />}
        skeletonType="item"
        t={(key, fallback) => t(key, fallback || key)}
      >
        {(items) => items.map((product) => card(product))}
      </SallaProductsList>
    </section>
  );
}

function QuickBuy({ productIds }: { productIds: Array<number | string> }) {
  const { t } = useTranslation();
  const { store, locale } = useTwilight();
  return (
    <div className="landing-page--quick-buy">
      <salla-mini-checkout-widget
        products={`[${productIds.join(',')}]`}
        language={locale}
        label={t('pages.orders.finish_payment', 'Complete Payment')}
        store-id={store?.id != null ? String(store.id) : undefined}
        api={store?.api}
        className="mt-3"
      ></salla-mini-checkout-widget>
    </div>
  );
}

export function LandingPage({ landing, products = { items: [], next: null } }: LandingPageProps) {
  const { t } = useTranslation();

  // `landing.products|map(p => p.id)`; the loaded products when the details carry none.
  const productIds = useMemo(
    () => (landing?.product_ids.length ? landing.product_ids : products.items.map((product) => product.id)),
    [landing, products.items]
  );

  let body;
  if (!landing) {
    body = (
      <div className="landing-page notfound">
        <header>
          <div className="header-content container">
            <HeaderLogo />
            <div className="header-content-inner">
              <h1>{t('common.errors.404', 'Page not found')}</h1>
              <BackHome />
            </div>
          </div>
        </header>
      </div>
    );
  } else if (landing.is_expired) {
    body = (
      <div className="landing-page expired">
        <header>
          <div className="header-content container">
            <HeaderLogo />
            <div className="header-content-inner">
              <h1>{t('pages.offer.offer_finished', 'Offer Finished')}</h1>
              <p>{t('pages.offer.offer_expired_message', 'Sorry, this offer has ended.')}</p>
              <BackHome />
            </div>
          </div>
        </header>
      </div>
    );
  } else {
    const productCount = landing.product_ids.length || products.items.length;
    const centered = productCount <= 3 && !landing.is_slider;
    body = (
      <div className="landing-page pb-10">
        <header>
          <div className="header-content container">
            <HeaderLogo />
            <div className="header-content-inner">
              <h1>{landing.title}</h1>
              {/* Twig: `<p>{{ landing.content|raw }}</p>`. A <div> here: the merchant's HTML holds
                  its own <p>s, which a <p> cannot contain (the browser would split it and break
                  hydration). landing-page.scss styles `> div` like Twig's `> p`. */}
              <div className="landing-page-content" dangerouslySetInnerHTML={{ __html: landing.content }} />
            </div>
            {landing.offer_ends_at && (
              <div className="header-content-offer">
                <h3>{t('pages.offer.offer_remaining_time', 'Time left until the offer ends')}</h3>
                <SallaCountDown date={landing.offer_ends_at} labeled size="lg" />
              </div>
            )}
          </div>
        </header>

        <section className={`container overflow-hidden ${centered ? 'center-products' : ''}`}>
          <LandingProducts landing={landing} products={products} />
          <QuickBuy productIds={productIds} />
        </section>

        {landing.show_store_features && (
          <section className="container overflow-hidden">
            <StoreFeatures items={landing.store_features} />
          </section>
        )}

        {landing.testimonials_type && (
          <section className="overflow-hidden bg-gray-50 dark:bg-darkgray carbon:bg-darkgray mt-10">
            <div className="container">
              <Testimonials type={landing.testimonials_type} />
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <>
      {body}
      <div className="hidden bottom-1"></div>
    </>
  );
}
