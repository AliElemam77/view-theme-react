import { memo, useEffect, useState, type MouseEvent } from 'react';
import type { CSSProperties } from 'react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMoney } from '@salla.sa/twilight-theme-engine/hooks/useMoney';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import {
  cls,
  collectionItems,
  separatorProps,
  text,
  twigPosition,
  usePickedProducts,
} from './viewBlockUtils';

export interface VOfferCollectionFeature {
  feature_icon?: string;
  feature_text?: string;
}

export interface VOfferCollectionData {
  collection_bg_color?: string;
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  select_products_list?: unknown;
  enable_collection_features?: boolean;
  collection_features?: unknown;
  product_bg_image?: string;
  combined_products_image?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

type SallaCart = { cart?: { quickAdd?: (id: number) => Promise<unknown>; open?: () => void } };

const num = (value: unknown) => parseFloat(String(value ?? ''));

/** Twig's `data-offer` / `data-price` on each `.collection-item`. */
const offerOf = (p: Product) => (p.is_on_sale ? p.sale_price : '');
const priceOf = (p: Product) => (p.is_on_sale ? p.regular_price : p.price);

/**
 * Port of `V_offer_collection.twig` + home.js `vgtt` (the offer total and the
 * struck regular total in the button, the discount badge, the spinner) and
 * `vprprp` (the button quick-adds every product of the set, then opens the cart).
 */
export const VOfferCollection = memo(function VOfferCollection({
  data = {},
}: {
  data?: VOfferCollectionData;
}) {
  const { t } = useTranslation();
  const { format } = useMoney();
  const { reveal, spacing } = useViewSettings();
  const { products, isLoading } = usePickedProducts(data.select_products_list);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setMounted(true), []);

  const position = twigPosition(data);
  const features = collectionItems<VOfferCollectionFeature>(
    data.collection_features,
    'collection_features'
  );

  // vgtt: regular total (`b`) and offer total (`c`, sale price or price).
  let regular = 0;
  let offer = 0;
  for (const p of products) {
    const sale = num(offerOf(p));
    const price = num(priceOf(p));
    if (!Number.isNaN(price)) regular += price;
    if (!Number.isNaN(sale) && sale > 0) offer += sale;
    else if (!Number.isNaN(price)) offer += price;
  }
  const ready = mounted && !isLoading;
  const discount = regular > 0 ? Math.round(100 * ((regular - offer) / regular)) : null;

  const onGetGroup = async (event: MouseEvent) => {
    if (event.button === 1 || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    const ids = Array.from(
      new Set(products.map((p) => parseInt(String(p.id), 10)).filter(Number.isFinite))
    );
    if (!ids.length || busy) return;
    const salla = (typeof window !== 'undefined' ? window.salla : undefined) as SallaCart | undefined;
    const quickAdd = salla?.cart?.quickAdd;
    if (!quickAdd) {
      console.warn('Salla cart API not available.');
      return;
    }
    setBusy(true);
    try {
      const results = await Promise.allSettled(ids.map((id) => quickAdd(id)));
      if (results.some((r) => r.status === 'fulfilled') && salla?.cart?.open) {
        try {
          salla.cart.open();
        } catch {
          /* ignore */
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const bg = text(data.collection_bg_color);
  const sectionStyle: CSSProperties | undefined = bg ? { backgroundColor: bg } : undefined;
  const productBg = text(data.product_bg_image);

  return (
    <section
      className={cls('s-block V_offer_collection', !data.notmrb && spacing)}
      style={sectionStyle}
      aria-label={`Section V_offer_collection-${position}`}
      id={`V_offer_collection-${position}`}
    >
      <div className={data.has_container ? 'container' : ''}>
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-6 relative overflow-hidden">
          <div className="w-full lg:w-1/2 gap-3 text-right flex justify-between h-auto flex-col">
            <BlockTitle
              title={text(data.main_title)}
              sub={text(data.sub_title)}
              jocer={booleanValue(data.has_jocer_image)}
              className="!m-0"
            />
            <div className="gap-5 flex flex-col justify-between text-sm">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={cls(reveal, 'flex items-center justify-between border-b pb-2 collection-item')}
                  data-offer={String(offerOf(p) ?? '')}
                  data-price={String(priceOf(p) ?? '')}
                >
                  <div>
                    <h3 className="font-semibold text-darkgray text-base line-clamp-1">{p.name}</h3>
                    <p className="text-mediumgray  text-xs  line-clamp-1">{p.subtitle}</p>
                  </div>
                  <div className="flex whitespace-nowrap gap-4 items-center">
                    <div
                      className={cls(
                        !p.is_on_sale && 'hidden',
                        'price_is_on_sale space-x-2 rtl:space-x-reverse whitespace-nowrap'
                      )}
                    >
                      <h2 className="text-price font-bold md:text-lg text-lg inline-block">
                        {format(p.sale_price ?? undefined)}
                      </h2>
                      <span className="text-mediumgray  line-through opacity-85 font-semibold text-sm">
                        {format(p.regular_price)}
                      </span>
                    </div>
                    <div className={cls('gap-4', p.is_on_sale ? 'hidden' : 'flex')}>
                      {p.starting_price ? (
                        <span>{t('pages.products.starting_price', 'يبدأ من')}</span>
                      ) : null}
                      <h2 className="font-bold md:text-lg text-lg inline-block">
                        {p.starting_price ? format(p.starting_price) : format(p.price)}
                      </h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-3 flex-col">
              <ActionBtn
                id="get_group"
                attr={products.map((p) => p.id).join(',')}
                text={t('pages.cart.get_group', 'احصل على المجموعة الآن')}
                dataStyle="filled"
                color="var(--color-primary-reverse)"
                backgroundColor="var(--color-primary)"
                icon
                spinner={!ready}
                className={busy ? 'is-loading' : ''}
                href="#"
                onClick={onGetGroup}
                inject={
                  ready ? (
                    <>
                      <span className="text-price">{format(offer.toFixed(2))}</span>{' '}
                      <span className="line-through mx-1 opacity-50">{format(regular.toFixed(2))}</span>
                    </>
                  ) : (
                    true
                  )
                }
              />
              {booleanValue(data.enable_collection_features) && (
                <div className="flex-wrap flex-center gap-4 text-xs">
                  {features.map((feature, index) => (
                    // A settings list without ids.
                    // react-doctor-disable-next-line react-doctor/no-array-index-as-key
                    <div key={index} className="flex items-center gap-1 text-darkgray ">
                      <i className={text(feature.feature_icon)} />
                      <span>{text(feature.feature_text)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className="flex-shrink-0 flex items-end justify-center w-full lg:w-1/2 bg-contain bg-center bg-no-repeat lazy"
            data-bg={productBg || undefined}
            style={productBg ? { backgroundImage: `url(${productBg})` } : undefined}
          >
            <div className="relative">
              <div
                id="sescount"
                className={cls(
                  'absolute top-4 left-4 bg-gradient-to-tl from-primary to-bgcolor text-lightgray text-center w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold leading-tight',
                  reveal
                )}
                style={ready && discount !== null ? { display: 'flex' } : undefined}
              >
                {ready && discount !== null && (
                  <div>
                    {t('pages.products.discountma', 'خصم')}
                    <br />
                    {discount}%
                  </div>
                )}
              </div>
              <img
                src={text(data.combined_products_image) || undefined}
                alt={text(data.main_title)}
                className={cls(reveal, 'object-contain z-2 lazy')}
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
              />
            </div>
          </div>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
