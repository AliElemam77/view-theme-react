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

/** Top-level rules (no media queries) of the compiled file. */
function topRules(root: Root): Rule[] {
  const rules: Rule[] = [];
  root.walkRules((rule) => {
    if (rule.parent?.type === 'root') rules.push(rule);
  });
  return rules;
}

describe('loyalty page (View loyalty.scss)', () => {
  it('scopes every rule to the loyalty page, as Twig loads loyalty.css there only', async () => {
    const rules = topRules(await compile('04-components/loyalty.scss'));
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      for (const selector of rule.selectors) expect(selector.startsWith('body.loyalty ')).toBe(true);
    }
  });

  it("keeps View's banner, ways-to-earn and white breadcrumb rules", async () => {
    const selectors = topRules(await compile('04-components/loyalty.scss')).flatMap((r) => r.selectors);
    for (const selector of [
      'body.loyalty .loyalty__banner',
      'body.loyalty .loyalty__banner-inner',
      'body.loyalty .loyalty__banner .loyalty-points .count-number',
      'body.loyalty .loyalty-star--first',
      'body.loyalty .points-ways__list .way-item',
      'body.loyalty .points-ways__list .way-item__icon span',
      'body.loyalty .breadcrumbs a',
      'body.loyalty .product-entry__image',
    ]) {
      expect(selectors).toContain(selector);
    }
  });

  it('isolates the page content so the `-z-1` hero paints', async () => {
    const isolated: string[] = [];
    (await compile('04-components/loyalty.scss')).walkDecls('isolation', (d) => {
      if (d.value === 'isolate' && d.parent?.type === 'rule') isolated.push((d.parent as Rule).selector);
    });
    expect(isolated).toEqual(['body.loyalty #main-content']);
  });
});
