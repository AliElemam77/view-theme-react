// @vitest-environment node
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import * as sass from 'sass';
import postcss, { type Root, type Rule } from 'postcss';
import tailwindcss from 'tailwindcss';

const themeRoot = fileURLToPath(new URL('../../', import.meta.url));
const tailwindConfig = createRequire(import.meta.url)(`${themeRoot}tailwind.config.cjs`);

async function compile(file: string): Promise<Root> {
  const { css } = sass.compile(`${themeRoot}app/styles/${file}`);
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '' }] }),
  ]).process(css, { from: undefined });
  return result.root;
}

describe('thank-you page (View thank-you.twig)', () => {
  it("isolates the page content so the `-z-1` primary band paints above `.app-inner`'s background", async () => {
    const isolated: string[] = [];
    (await compile('04-components/user-pages.scss')).walkDecls('isolation', (d) => {
      if (d.value === 'isolate' && d.parent?.type === 'rule') isolated.push((d.parent as Rule).selector);
    });
    expect(isolated).toEqual(['body.thank-you #main-content:not(:has(salla-thank-you-page))']);
  });

  it("grows the `.thanks-item`s in like thankyou.js's anime.js call, on the thank-you page only", async () => {
    const root = await compile('04-components/thank-you.scss');
    const rules: Rule[] = [];
    root.walkRules((rule) => {
      if (rule.parent?.type === 'root') rules.push(rule);
    });
    const selectors = rules.map((r) => r.selector);
    expect(selectors).toContain('body.thank-you .thanks-item');
    for (const selector of selectors) expect(selector.startsWith('body.thank-you ')).toBe(true);

    const item = rules.find((r) => r.selector === 'body.thank-you .thanks-item')!;
    const animation: string[] = [];
    item.walkDecls('animation', (d) => {
      animation.push(d.value);
    });
    expect(animation[0]).toMatch(/^view-thanks-item 2s /);

    let keyframes = false;
    root.walkAtRules('keyframes', (at) => {
      if (at.params === 'view-thanks-item') keyframes = true;
    });
    expect(keyframes).toBe(true);
  });
});
