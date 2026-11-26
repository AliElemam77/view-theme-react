/**
 * Ports of View's `featured-products-style1/2/3.twig` (one block, `view_style`
 * picks the file) + home.js `initFeaturedTabs`: a tab fades its panel in
 * (`opacity-0 translate-y-3` → `opacity-100 translate-y-0` after 100ms).
 *
 * - style1: offer title + tab buttons (`shape="link"`), the main product as a
 *   special card beside a 2-col grid (4 products), or a 4-col grid (8) without one.
 * - style2: outline tab buttons over a products slider (`is_slider`) or a
 *   horizontal-cards list, loaded from each tab's source.
 * - style3: two columns of sections, each a full-image card beside 3 minimal cards.
 */
import { memo, useCallback, useState } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaProductsList, SallaProductsSlider } from '@salla.sa/twilight-components-react';
import { product as productApi, type ProductsListSource } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { ProductCard } from '../product/ProductCard';

type Style = 1 | 2 | 3;

/** `view_style`: the Twig file suffix, or the semantic names some stores save. */
export function featuredStyle(raw: unknown): Style {
  const style = String(raw ?? '').toLowerCase();
  if (style.includes('3') || style === 'grid') return 3;
  if (style.includes('2') || ['tabs', 'slider', 'products'].includes(style)) return 2;
  return 1;
}

interface Section {
  id?: string;
  title?: string;
  name?: string;
  products?: Product[] | { source?: ProductsListSource; source_value?: number | number[]; limit?: number };
  featured_product?: Product | null;
}

export interface ViewFeaturedProductsData {
  items?: Section[];
  main_product?: { title?: string; product?: Product } | null;
  is_slider?: boolean;
  view_style?: unknown;
  position?: number;
  [key: string]: unknown;
}

const list = (value: Section['products']): Product[] => (Array.isArray(value) ? value : []);

/** home.js `initFeaturedTabs`. */
function useTabs(sections: Section[]) {
  const [active, setActive] = useState(sections[0]?.id ?? '0');
  const [shown, setShown] = useState(true);
  const open = useCallback(
    (id: string) => {
      if (id === active) return;
      setShown(false);
      setActive(id);
      window.setTimeout(() => setShown(true), 100);
    },
    [active]
  );
  const panelClass = (id: string) =>
    id === active ? `is-active ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}` : 'inactive';
  return { active, open, panelClass };
}

