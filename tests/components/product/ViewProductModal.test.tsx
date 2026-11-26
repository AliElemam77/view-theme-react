import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act, waitFor } from '@testing-library/react';
import { ViewProductModal } from '../../../app/components/product/ViewProductModal';
import { openQuickView, openRelatedProducts } from '../../../app/components/product/productModals';

const translations: Record<string, string> = {
  'pages.products.quick_view': 'نظرة سريعة',
  'pages.products.related_products': 'منتجات مشابهة',
  'pages.products.sold': 'تم شراؤه',
  'pages.products.sold_times':
    '{1} <span>مرة واحدة</span>|{2} <span>مرتان</span>|[3,10] <span>:count</span> مرات|[11,*] <span>:count</span> مرة',
  'pages.products.calories': 'سعرة حرارية',
  'pages.products.no_images': 'لا توجد صور متاحة',
  'pages.products.no_description': 'لا يوجد وصف متاح',
  'pages.products.add_to_wishlist': 'أضف إلى قائمة الأمنيات',
  'pages.cart.add_to_cart': 'أضف للسلة',
  'pages.products.sku': 'رمز المنتج',
  'pages.products.tax_included': 'شامل الضريبة',
  'pages.products.quantity': 'الكمية',
  'pages.products.price': 'السعر',
  'blocks.header.close': 'إغلاق',
};

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { items: [] }, isLoading: false }),
}));
vi.mock('@salla.sa/twilight-components-react/slider', () => ({
  SallaSlider: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ children }: { children?: React.ReactNode }) => <button type="button">{children}</button>,
}));
vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, ariaLabel }: { children?: React.ReactNode; ariaLabel?: string }) => (
    <button type="button" aria-label={ariaLabel}>
      {children}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/product-options', () => ({
  SallaProductOptionsCore: () => null,
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, fb?: string) => translations[key] ?? fb ?? key,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (v: unknown) => `SAR ${v}` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: () => false, toggle: vi.fn() }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useHostAttributes', () => ({
  useHostAttributes: () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useDocumentClass', () => ({
  useDocumentClass: () => undefined,
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to?: string; children?: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { queries: { list: () => ({ queryKey: ['related'], queryFn: async () => ({ items: [] }) }) } },
}));
vi.mock('../../../app/hooks/useViewSettings', () => ({
  useViewSettings: () => ({ settings: {} }),
}));
vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: () => null,
  useCardSettings: () => ({ cartIcon: 'sicon-cart2' }),
}));

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  delete (window as unknown as { salla?: unknown }).salla;
});

describe('ViewProductModal translations', () => {
  it('renders localized quick-view title, formatted plural sold_times, and translated fallbacks', async () => {
    (window as unknown as { salla: unknown }).salla = {
      product: {
        getDetails: vi.fn().mockResolvedValue({
          data: {
            id: 10,
            name: 'Test Product',
            url: '/p/10',
            status: 'sale',
            type: 'product',
            price: 50,
            images: [],
            calories: '120',
            sold_quantity: 2,
          },
        }),
      },
    };

    const { container } = render(<ViewProductModal />);

    await act(async () => {
      openQuickView(10);
    });

    await waitFor(() => {
      expect(container.textContent).toContain('Test Product');
    });

    expect(container.querySelector('.modal-title h2')?.textContent).toBe('نظرة سريعة');
    expect(container.textContent).toContain('تم شراؤه مرتان');
    expect(container.textContent).not.toContain('<span>');
    expect(container.textContent).not.toContain('{1}');
    expect(container.textContent).not.toContain('pages.desciption.appBanner');
    expect(container.textContent).toContain('سعرة حرارية');
    expect(container.textContent).toContain('لا توجد صور متاحة');
    expect(container.textContent).toContain('لا يوجد وصف متاح');
  });

  it('renders localized related products title', async () => {
    const { container } = render(<ViewProductModal />);

    await act(async () => {
      openRelatedProducts(10);
    });

    expect(container.querySelector('.modal-title h2')?.textContent).toBe('منتجات مشابهة');
    expect(container.textContent).not.toContain('pages.products.related_products');
  });

  it('exposes accessible dialog attributes, real stock quantity, and submits cart.addItem', async () => {
    const onSubmit = vi.fn();
    (window as unknown as { salla: unknown }).salla = {
      form: { onSubmit },
      product: {
        getDetails: vi.fn().mockResolvedValue({
          data: {
            id: 11,
            name: 'Zero Stock Product',
            url: '/p/11',
            status: 'sale',
            type: 'product',
            price: 75,
            quantity: 0,
            can_show_remained_quantity: true,
            images: [],
          },
        }),
      },
    };

    const { container } = render(<ViewProductModal />);
    await act(async () => {
      openQuickView(11);
    });
    await waitFor(() => {
      expect(container.textContent).toContain('Zero Stock Product');
    });

    const dialog = container.querySelector('#modal-container')!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe(container.querySelector('.modal-title h2')?.id);
    expect(container.textContent).toContain('pages.products.remained 0');
    expect(container.textContent).not.toContain('pages.products.remained 15');

    const form = container.querySelector('form.product-form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toBe('cart.addItem');
  });
});
