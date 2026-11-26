import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VBannerLine } from '../../../app/components/home/VBannerLine';
import { VCountdownBanner } from '../../../app/components/home/VCountdownBanner';
import { VMarque } from '../../../app/components/home/VMarque';
import { VTextBlock } from '../../../app/components/home/VTextBlock';
import { VStyledCategories } from '../../../app/components/home/VStyledCategories';
import { VFeaturedProduct } from '../../../app/components/home/VFeaturedProduct';
import { VFaq } from '../../../app/components/home/VFaq';
import { VBrandsSlider } from '../../../app/components/home/VBrandsSlider';

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
  useTwilight: () => ({ theme: { settings: {} }, store: { name: 'Store' } }),
}));

// V_countdown_banner renders `<salla-count-down size="md" boxed labeled>`, as the Twig does.
vi.mock('@salla.sa/twilight-components-react/count-down', () => ({
  SallaCountDown: ({ date }: { date?: string }) => <div data-testid="count-down" data-date={date} />,
}));

vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ isRTL: true, settings: {} }),
}));

describe('Custom View home components', () => {
  describe('VBannerLine', () => {
    it('renders main title and subtitle', () => {
      render(
        <VBannerLine
          data={{
            main_title: 'بنر خطي مميز',
            main_titleamsll: 'وصف إضافي للبنر',
            btn_txt: 'تسوق الآن',
            btn_url: 'https://example.com/shop',
          }}
        />
      );
      expect(screen.getByText('بنر خطي مميز')).toBeTruthy();
      expect(screen.getByText('وصف إضافي للبنر')).toBeTruthy();
      expect(screen.getByText('تسوق الآن')).toBeTruthy();
    });
  });

  describe('VCountdownBanner', () => {
    it('renders countdown timer with target date', () => {
      render(
        <VCountdownBanner
          data={{
            main_title: 'عروض الجمعة البيضاء',
            end_time_offer: '2026-12-31',
            has_counter: true,
          }}
        />
      );
      expect(screen.getByText('عروض الجمعة البيضاء')).toBeTruthy();
      expect(screen.getByTestId('count-down')).toBeTruthy();
    });
  });

  describe('VMarque', () => {
    it('renders ticker marquee text and separator', () => {
      render(
        <VMarque
          data={{
            offers_marquee: [
              { item_text: 'توصيل مجاني للطلبات فوق 200 ريال' },
              { item_text: 'كود خصم إضافي: VIEW10' },
            ],
            saprator: 'solid',
          }}
        />
      );
      expect(screen.getAllByText('توصيل مجاني للطلبات فوق 200 ريال').length).toBeGreaterThan(0);
      expect(screen.getAllByText('كود خصم إضافي: VIEW10').length).toBeGreaterThan(0);
    });
  });

  describe('VTextBlock', () => {
    it('renders content with titles', () => {
      render(
        <VTextBlock
          data={{
            main_title: 'من نحن',
            sub_title: 'متجر فيو يقدم أحدث المنتجات',
          }}
        />
      );
      expect(screen.getByText('من نحن')).toBeTruthy();
      expect(screen.getByText('متجر فيو يقدم أحدث المنتجات')).toBeTruthy();
    });
  });

  describe('VStyledCategories', () => {
    it('renders category list and titles in grid layout', () => {
      render(
        <VStyledCategories
          data={{
            main_title: 'التصنيفات المميزة',
            enable_grid_layout: true,
            custom_categories: [
              { id: 1, name: 'إلكترونيات', url: '/c/electronics' },
              { id: 2, name: 'أزياء', url: '/c/fashion' },
            ],
            show_category_name: true,
          }}
        />
      );
      expect(screen.getByText('التصنيفات المميزة')).toBeTruthy();
      expect(screen.getByText('إلكترونيات')).toBeTruthy();
      expect(screen.getByText('أزياء')).toBeTruthy();
    });
  });

  describe('VFeaturedProduct', () => {
    it('renders featured product side with feature perks', () => {
      render(
        <VFeaturedProduct
          data={{
            is_featured: true,
            main_text: 'منتج الشهر',
            main_text_one: 'العرض الحصري',
            features: [
              { f_title: 'شحن سريع', f_sub_title: 'خلال 24 ساعة' },
              { f_title: 'ضمان سنتين', f_sub_title: 'استبدال فوري' },
            ],
          }}
        />
      );
      expect(screen.getByText('منتج الشهر')).toBeTruthy();
      expect(screen.getByText('العرض الحصري')).toBeTruthy();
      expect(screen.getByText('شحن سريع')).toBeTruthy();
      expect(screen.getByText('ضمان سنتين')).toBeTruthy();
    });
  });

  describe('VFaq', () => {
    it('toggles accordion answer on question click', () => {
      render(
        <VFaq
          data={{
            main_title: 'الأسئلة الشائعة',
            questions: [
              { question: 'ما هي طرق الدفع؟', answer: 'مدى، فيزا، تابي، تمارا' },
              { question: 'كم يستغرق التوصيل؟', answer: 'من 2 إلى 4 أيام عمل' },
            ],
          }}
        />
      );
      expect(screen.getByText('الأسئلة الشائعة')).toBeTruthy();
      expect(screen.getByText('ما هي طرق الدفع؟')).toBeTruthy();
      // First question is open by default
      expect(screen.getByText('مدى، فيزا، تابي، تمارا')).toBeTruthy();

      // Click second question to open it
      fireEvent.click(screen.getByText('كم يستغرق التوصيل؟'));
      expect(screen.getByText('من 2 إلى 4 أيام عمل')).toBeTruthy();
    });
  });

  describe('VBrandsSlider', () => {
    it('renders brand logos', () => {
      render(
        <VBrandsSlider
          data={{
            main_title: 'شركاؤنا',
            brands: [
              { id: 1, name: 'Apple', logo: '/images/apple.png' },
              { id: 2, name: 'Samsung', logo: '/images/samsung.png' },
            ],
          }}
        />
      );
      expect(screen.getByText('شركاؤنا')).toBeTruthy();
      // custom/break.twig's alt: `{name} brand {standard|reverse} {position + 1}`.
      expect(screen.getAllByAltText(/^Apple brand/).length).toBeGreaterThan(0);
    });
  });
});