function Style1({ data }: { data: ViewFeaturedProductsData }) {
  const sections = data.items ?? [];
  const main = data.main_product;
  const id = `featured-products-style1-${data.position ?? 0}`;
  const { active, open, panelClass } = useTabs(sections);
  const triggers = (className: string) => (
    <div className={className}>
      {sections.map((section, index) => {
        const key = section.id ?? String(index);
        return (
          // SallaButton puts its className on the <button>; home.scss styles `.tab-trigger.is-active button`.
          <span key={key} className={`tab-trigger inline-block ${active === key ? 'is-active' : 'inactive'}`}>
            <SallaButton shape="link" onClick={() => open(key)}>
              {section.title ?? section.name}
            </SallaButton>
          </span>
        );
      })}
    </div>
  );

  return (
    <>
      <div className="s-block__title">
        <div className="right-side">
          <h2>{main?.title}</h2>
        </div>
        {triggers('tabs hide-scroll hidden lg:flex')}
      </div>
      <div className={`grid grid-cols-1 ${main ? 'lg:grid-cols-2' : ''} gap-8`}>
        {main && (
          <div className="flex flex-col">
            {main.product && <ProductCard product={main.product} layout="special" withShadow />}
          </div>
        )}
        <div className="flex flex-col">
          {triggers('tabs mb-4 sm:mb-8 hide-scroll lg:hidden')}
          <div className="tabs-wrapper flex flex-1">
            {sections.map((section, index) => {
              const key = section.id ?? String(index);
              return (
                <div
                  key={key}
                  id={`${id}-${key}`}
                  className={`tabs__item grid-cols-2 ${main ? '' : 'lg:grid-cols-4'} ${panelClass(key)}`}
                >
                  {list(section.products)
                    .slice(0, main ? 4 : 8)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

function Style2({ data }: { data: ViewFeaturedProductsData }) {
  const sections = data.items ?? [];
  const id = `featured-products-style2-${data.position ?? 0}`;
  const { active, open, panelClass } = useTabs(sections);
  const loader = (section: Section) => {
    const source = Array.isArray(section.products) ? undefined : section.products;
    return () =>
      productApi.list({
        source: (source?.source ?? 'latest') as ProductsListSource,
        sourceValue: source?.source_value,
        perPage: source?.limit,
      });
  };

  return (
    <div className="container">
      <div className="tabs hide-scroll">
        {sections.map((section, index) => {
          const key = section.id ?? String(index);
          return (
            <span key={key} className={`tab-trigger inline-block ${active === key ? 'is-active' : 'inactive'}`}>
              <SallaButton fill="outline" onClick={() => open(key)}>
                {section.title ?? section.name}
              </SallaButton>
            </span>
          );
        })}
      </div>
      <div className="tabs-wrapper">
        {sections.map((section, index) => {
          const key = section.id ?? String(index);
          return (
            <div key={key} id={`${id}-${key}`} className={`tabs__item ${panelClass(key)}`}>
              {data.is_slider ? (
                <SallaProductsSlider loader={loader(section)} sliderProps={{ id: `section-${key}-slider` }}>
                  {(product: Product) => <ProductCard className="s-products-slider-card" product={product} />}
                </SallaProductsSlider>
              ) : (
                // Twig passes `horizontal-cards` whichever way `vertical_fixed_products` goes.
                <SallaProductsList loader={loader(section)} itemsClassName="s-products-list-horizontal-cards">
                  {(products: Product[]) =>
                    products.map((product) => <ProductCard key={product.id} product={product} layout="horizontal" />)
                  }
                </SallaProductsList>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Style3({ data }: { data: ViewFeaturedProductsData }) {
  const sections = data.items ?? [];
  return (
    <div className="inner">
      {sections.map((section, index) => (
        <div key={section.id ?? index}>
          <div className="s-block__title">
            <h2>{section.title}</h2>
          </div>
          <div className="flex-1 grid lg:grid-cols-2 gap-4 sm:gap-8">
            {section.featured_product ? (
              <>
                <ProductCard product={section.featured_product} layout="fullImage" withShadow />
                <div className="grid gap-4 sm:gap-8">
                  {list(section.products)
                    .slice(0, 3)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} layout="minimal" withShadow />
                    ))}
                </div>
              </>
            ) : (
              list(section.products).map((product) => (
                <ProductCard key={product.id} product={product} layout="minimal" withShadow />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export const ViewFeaturedProducts = memo(function ViewFeaturedProducts({ data = {} }: { data?: ViewFeaturedProductsData }) {
  const style = featuredStyle(data.view_style);
  if (style === 2) return <Style2 data={data} />;
  if (style === 3) return <Style3 data={data} />;
  return <Style1 data={data} />;
});

/** The `<section>` each Twig file opens with (home.js adds `tabs-initialized` to tab blocks). */
export const viewFeaturedProductsConfig = {
  height: '450px',
  id: (data: ViewFeaturedProductsData) =>
    `featured-products-style${featuredStyle(data.view_style)}-${data.position ?? 0}`,
  className: (data: ViewFeaturedProductsData) => {
    const style = featuredStyle(data.view_style);
    if (style === 2)
      return `s-block s-block-tabs s-block--tabs-produtcs s-block--full-bg tabs-initialized ${
        data.is_slider ? 'as-slider' : 'as-grid'
      } py-8 sm:py-16`;
    if (style === 3)
      return `s-block s-block--features-products${(data.items?.length ?? 0) > 1 ? ' two-cols' : ''} container`;
    return 's-block s-block-tabs s-block--special-products container tabs-initialized';
  },
};
