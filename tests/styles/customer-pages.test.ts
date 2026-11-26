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

function rules(root: Root): Rule[] {
  const found: Rule[] = [];
  root.walkRules((rule) => {
    found.push(rule);
  });
  return found;
}

// As Sass prints it (unquoted attribute value).
const SINGLE_ORDERS_SCOPE =
  'body:is(.customer-orders-single, [class*=customer-orders-index], .customer-profile)';

describe("View's single-orders.scss", () => {
  it('applies only on the pages Twig loads singleOrders.css on', async () => {
    const all = rules(await compile('04-components/single-orders.scss'));
    expect(all.length).toBeGreaterThan(10);
    for (const rule of all) {
      for (const selector of rule.selectors) expect(selector).toContain(SINGLE_ORDERS_SCOPE);
    }
  });

  it("keeps the `[dir]` tooltip offsets above the body scope, where `[dir]` sits (<html>)", async () => {
    const selectors = rules(await compile('04-components/single-orders.scss')).flatMap((r) => r.selectors);
    expect(selectors).toContain(
      `[dir=rtl] ${SINGLE_ORDERS_SCOPE} .icon-trigger.mobile-shifted .tooltip-content`
    );
  });

  it("uses View's rounding for tags (`rounded-2xl`)", async () => {
    const tag = rules(await compile('04-components/single-orders.scss')).find(
      (r) => r.selector === `${SINGLE_ORDERS_SCOPE} .tag`
    );
    let radius: string | undefined;
    tag?.walkDecls('border-radius', (d) => {
      radius = d.value;
    });
    expect(radius).toBe('1rem');
  });
});

describe('customer pages', () => {
  it("leaves `<salla-user-menu>` with the SDK's own icons (no styles)", async () => {
    expect(rules(await compile('04-components/user-menu.scss'))).toHaveLength(0);
  });

  it('has no grey account background or Raed-only rules in user-pages.scss', async () => {
    const selectors = rules(await compile('04-components/user-pages.scss')).map((r) => r.selector);
    for (const selector of selectors) {
      expect(selector).not.toMatch(/#main-content(?!:not)|\.tag\b|\.s-orders-filters|\.blog-single|\.profile-header/);
    }
  });

  it("colours the empty-state text `text-mediumgray`, as View does", async () => {
    const p = rules(await compile('04-components/no-content-placeholder.scss')).find(
      (r) => r.selector === '.no-content-placeholder p'
    );
    let color: string | undefined;
    p?.walkDecls('color', (d) => {
      color = d.value;
    });
    expect(color).toBe('var(--medium-gray-color)');
  });
});
