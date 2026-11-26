import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { SallaLoyalty } from '@salla.sa/twilight-components-react/loyalty';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { loyalty as loyaltyApi } from '@salla.sa/twilight-theme-engine/api/loyalty';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type {
  LoyaltyPageProps,
  LoyaltyPoint,
  LoyaltyPrizeItem,
} from '@salla.sa/twilight-theme-engine/routes/loyalty';
import { CopyButton } from './ThankYouPage';

/**
 * loyalty.js's `.count-anime` step: `innerText: [0, count]`, 2000ms linear, rounded,
 * starting 300ms in (the timeline's `-=3700` after the 1000ms first step and the star).
 */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    const DELAY = 300;
    const DURATION = 2000;
    let frame = 0;
    const start = performance.now() + DELAY;
    const tick = (now: number) => {
      const progress = Math.min(1, Math.max(0, (now - start) / DURATION));
      setValue(Math.round(target * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

function WayItem({ point, isUser }: { point: LoyaltyPoint; isUser: boolean }) {
  const { t } = useTranslation();
  const shareUrl = point.url || point.share_store_url;

  return (
    <div data-testid="store-loyalty-way-item" className="way-item">
      <div className="flex rtl:space-x-reverse space-x-4">
        <span className={`way-item__icon ${point.icon || 'sicon-star'}`} style={{ color: point.color }}>
          <span style={{ backgroundColor: point.color }}></span>
        </span>
        <div className="way-item__content">
          <h3 style={{ color: point.color }}>
            {point.points} {t('pages.loyalty_program.point', 'نقطة')}
          </h3>
          <p>{point.description}</p>
        </div>
      </div>

      {isUser && (
        <div className="way-item__action">
          {point.type === 'share' ? (
            <div className="border relative border-primary rounded-3xl h-[34px] text-center pr-14 pl-5">
              <CopyButton
                content={shareUrl}
                className="absolute w-12 top-0 right-0 h-full px-3 !pt-1 border-l border-primary hover:opacity-80"
                title={t('pages.loyalty_program.copy_link', 'نسخ الرابط')}
              >
                <i className="copy-icon sicon-swap-fill"></i>
              </CopyButton>
              <h3
                className="font-bold text-sm leading-8 whitespace-nowrap text-ellipsis overflow-hidden text-primary"
                dir="ltr"
              >
                {shareUrl}
              </h3>
            </div>
          ) : point.is_completed && point.type === 'profile' ? (
            <div className="text-green-500 text-center border relative border-green-300 rounded-3xl bg-green-50 min-h-[34px] w-full pt-1 px-4">
              <i className="sicon-check-circle d-inline-block"></i>
              <span className="break-all">{t('pages.loyalty_program.completed', 'مكتمل')}</span>
            </div>
          ) : (
            <SallaButton fill="outline" width="wide" href={point.url} className="!rounded-3xl text-sm !py-1.5">
              {point.name}
            </SallaButton>
          )}
        </div>
      )}
    </div>
  );
}

function PrizeCard({ prize, isUser }: { prize: LoyaltyPrizeItem; isUser: boolean }) {
  const { t } = useTranslation();
  const img = (
    <img
      className="sm:h-full w-full object-cover rounded-t-md"
      src={prize.image}
      loading="lazy"
      alt={prize.name}
    />
  );

  return (
    <div className="slide--one-fourth">
      <div className="product-entry flex-col">
        {prize.url ? (
          <a href={prize.url} className="product-entry__image h-40">
            {img}
          </a>
        ) : (
          img
        )}
        <div className="flex-1 p-5">
          <h3 className="product-entry__title leading-6 mb-2.5">
            {prize.url ? <a href={prize.url}>{prize.name}</a> : prize.name}
          </h3>
          <p className="text-sm leading-6 ">{prize.description}</p>
        </div>
        {isUser && (
          <div className="font-bold text-primary p-4 text-center border-t">
            {prize.cost_points} {t('pages.loyalty_program.point', 'نقطة')}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Theme fork of the engine `LoyaltyPage` (rendered by `app/routes/loyalty.tsx`): View's
 * `pages/loyalty.twig` + `loyalty.js` instead of `<salla-loyalty-program>`. The primary /
 * image hero with its overlay, the `loyalty__banner` (spinning-in star, the customer's
 * points counting up, the `<salla-loyalty>` exchange button), the ways to earn points
 * (copy-link pill for `share`, "completed" badge for a done profile) and one prize
 * carousel per group. Styles: `04-components/loyalty.scss` (`body.loyalty`).
 */
export function LoyaltyPage({ page, loyalty }: LoyaltyPageProps) {
  const { t } = useTranslation();
  // Twig's `user.type == 'user'`.
  const { isLoggedIn } = useUser();
  // Twig's `user.loyalty_points`: the balance the loader got, refreshed client side.
  const { data: balance } = useQuery(loyaltyApi.queries.points());
  const points = isLoggedIn ? (balance ?? loyalty.customer?.loyalty_program_points ?? 0) : 0;
  const shownPoints = useCountUp(points);

  return (
    <>
      <HookSlot name="loyalty:start" />
      <div
        className="h-62 -mb-52 w-full bg-primary rtl:right-0 ltr:left-0 relative -z-1 bg-cover bg-no-repeat bg-center"
        style={loyalty.image ? { backgroundImage: `url(${loyalty.image})` } : undefined}
      >
        <div className="overlay h-full w-full bg-black opacity-50 absolute top-0 left-0"></div>
      </div>
      <div className="container space-y-8 lg:space-y-16">
        <Breadcrumb page={page} className="breadcrumbs w-full py-5" />

        <div data-testid="store-loyalty-banner" className="loyalty__banner">
          <div className="loyalty__banner-inner">
            <i className="sicon-star2 star-anime text-amber-400 text-7xl"></i>
            <div className="loyalty__banner-content">
              <div className="info">
                <h1>{loyalty.name}</h1>
                <p>{loyalty.description}</p>
                {!!points && (
                  <div className="loyalty-points">
                    {t('pages.loyalty_program.you_have', 'لديك')}{' '}
                    <span
                      data-testid="store-loyalty-points-count"
                      className="count-number count-anime"
                      data-count={points}
                    >
                      {shownPoints}
                    </span>{' '}
                    {t('pages.loyalty_program.point', 'نقطة')}
                  </div>
                )}
              </div>

              <SallaLoyalty data-testid="store-loyalty-exchange" customerPoints={points}>
                <div slot="widget">
                  <SallaButton onClick={() => window.salla?.event.dispatch('loyalty::open')}>
                    <span data-testid="store-loyalty-exchange-btn">
                      {t('pages.loyalty_program.exchange_points', 'استبدل نقاطك')}
                    </span>
                  </SallaButton>
                </div>
              </SallaLoyalty>
            </div>
          </div>
          {/* background big stars */}
          <div className="loyalty-star loyalty-star--first">
            <i className="sicon-star2"></i>
          </div>
          <div className="loyalty-star loyalty-star--second">
            <i className="sicon-star2"></i>
          </div>
        </div>

        <section data-testid="store-loyalty-points-ways" className="points-ways pt-6">
          <div className="s-block__title">
            <h2>{t('pages.loyalty_program.ways_to_get_points', 'طرق الحصول على النقاط')}</h2>
          </div>
          <div className="points-ways__list">
            {(loyalty.points ?? []).map((point) => (
              <WayItem key={point.id ?? point.key} point={point} isUser={isLoggedIn} />
            ))}
          </div>
        </section>

        {(loyalty.prizes ?? []).map((group) => (
          <div key={group.type}>
            <SallaSlider
              type="carousel"
              loop={group.items.length >= 4}
              blockTitle={group.title}
              id={`loyalty-slider-${group.type}`}
            >
              <div slot="items">
                {group.items.map((prize) => (
                  <PrizeCard key={prize.id} prize={prize} isUser={isLoggedIn} />
                ))}
              </div>
            </SallaSlider>
          </div>
        ))}
      </div>
      <HookSlot name="loyalty:end" />
    </>
  );
}
