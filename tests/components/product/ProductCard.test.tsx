import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { ProductCard } from '../../../app/components/product/ProductCard';
import { PRODUCT_MODAL_EVENT } from '../../../app/components/product/productModals';

const settings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
const storeSettings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
const wishlistState = vi.hoisted(() => ({ ids: [] as number[], toggle: vi.fn() }));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: settings.value }, store: { settings: storeSettings.value } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (v: unknown) => `SAR ${v}` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: (id: number) => wishlistState.ids.includes(id), toggle: wishlistState.toggle }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useHostAttributes', () => ({ useHostAttributes: () => undefined }));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, onClick, className }: { children?: React.ReactNode; onClick?: () => void; className?: string }) => (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ children, productStatus }: { children?: React.ReactNode; productStatus?: string }) => (
    <div data-testid="add-button" data-status={productStatus}>
      {children}
    </div>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/progress-bar', () => ({ SallaProgressBar: () => null }));
vi.mock('../../../app/lib/nativeBooking', () => ({ registerNativeBookingHook: () => undefined }));

const base = {
  id: 42,
  name: 'Oud',
  url: '/oud/p42',
  status: 'sale',
  type: 'product',
  price: 100,
  regular_price: 120,
  sale_price: 90,
  is_on_sale: true,
  quantity: 5,
  image: { url: 'https://cdn.example/oud.jpg', alt: 'Oud' },
  category: { name: 'Perfumes', url: '/perfumes' },
  tags: [{ id: 1, name: 'new', url: '/tags/new' }],
  rating: { stars: 4.5 },
} as never;

beforeEach(() => {
  settings.value = {};
  storeSettings.value = {};
  wishlistState.ids = [];
  cleanup();
});

describe('ProductCard (View custom-salla-product-card)', () => {
  it('renders the Twig card shell: a padded vertical form, image link, loader and side buttons', () => {
    const { container } = render(<ProductCard product={base} />);
    const form = container.querySelector('form.s-product-card-entry');
    expect(form?.className).toContain('s-product-card-vertical');
    expect(form?.className).toContain('p-2');
    expect(container.querySelector('.s-product-card-image.pad.im_ a img')?.getAttribute('src')).toBe(
      'https://cdn.example/oud.jpg'
    );
    expect(container.querySelector('.loading_image .ld')).not.toBeNull();
    // has_rel_pro is on by default, quick view (has_q_view) off.
    expect(container.querySelectorAll('.obts .btn_side')).toHaveLength(2);
  });

  it('shows the discount badge, category, tags and rating with the master.twig defaults', () => {
    const { container } = render(<ProductCard product={base} />);
    expect(container.querySelector('.discount')?.textContent).toContain('%25');
    expect(container.querySelector('.s-product-card-content-main a[href="/perfumes"]')).not.toBeNull();
    expect(container.querySelector('.tags a')?.textContent).toBe('#new');
    expect(container.querySelector('.s-product-card-rating span')?.textContent).toBe('4.5');
    expect(container.querySelector('.s-product-card-sale-price h4')?.textContent).toBe('SAR 90');
  });

  it('follows the card switches: no discount, rating, tags or padding when turned off', () => {
    settings.value = { show_descound: false, none_rating: true, show_card_tags: false, is_padding: false };
    const { container } = render(<ProductCard product={base} />);
    expect(container.querySelector('.discount')).toBeNull();
    expect(container.querySelector('.s-product-card-rating')).toBeNull();
    expect(container.querySelector('.tags')).toBeNull();
    expect(container.querySelector('form')?.className).not.toContain('p-2');
  });

  it('puts the add label and the store cart icon in both swap spans', () => {
    settings.value = { product_cart_icon: 'sicon-shopping-bag' };
    const { getByTestId } = render(<ProductCard product={base} />);
    const spans = getByTestId('add-button').querySelectorAll('span');
    expect(spans[0].className).toContain('btn-text-one');
    expect(spans[1].className).toContain('btn-text-two');
    expect(spans[0].querySelector('i')?.className).toContain('sicon-shopping-bag');
    expect(spans[0].textContent).toContain('pages.cart.add_to_cart');
  });

  it('offers notify-me for an out-of-stock product, and drops it when hiddn_out_of_stock is on', () => {
    const out = { ...(base as object), is_out_of_stock: true, status: 'out' } as never;
    const { getByTestId, unmount } = render(<ProductCard product={out} />);
    expect(getByTestId('add-button').getAttribute('data-status')).toBe('out-and-notify');
    unmount();
    settings.value = { hiddn_out_of_stock: true };
    const { container } = render(<ProductCard product={out} />);
    expect(container.firstChild).toBeNull();
  });

  it('asks the layout modal for the related products of the card', () => {
    const listener = vi.fn();
    window.addEventListener(PRODUCT_MODAL_EVENT, listener);
    const { container } = render(<ProductCard product={base} />);
    fireEvent.click(container.querySelector('.Mws_opsbtn_rel') as Element);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ kind: 'related', productId: 42 });
    window.removeEventListener(PRODUCT_MODAL_EVENT, listener);
  });

  it('uses the horizontal class for the horizontal layout', () => {
    const { container } = render(<ProductCard product={base} layout="horizontal" />);
    const form = container.querySelector('form');
    expect(form?.className).toContain('s-product-card-horizontal');
    expect(form?.className).not.toContain('s-product-card-vertical');
  });

  it('uses valid translation keys for quick view and related products tooltips', () => {
    settings.value = { has_q_view: true, has_rel_pro: true };
    const { container } = render(<ProductCard product={base} />);
    const tooltips = [...container.querySelectorAll('.obts .btn_side')].map((el) => el.getAttribute('tooltip'));
    expect(tooltips).toContain('pages.products.quick_view');
    expect(tooltips).toContain('pages.products.related_products');
    expect(tooltips).not.toContain('pages.products.vuick_view');
  });
});
