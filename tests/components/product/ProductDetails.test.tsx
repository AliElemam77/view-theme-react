import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductDetails } from '../../../app/components/product/ProductDetails';

const settings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));
const translations = vi.hoisted(() => ({ value: {} as Record<string, string> }));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ locale: 'ar', t: (key: string) => translations.value[key] ?? key }),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    theme: { settings: settings.value },
    store: { logo: 'https://cdn.example/store.png', name: 'Store' },
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ settings: settings.value }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (v: unknown) => `SAR ${v}` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ has: () => false, toggle: vi.fn() }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <div data-hook-slot={name} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to?: string; children?: ReactNode; className?: string }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

beforeAll(() => {
  class VisibleObserver {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb(
        [{ isIntersecting: true, intersectionRatio: 1, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = VisibleObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  settings.value = {};
  translations.value = {};
  cleanup();
});

const makeProduct = (over: Partial<Product> = {}): Product =>
  ({
    id: 7,
    name: 'Oud',
    url: '/oud/p7',
    price: 100,
    regular_price: 120,
    sale_price: 90,
    is_on_sale: true,
    quantity: 12,
    sku: 'SKU-1',
    is_taxable: true,
    description: '<p>Rich&nbsp;oud</p>',
    tags: [
      { id: 1, name: 'new', url: '/t/new' },
      { id: 2, name: 'gift', url: '/t/gift' },
    ],
    category: { name: 'Perfumes', url: '/perfumes' },
    ...over,
  }) as unknown as Product;

describe('ProductDetails (base_content.twig imformation_base)', () => {
  it('shows the store logo beside the title when the product has no brand', () => {
    const { container } = render(<ProductDetails product={makeProduct()} />);
    const row = container.querySelector('h1')?.parentElement;
    expect(row?.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example/store.png');
    expect(container.querySelector('h1')?.textContent).toBe('Oud');
  });

  it('shows the live SKU and the tax note in one row', () => {
    const { container } = render(<ProductDetails product={makeProduct()} sku="LIVE-9" />);
    expect(container.querySelector('.product-sku')?.textContent).toBe('LIVE-9');
    expect(container.textContent).toContain('pages.products.tax_included');
  });

  it('clips the description to 5.25rem, as Twig', () => {
    const { container } = render(<ProductDetails product={makeProduct()} />);
    const article = container.querySelector('#more-content') as HTMLElement;
    expect(article.style.maxHeight).toBe('5.25rem');
    expect(article.innerHTML).toContain('Rich\noud');
  });

  it('prints the sale price in the price colour with the struck regular price', () => {
    const { container } = render(<ProductDetails product={makeProduct()} />);
    expect(container.querySelector('.price_is_on_sale h2')?.className).toContain('text-price');
    expect(container.querySelector('.price_is_on_sale span')?.textContent).toBe('SAR 120');
  });

  it('separates the tags with bars and shows the remained / sold row', () => {
    const { container } = render(<ProductDetails product={makeProduct()} />);
    const tags = [...container.querySelectorAll('a[href^="/t/"]')].map((a) => a.textContent);
    expect(tags).toEqual(['new', 'gift']);
    expect(container.textContent).toContain('pages.products.remained');
    expect(container.textContent).toContain('pages.products.sold');
  });

  it('shows the "related products" button only when mini_category is off', () => {
    settings.value = { mini_category: true };
    const first = render(<ProductDetails product={makeProduct()} />);
    expect(first.container.textContent).not.toContain('blocks.appBanner.related_products');
    first.unmount();
    settings.value = { mini_category: false };
    const second = render(<ProductDetails product={makeProduct()} />);
    expect(second.container.textContent).toContain('blocks.appBanner.related_products');
  });

  it('hides the tags with show_tags off', () => {
    settings.value = { show_tags: false };
    const { container } = render(<ProductDetails product={makeProduct()} showTags={false} />);
    expect(container.querySelector('a[href^="/t/"]')).toBeNull();
  });

  it('formats Salla plural sold_times without exposing raw tags or placeholders', () => {
    translations.value = {
      'pages.products.sold': 'تم شراؤه',
      'pages.products.sold_times':
        '{1} <span>مرة واحدة</span>|{2} <span>مرتان</span>|[3,10] <span>:count</span> مرات|[11,*] <span>:count</span> مرة',
      'pages.products.sold_zero': '0 مرات',
    };

    const cases: Array<[number | undefined, string]> = [
      [0, '0 مرات'],
      [1, 'مرة واحدة'],
      [2, 'مرتان'],
      [5, '5 مرات'],
      [15, '15 مرة'],
    ];

    for (const [sold_quantity, expected] of cases) {
      const { container, unmount } = render(
        <ProductDetails product={makeProduct({ sold_quantity } as Partial<Product>)} />
      );
      expect(container.textContent).toContain(`تم شراؤه ${expected}`);
      expect(container.textContent).not.toContain('<span>');
      expect(container.textContent).not.toContain('{1}');
      unmount();
    }
  });

  it('shows barcode without sku/taxable, preserves multi-word weight, and hides null quantity', () => {
    const { container } = render(
      <ProductDetails
        product={makeProduct({
          sku: '',
          is_taxable: false,
          barcode: 'BAR-777',
          weight: '250 g net',
          quantity: undefined,
        } as Partial<Product>)}
      />
    );
    expect(container.querySelector('.product-barcode')?.textContent).toBe('BAR-777');
    expect(container.textContent).toContain('250');
    expect(container.textContent).toContain('g net');
    expect(container.textContent).not.toContain('pages.products.remained');
  });
});
