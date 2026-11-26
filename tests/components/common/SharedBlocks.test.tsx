import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockTitle } from '../../../app/components/common/BlockTitle';
import { ActionBtn } from '../../../app/components/common/ActionBtn';
import { CouponPill } from '../../../app/components/common/CouponPill';

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className, onClick, style, ...props }: any) => (
    <a href={to} className={className} onClick={onClick} style={style} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback || key,
    locale: 'ar',
  }),
}));

vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: {} }, store: {} }),
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ isRTL: true, settings: {} }),
}));

describe('Shared building blocks', () => {

  describe('BlockTitle', () => {
    it('renders title and subtitle', () => {
      render(<BlockTitle title="عنوان القسم" sub="وصف القسم" />);
      expect(screen.getByRole('heading', { level: 2, name: 'عنوان القسم' })).toBeTruthy();
      expect(screen.getByText('وصف القسم')).toBeTruthy();
    });

    it('returns null when no title and no subtitle', () => {
      const { container } = render(<BlockTitle />);
      expect(container.firstChild).toBeNull();
    });

    it('renders more link when provided', () => {
      render(<BlockTitle title="منتجات" more moreAlt="عرض الكل" moreUrl="/products" />);
      const link = screen.getByRole('link', { name: 'عرض الكل' });
      expect(link.getAttribute('href')).toBe('/products');
    });
  });

  describe('ActionBtn', () => {
    it('renders link when href provided', () => {
      render(<ActionBtn text="تسوق الآن" href="/shop" dataStyle="filled" />);
      const link = screen.getByRole('link', { name: /تسوق الآن/i });
      expect(link.getAttribute('href')).toBe('/shop');
      expect(link.className).toContain('fancy');
    });

    it('renders button with click handler when no href', () => {
      const handleClick = vi.fn();
      render(<ActionBtn text="إضافة للسلة" onClick={handleClick} />);
      const btn = screen.getByRole('button', { name: /إضافة للسلة/i });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CouponPill', () => {
    it('renders coupon code and label', () => {
      render(<CouponPill label="خصم خاص" code="SAVE20" />);
      expect(screen.getByText('SAVE20')).toBeTruthy();
      expect(screen.getByText('خصم خاص')).toBeTruthy();
    });

    it('returns null if no code provided', () => {
      const { container } = render(<CouponPill label="خصم" code="" />);
      expect(container.firstChild).toBeNull();
    });
  });


});
