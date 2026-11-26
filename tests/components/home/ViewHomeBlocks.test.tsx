import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import {
  ViewFeaturedProducts,
  featuredStyle,
  viewFeaturedProductsConfig,
} from '../../../app/components/home/ViewFeaturedProducts';
import { EnhancedSquareBanners } from '../../../app/components/home/EnhancedSquareBanners';
import { photosSliderConfig } from '../../../app/components/home/ViewPhotosSlider';

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: ({ product, layout }: { product: { name?: string }; layout?: string }) => (
    <div data-testid="card" data-layout={layout ?? 'vertical'}>
      {product.name}
    </div>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, className, onClick }: { children?: React.ReactNode; className?: string; onClick?: () => void }) => (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, style }: { to?: string; children?: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <a href={to} className={className} style={style}>
      {children}
    </a>
  ),
}));

const products = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `P${i + 1}` }));

describe('featured-products (featured-products-styleN.twig)', () => {
  it('reads the Twig file suffix and the semantic names', () => {
    expect(featuredStyle('style1')).toBe(1);
    expect(featuredStyle('tabs')).toBe(2);
    expect(featuredStyle('grid')).toBe(3);
    expect(featuredStyle(undefined)).toBe(1);
  });

  it('wraps each style in its Twig section classes', () => {
    expect(viewFeaturedProductsConfig.className({ view_style: 'style1' })).toContain('s-block--special-products container');
    const style2 = viewFeaturedProductsConfig.className({ view_style: 'style2', is_slider: true });
    expect(style2).toContain('s-block--tabs-produtcs s-block--full-bg');
    expect(style2).toContain('as-slider');
    expect(style2).not.toContain('bg-gray-100');
    expect(viewFeaturedProductsConfig.className({ view_style: 'style3', items: [{}, {}] })).toContain('two-cols');
  });

  it('style1: the main product as a special card beside four products, tabs always shown', () => {
    const { getAllByTestId, container } = render(
      <ViewFeaturedProducts
        data={{
          view_style: 'style1',
          main_product: { title: 'Offer', product: { id: 99, name: 'Main' } as never },
          items: [{ id: 'a', title: 'A', products: products(6) as never }],
        }}
      />
    );
    const cards = getAllByTestId('card');
    expect(cards[0].getAttribute('data-layout')).toBe('special');
    expect(cards).toHaveLength(5);
    expect(container.querySelectorAll('.tab-trigger').length).toBe(2);
  });

  it('style3: a full-image card beside three minimal cards', () => {
    const { getAllByTestId } = render(
      <ViewFeaturedProducts
        data={{
          view_style: 'style3',
          items: [{ id: 'a', title: 'A', featured_product: { id: 9, name: 'F' } as never, products: products(5) as never }],
        }}
      />
    );
    const layouts = getAllByTestId('card').map((c) => c.getAttribute('data-layout'));
    expect(layouts).toEqual(['fullImage', 'minimal', 'minimal', 'minimal']);
  });
});

describe('enhanced-square-banners / photos-slider wrappers', () => {
  it('puts three banners in one row and more in the two-row grid', () => {
    const banner = { image: 'x.jpg', title: 'T', url: '/x' };
    const three = render(<EnhancedSquareBanners data={{ banners: [banner, banner, banner] }} />);
    expect(three.container.firstElementChild?.className).toContain('md:grid-cols-3');
    expect(three.container.querySelector('.banner-entry')?.className).toContain('h-lg-banner');
    three.unmount();
    const five = render(<EnhancedSquareBanners data={{ banners: Array(5).fill(banner) }} />);
    expect(five.container.firstElementChild?.className).toContain('two-row');
    expect(five.container.querySelector('.banner-entry')?.className).toContain('has-overlay');
  });

  it('marks a repeated photos slider', () => {
    expect(photosSliderConfig.className({ is_repeated: true })).toBe('s-block s-block--photos-slider repeated-block');
  });
});
