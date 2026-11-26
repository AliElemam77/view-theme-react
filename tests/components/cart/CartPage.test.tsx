import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { CartPage } from '../../../app/components/cart/CartPage';

const makeCart = () => ({
  id: 5,
  items: [
    {
      id: 1,
      product_id: 2,
      product_name: 'Product',
      product_image: '',
      url: '/p2',
      quantity: 1,
      price: 10,
      product_price: 10,
      total: 10,
      is_available: true,
    },
  ],
  options: [
    {
      id: 9,
      quantity: 1,
      options: [{ id: 3, name: 'Wrapping', type: 'text', required: true, details: [] }],
    },
  ],
});
let cartData = makeCart();
// Set to make `cart/<id>` fail, as an error response does.
let cartError: Error | null = null;

vi.mock('@salla.sa/twilight-components-react/conditional-offer', () => ({
  SallaConditionalOffer: () => null,
}));
vi.mock('@salla.sa/twilight-components-react/offer', () => ({ SallaOffer: () => null }));
vi.mock('@salla.sa/twilight-components-react/cart-item-offers', () => ({
  SallaCartItemOffers: () => null,
}));
vi.mock('@salla.sa/twilight-components-react/file-upload', () => ({ SallaFileUpload: () => null }));
vi.mock('@salla.sa/twilight-components-react/multiple-bundle-product', () => ({
  SallaMultipleBundleProduct: () => null,
}));
vi.mock('@salla.sa/twilight-components-react/quantity-input', () => ({
  SallaQuantityInputCore: () => <salla-quantity-input />,
}));
vi.mock('@salla.sa/twilight-components-react/cart-coupons', () => ({
  SallaCartCoupons: () => <div data-testid="store-cart-coupons" />,
}));
vi.mock('@salla.sa/twilight-components-react/cart-summary-card', () => ({
  SallaCartSummaryCard: () => <div data-testid="store-cart-summary" />,
}));
vi.mock('@salla.sa/twilight-components-react/loyalty-panel', () => ({
  SallaLoyaltyPanel: (props: { customerPoints?: number; prizePoints?: string }) => (
    <div data-testid="store-cart-loyalty" data-points={props.customerPoints} data-prize={props.prizePoints} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/gifting', () => ({
  SallaGifting: (props: Record<string, unknown>) => (
    <div data-testid="store-cart-gifting" data-physical={String(!!props.physicalProducts)} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/tiered-offer', () => ({
  SallaTieredOffer: () => null,
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: () => null,
  usePageConfig: () => {},
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: unknown) => <b className="money">{String(amount)}</b> }),
}));
vi.mock('@salla.sa/twilight-theme-engine/utils', () => ({
  stripUnsafeHtml: (html: string) => html,
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'pages.cart.free_shipping_alert' ? 'Add :amount more' : key),
    isRTL: true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => null,
  Link: ({ children, className }: { children?: unknown; className?: string }) => (
    <a className={className}>{children as never}</a>
  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/cart', () => ({
  SeoCartWidget: () => null,
}));
let storeSettings: Record<string, unknown> = {};
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ store: { settings: storeSettings }, theme: { settings: {} } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/skeleton', () => ({
  CartSkeleton: () => <div data-testid="skeleton" />,
}));
let loyaltyPoints: number | null = null;
vi.mock('@salla.sa/twilight-theme-engine/api/loyalty', () => ({
  loyalty: { queries: { points: () => ({ queryKey: ['points'], queryFn: () => loyaltyPoints }) } },
}));
vi.mock('@salla.sa/twilight-theme-engine/api/cart', async (importOriginal) => {
  const { cart } =
    await importOriginal<typeof import('@salla.sa/twilight-theme-engine/api/cart')>();
  return {
    cart: {
      ...cart,
      queries: {
        ...cart.queries,
        detail: (id: number) => ({
          queryKey: ['cart', id],
          queryFn: () => {
            if (cartError) throw cartError;
            return cartData;
          },
        }),
      },
    },
  };
});

function renderPage() {
  return render(
    // No retries, so a failed request reaches its error state straight away.
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CartPage page={{} as Page} />
    </QueryClientProvider>
  );
}

