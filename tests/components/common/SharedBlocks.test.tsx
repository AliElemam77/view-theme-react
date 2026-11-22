import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SectionWrapper } from '../../../app/components/common/SectionWrapper';
import { BlockTitle } from '../../../app/components/common/BlockTitle';
import { ActionBtn } from '../../../app/components/common/ActionBtn';
import { CouponPill } from '../../../app/components/common/CouponPill';
import { CountdownTimer } from '../../../app/components/common/CountdownTimer';
import { Marquee } from '../../../app/components/common/Marquee';

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

describe('Shared building blocks', () => {
  describe('SectionWrapper', () => {
    it('wraps children in container by default', () => {
      const { container } = render(
        <SectionWrapper id="sec-1">
          <div>Content</div>
        </SectionWrapper>
      );
      expect(container.querySelector('section#sec-1')).toBeTruthy();
      expect(container.querySelector('.container')).toBeTruthy();
      expect(container.querySelector('section')?.className).toContain('my-8');
    });

    it('respects hasContainer=false and notmrb=true', () => {
      const { container } = render(
        <SectionWrapper hasContainer={false} notmrb={true}>
          <div>Full width content</div>
        </SectionWrapper>
      );
      expect(container.querySelector('.container')).toBeNull();
      expect(container.querySelector('section')?.className).toContain('my-0');
    });
  });

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
      render(<BlockTitle title="منتجات" moreAlt="عرض الكل" moreUrl="/products" />);
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

  describe('CountdownTimer', () => {
    it('renders days, hours, minutes and seconds', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 48); // 2 days in future
      render(<CountdownTimer targetDate={futureDate} />);
      expect(screen.getByText('يوم')).toBeTruthy();
      expect(screen.getByText('ساعة')).toBeTruthy();
      expect(screen.getByText('دقيقة')).toBeTruthy();
      expect(screen.getByText('ثانية')).toBeTruthy();
    });
  });

  describe('Marquee', () => {
    it('renders children and duplicated aria-hidden copy', () => {
      const { container } = render(
        <Marquee>
          <span>توصيل مجاني</span>
        </Marquee>
      );
      const ariaHidden = container.querySelector('[aria-hidden="true"]');
      expect(ariaHidden).toBeTruthy();
      expect(screen.getAllByText('توصيل مجاني').length).toBe(2);
    });
  });
});
