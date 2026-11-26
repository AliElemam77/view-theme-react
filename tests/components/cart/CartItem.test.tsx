import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { CartItem as CartItemType } from '@salla.sa/twilight-theme-engine/types';
import { CartItem } from '../../../app/components/cart/CartItem';

let themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (amount: unknown) => String(amount) }),
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: themeSettings } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: { to: string; children?: unknown; className?: string }) => (
    <a href={to} className={className}>
      {children as never}
    </a>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/cart-item-offers', () => ({
  SallaCartItemOffers: () => <div data-testid="item-offers" />,
}));
vi.mock('@salla.sa/twilight-components-react/file-upload', () => ({
  SallaFileUpload: ({ files, cartItemId }: { files?: string; cartItemId?: string }) => (
    <div data-testid="file-upload" data-files={files} data-cart-item-id={cartItemId} />
  ),
}));
vi.mock('@salla.sa/twilight-components-react/multiple-bundle-product', () => ({
  SallaMultipleBundleProduct: () => null,
}));
vi.mock('@salla.sa/twilight-components-react/quantity-input', async () => {
  const { forwardRef } = await import('react');
  return {
    // The host as the real wrapper renders it; the component would add the inner input.
    SallaQuantityInputCore: forwardRef<HTMLElement, { className?: string }>(({ className }, ref) => (
      <salla-quantity-input ref={ref as never} className={className} />
    )),
  };
});

const item = {
  id: '1',
  product_id: 2,
  product_name: 'Product',
  product_image: '/img.png',
  url: '/p2',
  quantity: 1,
  max_quantity: 5,
  price: 10,
  product_price: 10,
  total: 10,
  is_available: true,
  is_hidden_quantity: false,
  type: 'product',
  weight_label: '2 kg',
  can_add_note: false,
  can_upload_file: false,
} as unknown as CartItemType;

beforeEach(() => {
  themeSettings = {};
});

describe('CartItem markup (cart.twig)', () => {
  it('renders the bordered card with the Twig image, name and total', () => {
    const { container } = render(<CartItem item={item} />);
    const section = container.querySelector('form#item-1 > section.cart-item')!;
    expect(section.className).toContain('border-lightgray');
    expect(section.className).toContain('shadow-md');
    const img = section.querySelector('img')!;
    for (const cls of ['w-20', 'h-20', 'border-lightgray', 'bg-primary-reverse', 'rounded-theme', 'aspect-square']) {
      expect(img.classList).toContain(cls);
    }
    expect(section.querySelector('h2.text-darkgray.line-clamp-2')?.textContent).toBe('Product');
    expect(screen.getByTestId('store-cart-item-total').textContent).toBe('10');
    expect(screen.getByText('pages.cart.total:')).toBeTruthy();
  });

  it('labels the weight with a <strong> in the controls row', () => {
    const { container } = render(<CartItem item={item} />);
    const row = container.querySelector('.item-weight-row')!;
    expect(row.querySelector('strong')?.textContent).toBe('pages.products.weight');
    expect(row.querySelector('.item-weight')?.textContent).toBe('2 kg');
    expect(row.closest('.border-t.border-b.border-lightgray')).toBeTruthy();
  });

  it('sets the quantity host attributes the form needs', () => {
    const { container } = render(<CartItem item={item} />);
    const host = container.querySelector('salla-quantity-input')!;
    expect(host.getAttribute('name')).toBe('quantity');
    expect(host.getAttribute('cart-item-id')).toBe('1');
    expect(host.getAttribute('max')).toBe('5');
    expect(host.classList).toContain('flex-1');
  });

  it("shows Twig's out-of-stock key for an unavailable item", () => {
    render(<CartItem item={{ ...item, is_available: false }} />);
    expect(screen.getByTestId('store-cart-item-total').textContent).toBe('pages.cart.out_of_stock');
  });

  it('shows the free ribbon in the price colour only for a free item', () => {
    const { container, rerender } = render(<CartItem item={item} />);
    const ribbon = () => container.querySelector('.free-ribbon')!;
    expect(ribbon().classList).toContain('hidden');
    rerender(<CartItem item={{ ...item, price: 0, has_discount: true }} />);
    expect(ribbon().classList).not.toContain('hidden');
    expect(ribbon().classList).toContain('bg-price');
  });

  it('colours a discounted price with text-price', () => {
    render(<CartItem item={{ ...item, has_discount: true }} />);
    expect(screen.getByTestId('store-cart-item-price').classList).toContain('text-price');
  });

  it('spaces rows with mb-4 except the last one', () => {
    const { container, rerender } = render(<CartItem item={item} />);
    expect(container.querySelector('form')!.className).toBe('mb-4');
    rerender(<CartItem item={item} isLast />);
    expect(container.querySelector('form')!.className).toBe('mb-0');
  });

  it('renders the options element as Twig, and hides it with hide_options_in_cart', () => {
    const options = [{ id: 3, name: 'Size' }];
    const { container, rerender } = render(<CartItem item={{ ...item, options } as never} />);
    const element = container.querySelector('salla-product-options')!;
    expect(element.getAttribute('options')).toBe(JSON.stringify(options));
    expect(element.getAttribute('product-id')).toBe('1');
    expect(element.getAttribute('class')).toBe('twig_option');
    expect(JSON.parse(element.getAttribute('config')!)).toEqual({
      'single-option': { type: 'button' },
      'multiple-option': { type: 'button' },
    });
    expect(element.parentElement!.className).toBe('');

    themeSettings = { hide_options_in_cart: true };
    rerender(<CartItem item={{ ...item, options } as never} />);
    expect(container.querySelector('salla-product-options')!.parentElement!.className).toBe('hidden');
  });

  it('renders the attachments with the cart item files', () => {
    const attachments = [{ id: 4, url: '/f.png' }];
    render(<CartItem item={{ ...item, can_add_note: true, can_upload_file: true, attachments }} />);
    expect(screen.getByTestId('store-product-add-note')).toBeTruthy();
    const upload = screen.getByTestId('file-upload');
    expect(upload.getAttribute('data-files')).toBe(JSON.stringify(attachments));
    expect(upload.getAttribute('data-cart-item-id')).toBe('1');
  });
});