describe('CartPage', () => {
  let originalSalla: unknown;
  let getCurrentCartId: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cartData = makeCart();
    cartError = null;
    storeSettings = {};
    loyaltyPoints = null;
    getCurrentCartId = vi.fn(() => Promise.resolve(5));
    originalSalla = (window as { salla?: unknown }).salla;
    (window as { salla?: unknown }).salla = {
      onReady: () => Promise.resolve(),
      cart: { api: { getCurrentCartId } },
      event: { on: vi.fn(), off: vi.fn() },
      product: { getDetails: () => Promise.resolve({ data: { tags: [] } }) },
    };
  });

  afterEach(() => {
    (window as { salla?: unknown }).salla = originalSalla;
  });

  describe('cart id', () => {
    it('reads the cart id only after the SDK is ready', async () => {
      let ready!: () => void;
      const sdkReady = new Promise<void>((resolve) => (ready = resolve));
      (window as unknown as { salla: { onReady: () => Promise<void> } }).salla.onReady = () =>
        sdkReady;

      const { getByTestId, container } = renderPage();
      expect(getByTestId('skeleton')).toBeTruthy();
      expect(getCurrentCartId).not.toHaveBeenCalled();

      ready();
      await waitFor(() => expect(container.querySelector('.cart-options')).toBeTruthy());
      expect(getCurrentCartId).toHaveBeenCalled();
    });

    it('still loads the cart when salla.onReady() rejects', async () => {
      (window as unknown as { salla: { onReady: () => Promise<void> } }).salla.onReady = () =>
        Promise.reject(new Error('partial init'));

      const { container } = renderPage();

      await waitFor(() => expect(container.querySelector('.cart-options')).toBeTruthy());
      expect(getCurrentCartId).toHaveBeenCalled();
    });
  });

  describe('cart options', () => {
    it('renders the raw element with the options attribute, so it shows them instead of fetching', async () => {
      const { container } = renderPage();

      const element = await waitFor(() => {
        const found = container.querySelector('.cart-options form#item-9 salla-product-options');
        expect(found).toBeTruthy();
        return found!;
      });
      expect(element.getAttribute('options')).toBe(JSON.stringify(cartData.options[0].options));
      expect(element.getAttribute('product-id')).toBe('9');
    });

    it('renders no options element for a cart option without fields, like Twig', async () => {
      cartData.options[0].options = [];
      const { container } = renderPage();

      await waitFor(() =>
        expect(container.querySelector('.cart-options form#item-9')).toBeTruthy()
      );
      expect(container.querySelector('salla-product-options')).toBeNull();
    });

    it('renders no cart options block when the cart has none', async () => {
      cartData.options = [];
      const { container } = renderPage();

      await waitFor(() => expect(container.querySelector('.cart-item')).toBeTruthy());
      expect(container.querySelector('.cart-options')).toBeNull();
    });
  });

  describe('when the cart cannot be loaded', () => {
    it('shows an error with a retry instead of the skeleton when the cart request fails', async () => {
      cartError = Object.assign(new Error('Request failed with status code 500'), {
        response: { status: 500 },
      });
      const { getByText, queryByTestId, container } = renderPage();

      await waitFor(() => expect(getByText('common.errors.error_occurred')).toBeTruthy());
      expect(queryByTestId('skeleton')).toBeNull();

      cartError = null;
      fireEvent.click(getByText('common.elements.try_again'));
      await waitFor(() => expect(container.querySelector('.cart-item')).toBeTruthy());
    });

    it('resets the SDK cart and shows the empty cart when the cart is not found (404)', async () => {
      const reset = vi.fn();
      (window as unknown as { salla: { cart: { reset: () => void } } }).salla.cart.reset = reset;
      cartError = Object.assign(new Error('Request failed with status code 404'), {
        response: { status: 404 },
      });
      const { getByTestId, queryByText } = renderPage();

      await waitFor(() =>
        expect(getByTestId('store-cart-empty').querySelector('p')!.textContent).toBe('pages.cart.empty_cart')
      );
      expect(reset).toHaveBeenCalledTimes(1);
      expect(queryByText('common.errors.error_occurred')).toBeNull();
    });

    it('shows the error when the SDK fails to give the cart id', async () => {
      getCurrentCartId.mockImplementation(() => Promise.reject(new Error('no cart id')));
      const { getByText, queryByTestId } = renderPage();

      await waitFor(() => expect(getByText('common.errors.error_occurred')).toBeTruthy());
      expect(queryByTestId('skeleton')).toBeNull();
    });

    it('shows the empty cart, not the skeleton, when the SDK knows of no cart', async () => {
      getCurrentCartId.mockImplementation(() => Promise.resolve(null));
      const { getByTestId, queryByTestId } = renderPage();

      await waitFor(() =>
        expect(getByTestId('store-cart-empty').querySelector('p')!.textContent).toBe('pages.cart.empty_cart')
      );
      expect(queryByTestId('skeleton')).toBeNull();
    });
  });

  describe('Twig layout', () => {
    it('has no column-heading row and a flex-1 main column', async () => {
      const { container } = renderPage();
      await waitFor(() => expect(container.querySelector('.cart-item')).toBeTruthy());
      expect(container.querySelector('.cart-titles')).toBeNull();
      expect(container.querySelector('.main-content')!.className).toBe('main-content flex-1 w-full');
    });

    it('renders the Twig sidebar: gifting on bg-primaryops, the summary card, coupons only when enabled', async () => {
      const { container, getByTestId, queryByTestId } = renderPage();
      await waitFor(() => expect(getByTestId('store-cart-summary')).toBeTruthy());
      expect(container.querySelector('#cart-gifting')!.className).toContain('bg-primaryops');
      expect(getByTestId('store-cart-gifting')).toBeTruthy();
      expect(queryByTestId('store-cart-coupons')).toBeNull();
      expect(queryByTestId('store-cart-loyalty')).toBeNull();
      expect(container.querySelector('#free-shipping')).toBeNull();
    });

    it('wraps the coupons in a shadow-default card when the store enables them', async () => {
      storeSettings = { cart: { apply_coupon_enabled: true } };
      const { getByTestId } = renderPage();
      const coupons = await waitFor(() => getByTestId('store-cart-coupons'));
      expect(coupons.parentElement!.className).toBe('shadow-default p-4 rounded-theme mb-5 relative');
    });

    it('shows the loyalty panel on bg-primaryops when the cart has a prize with points', async () => {
      Object.assign(cartData, { loyalty: { prize: { points: 50, title: 'Gift' } } });
      const { getByTestId } = renderPage();
      const panel = await waitFor(() => getByTestId('store-cart-loyalty'));
      expect(panel.getAttribute('data-prize')).toBe('50');
      expect(panel.parentElement!.className).toContain('bg-primaryops');
    });

    it('formats the free-shipping amount as money and flips the trucks in RTL', async () => {
      Object.assign(cartData, {
        free_shipping_bar: { has_free_shipping: false, remaining: 40, percent: 60 },
      });
      const { container } = renderPage();
      const box = await waitFor(() => {
        const found = container.querySelector('#free-shipping');
        expect(found).toBeTruthy();
        return found!;
      });
      expect(box.className).toBe('shadow-default p-4 rounded-theme mb-5 relative');
      expect(box.querySelector('#free-shipping-msg')!.textContent).toBe('Add 40 more');
      expect(box.querySelector('#free-shipping-msg .money')).toBeTruthy();
      expect(box.querySelector('h4')!.className).toContain('text-darkgray');
      expect(box.querySelectorAll('i.sicon-shipping-fast.flip-x')).toHaveLength(2);
      expect((box.querySelector('.progress-bg') as HTMLElement).style.width).toBe('60%');
    });
  });

  describe("other customers' favorites", () => {
    it('lists products sharing a tag with the cart, leaving out what is in it', async () => {
      const fetch = vi.fn(() =>
        Promise.resolve({
          data: [
            { id: 2, name: 'In cart', price: 10 },
            { id: 7, name: 'Related', price: 25 },
          ],
        })
      );
      Object.assign((window as unknown as { salla: Record<string, unknown> }).salla, {
        product: {
          getDetails: () => Promise.resolve({ data: { tags: [{ url: 'https://s.test/tag-11' }] } }),
          fetch,
        },
      });
      const { container, getByText } = renderPage();

      await waitFor(() => expect(getByText('Related')).toBeTruthy());
      expect(fetch).toHaveBeenCalledWith({ source: 'tags', source_value: ['11'] });
      expect(container.querySelector('#related-products-container h3')!.textContent).toBe(
        'pages.cart.rel_you'
      );
      expect(container.querySelectorAll('#products-list .custom-product-view')).toHaveLength(1);
      // One tag, one batch: nothing left to load.
      expect(container.querySelector('#load-more-btn')).toBeNull();
    });
  });
});
