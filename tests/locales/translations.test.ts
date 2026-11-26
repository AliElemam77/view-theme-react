import { describe, it, expect } from 'vitest';
import ar from '../../locales/ar.json';
import en from '../../locales/en.json';

describe('theme locale files', () => {
  it('keeps ar.json and en.json keys in sync with non-empty translations', () => {
    const arKeys = Object.keys(ar).sort();
    const enKeys = Object.keys(en).sort();
    expect(arKeys).toEqual(enKeys);

    for (const key of arKeys) {
      expect((ar as Record<string, string>)[key].trim().length, `ar.${key}`).toBeGreaterThan(0);
      expect((en as Record<string, string>)[key].trim().length, `en.${key}`).toBeGreaterThan(0);
    }
  });

  it('contains the product, search, and UI keys fixed from missing/broken strings', () => {
    const required = [
      'blocks.home.filter_by_tag',
      'common.elements.close',
      'pages.products.no_description',
      'pages.products.no_images',
      'pages.products.quick_view',
      'pages.products.related_products',
      'pages.products.sold_zero',
      'pages.search.empty',
      'pages.search.idle',
      'pages.search.loading',
    ];
    for (const key of required) {
      expect((ar as Record<string, string>)[key]).toBeTruthy();
      expect((en as Record<string, string>)[key]).toBeTruthy();
    }
    expect((en as Record<string, string>)['blocks.header.allviw']).toBe('View all reviews');
  });

  it('uses i18next {{param}} syntax on interpolated theme aria/alt strings', () => {
    for (const dict of [ar as Record<string, string>, en as Record<string, string>]) {
      expect(dict['blocks.header.copy_code_aria']).toContain('{{code}}');
      expect(dict['common.feature_aria']).toContain('{{title}}');
      expect(dict['common.related_category_alt']).toContain('{{index}}');
    }
  });
});