describe('CartItem update', () => {
  const updateItem = vi.fn(() => Promise.resolve());
  let originalSalla: unknown;

  beforeEach(() => {
    originalSalla = (window as { salla?: unknown }).salla;
    (window as { salla?: unknown }).salla = { cart: { updateItem } };
  });

  afterEach(() => {
    (window as { salla?: unknown }).salla = originalSalla;
    updateItem.mockClear();
  });

  /** What `<salla-quantity-input>` does: an inner input named from the host fires `change`. */
  function changeQuantity(container: HTMLElement, value: string) {
    const input = document.createElement('input');
    input.name = 'quantity';
    input.value = value;
    container.querySelector('salla-quantity-input')!.appendChild(input);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  it("posts the whole item form on change, so the item's options go with the new quantity", async () => {
    const onMutated = vi.fn();
    const { container } = render(<CartItem item={item} onMutated={onMutated} />);
    const option = document.createElement('input');
    option.name = 'options[7]';
    option.value = 'Red';
    container.querySelector('form')!.appendChild(option);

    await act(async () => changeQuantity(container, '2'));

    expect(updateItem).toHaveBeenCalledOnce();
    const payload = (updateItem.mock.calls[0] as unknown[])[0] as FormData;
    expect(payload.get('id')).toBe('1');
    expect(payload.get('quantity')).toBe('2');
    expect(payload.get('options[7]')).toBe('Red');
    expect(onMutated).toHaveBeenCalledOnce();
  });

  it('sends nothing while a required option is empty', async () => {
    const { container } = render(<CartItem item={item} />);
    const option = document.createElement('input');
    option.name = 'options[7]';
    option.required = true;
    container.querySelector('form')!.appendChild(option);

    await act(async () => changeQuantity(container, '2'));
    expect(updateItem).not.toHaveBeenCalled();
  });
});

describe('CartItem delete', () => {
  const deleteItem = vi.fn(() => Promise.resolve());
  const updateItem = vi.fn(() => Promise.resolve());
  let originalSalla: unknown;

  beforeEach(() => {
    originalSalla = (window as { salla?: unknown }).salla;
    (window as { salla?: unknown }).salla = { cart: { deleteItem, updateItem } };
  });

  afterEach(() => {
    (window as { salla?: unknown }).salla = originalSalla;
    deleteItem.mockClear();
    updateItem.mockClear();
  });

  it('puts the delete button in the top corner with the Twig colours', () => {
    render(<CartItem item={item} />);
    const button = screen.getByTestId('store-cart-delete-item');
    expect(button.parentElement!.className).toContain('absolute top-0');
    expect(button.querySelector('svg')!.getAttribute('class')).toContain('fill-lightgray group-hover:fill-danger');
    expect(button.getAttribute('tooltip')).toBe('pages.cart.remove');
  });

  it('refetches through onMutated after a delete, keeping the row for the refetch to drop', async () => {
    const onMutated = vi.fn();
    const { container } = render(<CartItem item={item} onMutated={onMutated} />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('pages.cart.remove'));
    });
    expect(deleteItem).toHaveBeenCalledWith('1');
    expect(onMutated).toHaveBeenCalledOnce();
    expect(container.querySelector('#item-1')).toBeTruthy();
  });

  it('drops its own row after a delete when nothing refetches the cart', async () => {
    const { container } = render(<CartItem item={item} />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText('pages.cart.remove'));
    });
    expect(container.querySelector('#item-1')).toBeNull();
  });
});
