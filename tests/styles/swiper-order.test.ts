import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Swiper's `.swiper-slide { display: block }` beat `flex` on a slide when it came after the utilities.
describe('vendored Swiper stylesheet', () => {
  it.each([
    ['app.css', '@import "tailwindcss/base"'],
    ['critical.scss', '@tailwind base'],
    ['critical-product.scss', '@tailwind base'],
  ])('%s imports it ahead of Tailwind', (file, tailwind) => {
    const css = readFileSync(`app/styles/${file}`, 'utf8');
    const swiper = css.indexOf('vendor/swiper.css');
    expect(swiper).toBeGreaterThan(-1);
    expect(swiper).toBeLessThan(css.indexOf(tailwind));
  });
});
