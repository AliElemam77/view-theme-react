import { Suspense, useState } from 'react';
import { SallaAppsIcons } from '@salla.sa/twilight-components-react/apps-icons';
import { SallaPayments } from '@salla.sa/twilight-components-react/payments';
import { SallaTrustBadges } from '@salla.sa/twilight-components-react/trust-badges';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { ImageModal } from '@salla.sa/twilight-theme-engine/modal';
import { ActionBtn } from '../common/ActionBtn';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { FooterAccordion, FooterBasic } from './footer/FooterBets';
import { FooterContacts, FooterNewsletter, FooterSocial } from './footer/FooterHelper';
import { FooterCopyright } from './footer/FooterCopyright';

const SBC_ICON = 'https://cdn.salla.sa/form-builder/xgBjng1agyeR3FIW3tvzySXALsIpGKODOIAGtKyt.webp';
const TAX_ICON = 'https://cdn.salla.sa/form-builder/0W57ZUBOGSu2JACGXFVc5cOFnRJ0qIBSvoDX1xs8.webp';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** The tax number, plus the certificate icon that opens the certificate (Twig's `salla-modal`). */
function FooterTax() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { reveal } = useViewSettings();
  const [open, setOpen] = useState(false);
  const number = store.settings?.tax?.number;
  const certificate = store.settings?.tax?.certificate;
  if (!number) return null;

  return (
    <>
      <div className={cx('flex rtl:space-x-reverse space-x-2 items-end', reveal)}>
        {certificate && (
          <button
            type="button"
            className="load-img-onclick bg-transparent border-0 p-0 cursor-pointer"
            aria-label={t('common.elements.tax_number')}
            onClick={() => setOpen(true)}
          >
            <img
              width={40}
              height={40}
              src={TAX_ICON}
              className="w-10 rounded-sm hover:opacity-80 transition-opacity"
              alt={t('common.elements.tax_number')}
              loading="lazy"
              decoding="async"
            />
          </button>
        )}
        <div>
          <p className="text-sm text-text-grey mb-1">{t('common.elements.tax_number')}</p>
          <b className="text-sm">{number}</b>
        </div>
      </div>
      {certificate && (
        // Its own boundary: the modal loads lazily, and ThemeLayout renders the footer outside one.
        <Suspense fallback={null}>
          <ImageModal
            isOpen={open}
            onClose={() => setOpen(false)}
            src={certificate}
            alt={number}
            title={number}
          />
        </Suspense>
      )}
    </>
  );
}

/**
 * Port of View's `components/footer/footer.twig`: the newsletter band, the logo /
 * description / social / working-hours column, the `footer_bets` links (basic
 * columns or accordion), then payments, trust badges, SBC, tax, apps and contacts,
 * and the mobile copyright bar.
 */
export function ViewFooter() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { settings, reveal } = useViewSettings();

  const bgImage = optionValue(settings.footer_bg_image);
  const hasBg = booleanValue(settings.has_footer_bg_image) && !!bgImage;
  const centered = booleanValue(settings.centerd_footer, true);
  const isDefault = (optionValue(settings.style_footer) || 'defult') === 'defult';
  const logoLight = optionValue(settings.footer_logo_light) || store.logo;
  const logoDark = optionValue(settings.footer_logo_dark) || logoLight;
  const location = linkUrl(settings.location_action_link);

  return (
    <footer
      data-testid="store-footer"
      className={cx('store-footer', hasBg && 'lazy__bg clear-both bg-cover bg-no-repeat')}
      style={hasBg ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      <HookSlot name="footer:start" />
      {booleanValue(settings.has_newsletter, true) && <FooterNewsletter />}
      <div aria-label="footer" className="store-footer__inner">
        <div
          className={cx(
            'container  justify-between flex flex-col md:flex-row md:gap-6',
            centered && 'items-stretch'
          )}
        >
          <div className="md:max-w-sm flex md:w-1/3 w-full justify-between  ">
            <div
              className={cx(
                'leading-6 flex  flex-col justify-between gap-2 pt-8 rtl:md:pl-5 ltr:md:pr-5 md:pb-8 ',
                centered && 'items-center'
              )}
            >
              <Link to="/" className={cx('flex items-center m-0', reveal)} title={store.name}>
                {booleanValue(settings.show_footer_logo, true) ? (
                  <>
                    <img
                      src={logoLight}
                      alt={store.name}
                      width={110}
                      height={40}
                      className="footer_logo dark:hidden carbon:hidden"
                      loading="lazy"
                      decoding="async"
                    />
                    <img
                      src={logoDark}
                      alt={store.name}
                      width={110}
                      height={40}
                      className="footer_logo hidden dark:block carbon:block"
                      loading="lazy"
                      decoding="async"
                    />
                  </>
                ) : (
                  <h3>{store.name}</h3>
                )}
              </Link>
              {store.description && (
                <div
                  className={centered ? cx('text-center', reveal) : undefined}
                  // Merchant HTML, as Twig's `store.description|raw`.
                  dangerouslySetInnerHTML={{ __html: store.description }}
                />
              )}
              {isDefault && (
                <>
                  <FooterSocial />
                  {booleanValue(settings.show_working_hours, true) && (
                    <div className="flex-center flex-col text-center">
                      <h3>{t('blocks.footer.working_hours')}</h3>
                      <p className="font-medium">
                        {optionValue(settings.working) || t('blocks.footer.working_hours_default')}
                      </p>
                      {location && (
                        <div tooltip={t('pages.cart.treger_location')} className="mt-2 w-full">
                          <ActionBtn
                            text={t('pages.cart.treger_log')}
                            href={location}
                            dataStyle="filled"
                            color="var(--color-primary-reverse)"
                            backgroundColor="var(--color-primary)"
                            icon
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <span className="lineafter md:hidden block h-px !w-full" />
                </>
              )}
            </div>
            <span className="lineafter md:block hidden" />
          </div>
          {isDefault ? (
            <FooterBasic />
          ) : (
            <div className="grid gap-3 grid-col-1 sm:grid-cols-2 md:w-2/3 w-full pb-8 md:pt-8 ">
              <FooterAccordion />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row items-center justify-between py-4 container text-center gap-6">
        <div className="flex-col flex">
          <SallaPayments data-testid="store-footer-payments" className={reveal || undefined} />
          <div className="flex gap-4">
            <SallaTrustBadges data-testid="store-footer-trust-badges" />
            {store.settings?.certificate?.id && (
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://eauthenticate.saudibusiness.gov.sa/certificate-details/${store.settings.certificate.id}`}
                className="flex items-center text-center gap-1 mt-6 md:mt-5"
                tooltip={t('pages.cart.verification')}
                id="verification"
              >
                <img
                  src={SBC_ICON}
                  loading="lazy"
                  className="md:w-12 md:h-12  w-6 h-6 object-contain"
                  width={32}
                  height={32}
                  alt={t('pages.cart.verification')}
                />
              </a>
            )}
            <FooterTax />
          </div>
        </div>
        <SallaAppsIcons data-testid="store-footer-apps" className={cx('max-w-xs', reveal)} />
        <FooterContacts />
      </div>
      <div className="items-center flex-col justify-between md:hidden flex py-2 bg-primary-reverse">
        <FooterCopyright />
      </div>
      <HookSlot name="footer:end" />
    </footer>
  );
}
