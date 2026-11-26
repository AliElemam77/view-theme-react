import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import type { Landing } from '../../../app/lib/landingPage';

const settings = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
const navigate = vi.hoisted(() => vi.fn());
const fetchMore = vi.hoisted(() => vi.fn());

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    store: { id: 77, name: 'Shop', logo: 'https://cdn/logo.png', api: 'https://api.salla.dev/store/v1/' },
    theme: { settings: settings.current },
    locale: 'ar',
  }),
  useNavigate: () => navigate,
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, onClick, color, className }: Record<string, unknown>) => (
    <button data-color={color as string} className={className as string} onClick={onClick as () => void}>
      {children as React.ReactNode}
    </button>
  ),
}));

vi.mock('@salla.sa/twilight-components-react/count-down', () => ({
  SallaCountDown: ({ date, size, labeled }: Record<string, unknown>) => (
    <div className="count-down" data-date={date as string} data-size={size as string} data-labeled={String(labeled)} />
  ),
}));

vi.mock('@salla.sa/twilight-components-react/reviews', () => ({
  SallaReviews: ({ type }: { type: string }) => <div className="salla-reviews" data-type={type} />,
}));

vi.mock('@salla.sa/twilight-components-react', () => ({
  ProductCardSkeleton: () => null,
  SallaProductsSlider: ({ loader, children, blockTitle }: Record<string, unknown>) => {
    const [items, setItems] = React.useState<unknown[]>([]);
    React.useEffect(() => {
      (loader as () => Promise<{ items: unknown[] }>)().then((r) => setItems(r.items));
    }, [loader]);
    return (
      <div data-testid="slider" data-block-title={blockTitle as string}>
        {items.map((item, i) => (children as (p: unknown, i: number) => React.ReactNode)(item, i))}
      </div>
    );
  },
  SallaProductsList: ({ items, mode, className, itemsClassName, children }: Record<string, unknown>) => (
    <div data-testid="list" data-mode={mode as string} className={`s-products-list ${className as string}`}>
      <div className={`s-products-list-wrapper ${itemsClassName as string}`}>
        {(children as (items: unknown[]) => React.ReactNode)(items as unknown[])}
      </div>
    </div>
  ),
}));

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: ({ product, layout, withoutAddButton, withQuantity, className }: Record<string, unknown>) => {
    const p = product as { id: number; url: string };
    return (
      <div
        className={`card ${(className as string) ?? ''}`}
        data-id={p.id}
        data-url={p.url}
        data-layout={layout as string}
        data-without-add={String(!!withoutAddButton)}
        data-with-quantity={String(!!withQuantity)}
      />
    );
  },
}));

vi.mock('../../../app/lib/landingPage', () => ({ fetchLandingProducts: fetchMore }));

import { LandingPage } from '../../../app/components/pages/LandingPage';

const product = (id: number) => ({ id, name: `P${id}`, url: `https://shop/p${id}` }) as never;

function makeLanding(overrides: Partial<Landing> = {}): Landing {
  return {
    id: 5,
    title: 'Big Sale',
    content: '<p>Two for one</p>',
    product_ids: [1, 2],
    offer_ends_at: null,
    testimonials_type: null,
    show_quantity: false,
    is_slider: false,
    is_expired: false,
    show_store_features: false,
    store_features: [],
    ...overrides,
  };
}

const page = (ids: number[], next: string | null = null) => ({ items: ids.map(product), next });

