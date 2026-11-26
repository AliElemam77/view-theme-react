import React from 'react';
import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ViewFooter } from '../../../app/components/layout/ViewFooter';
import { ThemeModeDropdown } from '../../../app/components/layout/ViewHeaderDropdowns';
import { ViewSearchPanel } from '../../../app/components/layout/ViewSearchPanel';
import { VMixedReviews } from '../../../app/components/home/VMixedReviews';
import { VProductHighlight } from '../../../app/components/home/VProductHighlight';
import { VBlogPosts } from '../../../app/components/home/VBlogPosts';

const themeSettings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { items: [] }, isLoading: false }),
  useQueries: () => [
    {
      data: {
        id: 7,
        name: 'Blog One',
        description: '<p>Summary</p>',
        url: '/blog/post-7',
        created_at: '2026-01-15 10:00:00',
      },
    },
  ],
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    locale: 'ar',
    isRTL: true,
    t: (key: string, fb?: string) => (typeof fb === 'string' ? fb : key),
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({
    theme: { settings: themeSettings.value },
    store: {
      name: 'View Store',
      logo: '/logo.png',
      settings: {
        tax: { number: '30001234', certificate: '/cert.png' },
        blog: { allow_likes_and_comments: false },
      },
    },
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <i data-hook={name} />,
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ isRTL: true, settings: themeSettings.value }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: { blog: { allow_likes_and_comments: false } } }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (v: unknown) => `SAR ${v}` }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useDocumentClass', () => ({
  useDocumentClass: () => undefined,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...props }: Record<string, unknown>) => (
    <a href={String(to ?? '#')} {...props}>
      {children as React.ReactNode}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/modal', () => ({
  ImageModal: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="tax-modal" /> : null),
}));

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      list: () => ({ queryKey: ['products'], queryFn: async () => ({ items: [] }) }),
      detail: (id: unknown) => ({ queryKey: ['product', id], queryFn: async () => null }),
    },
  },
}));

vi.mock('@salla.sa/twilight-theme-engine/api/blog', () => ({
  blog: {
    queries: {
      article: (id: unknown) => ({ queryKey: ['article', id], queryFn: async () => null }),
    },
  },
}));

vi.mock('@salla.sa/twilight-components-react/apps-icons', () => ({ SallaAppsIcons: () => null }));
vi.mock('@salla.sa/twilight-components-react/payments', () => ({ SallaPayments: () => null }));
vi.mock('@salla.sa/twilight-components-react/trust-badges', () => ({ SallaTrustBadges: () => null }));

vi.mock('../../../app/hooks/useViewSettings', () => ({
  useViewSettings: () => ({
    settings: themeSettings.value,
    reveal: '',
    spacing: '',
  }),
}));

vi.mock('../../../app/components/product/ProductCard', () => ({
  ProductCard: () => null,
}));

beforeAll(() => {
  class StubObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = StubObserver as unknown as typeof IntersectionObserver;
});

beforeEach(() => {
  themeSettings.value = {};
});

describe('Storefront audit regression checks', () => {
  it('reads location_action_link in ViewFooter and renders VAT trigger as a semantic button', () => {
    themeSettings.value = {
      location_action: 'https://iframe.example/map',
      location_action_link: 'https://maps.example/branch',
      show_working_hours: true,
    };
    const { container, getByTestId } = render(<ViewFooter />);
    expect(container.querySelector('a[href="https://maps.example/branch"]')).toBeTruthy();
    expect(container.querySelector('a[href="https://iframe.example/map"]')).toBeNull();

    const taxBtn = container.querySelector('button.load-img-onclick') as HTMLButtonElement;
    expect(taxBtn?.type).toBe('button');
    fireEvent.click(taxBtn);
    expect(getByTestId('tax-modal')).toBeTruthy();
  });

  it('uses keyboard-accessible menuitemradio buttons and viewport-safe placement in ThemeModeDropdown', () => {
    themeSettings.value = { enable_dark_mode: true, enable_carbon_mode: true };
    const { container } = render(<ThemeModeDropdown />);
    const list = container.querySelector('#theme-list')!;
    expect(list.className).toContain('rtl:left-0');
    expect(list.className).toContain('ltr:right-0');
    expect(list.className).not.toContain('-left-1/2');
    const items = list.querySelectorAll('button[role="menuitemradio"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('provides a labelled search-title heading and rounded-theme panel in ViewSearchPanel', () => {
    const { container } = render(<ViewSearchPanel open onClose={() => undefined} />);
    const dialog = container.querySelector('[role="dialog"]')!;
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBe('search-title');
    expect(container.querySelector('#search-title')?.textContent).toBeTruthy();
    expect(container.querySelector('.s-search-container')?.className).toContain('rounded-theme');
  });

  it('links VMixedReviews "more" CTA to /testimonials and scopes slider selectors by position', () => {
    const { container } = render(
      <VMixedReviews data={{ position: 3, show_more_testimonials: true, main_title: 'آراء العملاء', items: [] }} />
    );
    expect(container.querySelector('a[href="/testimonials"]')).toBeTruthy();
    const sliderConfig = JSON.parse(
      container.querySelector('salla-slider')?.getAttribute('slider-config') || '{}'
    );
    expect(sliderConfig.navigation.nextEl).toBe('#thumbs_mixed_reviews-3 .swiper-button-next');
    expect(sliderConfig.pagination.el).toBe('#thumbs_mixed_reviews-3 .swiper-pagination');
  });

  it('gives VProductHighlight unique carousel IDs and reuses BlogCard in VBlogPosts', () => {
    const highlight = render(
      <VProductHighlight
        data={{
          position: 2,
          marquee_effect_items: [{ text: 'عرض', discount_value: '20' }],
        }}
      />
    );
    const ids = [...highlight.container.querySelectorAll('salla-slider')].map((el) => el.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids[0]).toBe('carousel-player-2-1-reverse');
    expect(ids[1]).toBe('carousel-player-2-2-standard');
    highlight.unmount();

    const blogBlock = render(
      <VBlogPosts data={{ position: 1, articles: [{ id: 7 }], main_title: 'المدونة' }} />
    );
    expect(blogBlock.container.querySelectorAll('[data-testid="store-blog-article-card"]')).toHaveLength(1);
    expect(blogBlock.container.textContent).toContain('Blog One');
  });
});