describe('LandingPage', () => {
  beforeEach(() => {
    settings.current = {};
    navigate.mockReset();
  });

  it('renders the not-found state when there is no landing', () => {
    const { container } = render(<LandingPage landing={null} />);
    const root = container.querySelector('.landing-page.notfound');
    expect(root).toBeTruthy();
    expect(root?.querySelector('header .header-content.container a.header-content-logo img.logo')?.getAttribute('src')).toBe(
      'https://cdn/logo.png'
    );
    expect(root?.querySelector('.header-content-inner h1')?.textContent).toBe('common.errors.404');
    const button = root?.querySelector('.text-center.mt-6 button');
    expect(button?.className).toBe('btn--rounded-full !text-white');
    expect(button?.textContent).toBe('common.elements.back_home');
    (button as HTMLButtonElement).click();
    expect(navigate).toHaveBeenCalledWith('/');
    expect(container.querySelector('salla-mini-checkout-widget')).toBeNull();
    expect(container.querySelector('.hidden.bottom-1')).toBeTruthy();
  });

  it('renders the expired state without products', () => {
    const { container } = render(<LandingPage landing={makeLanding({ is_expired: true })} products={page([1])} />);
    const root = container.querySelector('.landing-page.expired');
    expect(root?.querySelector('h1')?.textContent).toBe('pages.offer.offer_finished');
    expect(root?.querySelector('.header-content-inner p')?.textContent).toBe('pages.offer.offer_expired_message');
    expect(root?.querySelector('button')).toBeTruthy();
    expect(container.querySelector('.card')).toBeNull();
    expect(container.querySelector('salla-mini-checkout-widget')).toBeNull();
  });

  it('renders the offer: header, centred product grid and quick buy', () => {
    const { container } = render(
      <LandingPage
        landing={makeLanding({ offer_ends_at: '2026-12-31 23:59:00', show_quantity: true })}
        products={page([1, 2])}
      />
    );
    const root = container.querySelector('.landing-page.pb-10')!;
    expect(root.querySelector('.header-content-inner h1')?.textContent).toBe('Big Sale');
    expect(root.querySelector('.header-content-inner .landing-page-content')?.innerHTML).toBe('<p>Two for one</p>');
    const offer = root.querySelector('.header-content-offer');
    expect(offer?.querySelector('h3')?.textContent).toBe('pages.offer.offer_remaining_time');
    const countdown = offer?.querySelector('.count-down');
    expect(countdown?.getAttribute('data-date')).toBe('2026-12-31 23:59:00');
    expect(countdown?.getAttribute('data-size')).toBe('lg');
    expect(countdown?.getAttribute('data-labeled')).toBe('true');

    const section = root.querySelector('section.container.overflow-hidden')!;
    expect(section.classList.contains('center-products')).toBe(true);
    expect(section.querySelector('.s-block .s-block__title .right-side h2')?.textContent).toBe('pages.offer.included_products');
    const list = section.querySelector('[data-testid="list"]')!;
    expect(list.classList.contains('vertical-products')).toBe(true);
    expect(list.getAttribute('data-mode')).toBe('static');
    expect(list.querySelector('.s-products-list-wrapper.s-products-list-vertical-cards')).toBeTruthy();

    const cards = list.querySelectorAll('.card');
    expect(cards).toHaveLength(2);
    expect(cards[0].getAttribute('data-url')).toBe('');
    expect(cards[0].getAttribute('data-layout')).toBe('vertical');
    expect(cards[0].getAttribute('data-without-add')).toBe('true');
    expect(cards[0].getAttribute('data-with-quantity')).toBe('true');

    const widget = section.querySelector('.landing-page--quick-buy salla-mini-checkout-widget')!;
    expect(widget.getAttribute('products')).toBe('[1,2]');
    expect(widget.getAttribute('language')).toBe('ar');
    expect(widget.getAttribute('label')).toBe('pages.orders.finish_payment');
    expect(widget.getAttribute('store-id')).toBe('77');
    expect(widget.getAttribute('api')).toBe('https://api.salla.dev/store/v1/');
    expect(widget.getAttribute('class')).toBe('mt-3');

    expect(root.querySelector('.s-block--features')).toBeNull();
    expect(root.querySelector('.s-block--testimonials')).toBeNull();
  });

  it('does not centre more than three products, and loads more when there is a next page', () => {
    settings.current = { vertical_fixed_products: false };
    const { container } = render(
      <LandingPage landing={makeLanding({ product_ids: [1, 2, 3, 4] })} products={page([1, 2, 3, 4], 'next-url')} />
    );
    const section = container.querySelector('.landing-page section.container')!;
    expect(section.classList.contains('center-products')).toBe(false);
    const list = section.querySelector('[data-testid="list"]')!;
    expect(list.classList.contains('horizontal-products')).toBe(true);
    expect(list.getAttribute('data-mode')).toBe('infinite');
  });

  it('uses the products slider when the landing is a slider', async () => {
    const { container } = render(<LandingPage landing={makeLanding({ is_slider: true, product_ids: [1] })} products={page([1])} />);
    const section = container.querySelector('.landing-page section.container')!;
    expect(section.classList.contains('center-products')).toBe(false);
    const slider = section.querySelector('[data-testid="slider"]')!;
    expect(slider.getAttribute('data-block-title')).toBe('pages.offer.included_products');
    await waitFor(() => expect(slider.querySelectorAll('.card.s-products-slider-card')).toHaveLength(1));
    expect(section.querySelector('.s-block__title')).toBeNull();
  });

  it('takes the quick-buy product ids from the loaded products when the details have none', () => {
    const { container } = render(<LandingPage landing={makeLanding({ product_ids: [] })} products={page([8, 9])} />);
    expect(container.querySelector('salla-mini-checkout-widget')?.getAttribute('products')).toBe('[8,9]');
  });

  it('renders store features and testimonials when switched on', () => {
    const { container } = render(
      <LandingPage
        landing={makeLanding({
          show_store_features: true,
          store_features: [{ icon: 'sicon-shipping', title: 'Fast', text: 'Two days' }],
          testimonials_type: 'products',
        })}
        products={page([1])}
      />
    );
    const features = container.querySelector('section.container.overflow-hidden > section.s-block.s-block--features.container')!;
    const item = features.querySelector('.s-block--features__item')!;
    expect(item.querySelector('.feature-icon i')?.className).toBe('sicon-shipping');
    expect(item.querySelector('h2')?.textContent).toBe('Fast');
    expect(item.querySelector('p')?.textContent).toBe('Two days');

    const testimonials = container.querySelector('section.overflow-hidden.bg-gray-50.mt-10 > .container > section.s-block--testimonials');
    expect(testimonials?.querySelector('.salla-reviews')?.getAttribute('data-type')).toBe('products');
  });
});
