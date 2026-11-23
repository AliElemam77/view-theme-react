/**
 * Port of View's `components/footer/footer_bets.twig`: the `accordion` items and the
 * `basic` (default) columns with the back-to-top pill and the vertical copyright.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SallaMenu } from '@salla.sa/twilight-components-react/menu';
import { SallaUserMenu } from '@salla.sa/twilight-components-react/user-menu';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useViewSettings } from '../../../hooks/useViewSettings';
import { booleanValue, optionValue } from '../../../lib/fieldValue';
import { FooterContacts, FooterNewsletter, FooterSocial } from './FooterHelper';
import { FooterCopyright } from './FooterCopyright';
import { TO_UP_ICON } from './icons';

/** Twig `initFooterAccordion`'s release delay: the cap is lifted once the open transition ends. */
const RELEASE_MS = 250;

/**
 * One `.V__fot_ac_i` item. Port of `initFooterAccordion` (app.js): opening animates
 * `max-height` to the measured height, then releases it to `none` so late-rendering
 * web components (menus) are never clipped; closing pins the current height first,
 * since `none` can't transition, then drops back to the `max-h-0` class.
 */
function AccordionItem({
  title,
  titleClassName,
  contentClassName = '',
  children,
}: {
  title: ReactNode;
  titleClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}) {
  const { settings, reveal } = useViewSettings();
  const centered = booleanValue(settings.centerd_footer, true);
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string | undefined>();
  const [collapse, setCollapse] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // Closing: the pinned height is committed; flush it to style, then let it fall to 0.
  useEffect(() => {
    if (!collapse) return;
    void contentRef.current?.offsetHeight;
    const frame = requestAnimationFrame(() => {
      if (!openRef.current) setMaxHeight(undefined);
    });
    return () => cancelAnimationFrame(frame);
  }, [collapse]);

  const toggle = () => {
    const content = contentRef.current;
    if (!content) return;
    const next = !openRef.current;
    openRef.current = next;
    clearTimeout(timer.current);
    setOpen(next);
    setMaxHeight(`${content.scrollHeight}px`);
    if (next) {
      timer.current = setTimeout(() => {
        if (openRef.current) setMaxHeight('none');
      }, RELEASE_MS);
    } else {
      setCollapse((n) => n + 1);
    }
  };

  return (
    <div className={`V__fot_ac_i ${reveal}`.trim()}>
      <button
        className={`V__fot_ac_i_h cursor-pointer w-full text-base p-2.5 border-none flex justify-between items-center${open ? ' active' : ''}`}
        aria-expanded={open}
        onClick={toggle}
      >
        <h3 className={titleClassName}>{title}</h3>
        <i className="sicon-caret-down duration-200 transition-all ease-in-out" />
      </button>
      <div
        ref={contentRef}
        className={`V__fot_ac_i_c max-h-0 overflow-hidden duration-200 transition-all ease-in-out px-2.5 py-0 ${
          centered ? 'flex flex-col items-center' : ''
        }${contentClassName}${open ? ' active' : ''}`}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

/** `footer_bets.twig` `accordion`: pages, contact, account, newsletter and map items. */
export function FooterAccordion() {
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  const mapUrl = optionValue(settings.location_action) || undefined;

  return (
    <>
      <AccordionItem title={t('blocks.footer.pages_links', 'روابط الصفحات')}>
        <SallaMenu
          data-testid="store-footer-menu"
          source="footer"
          withCookiePreferences
          suppressHydrationWarning
        />
      </AccordionItem>
      <AccordionItem title={t('blocks.footer.contact_us', 'تواصل معنا')}>
        <FooterContacts />
        <FooterSocial />
      </AccordionItem>
      {booleanValue(settings.has_user_menu, true) && (
        <AccordionItem title={t('pages.cart.linkeuser', 'حسابى')}>
          <div>
            <SallaUserMenu inline suppressHydrationWarning />
          </div>
        </AccordionItem>
      )}
      {booleanValue(settings.has_newsletter, true) && (
        <AccordionItem title={t('blocks.footer.newsletter', 'النشرة البريدية')} contentClassName=" newletter">
          <FooterNewsletter />
        </AccordionItem>
      )}
      {booleanValue(settings.has_location, false) && (
        <AccordionItem title={t('blocks.footer.our_location', 'موقعنا')} titleClassName="flex-center gap-2">
          <iframe
            src={mapUrl}
            width="100%"
            height="300px"
            style={{ border: 0 }}
            title={t('blocks.footer.map_title', 'موقع المتجر على الخريطة')}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </AccordionItem>
      )}
    </>
  );
}

/** `footer_bets.twig` `basic`: the pages / account columns, the back-to-top pill and the vertical copyright. */
export function FooterBasic() {
  const { t } = useTranslation();
  const { reveal } = useViewSettings();
  const col = `flex flex-1 flex-col md:py-8 py-2 ${reveal}`.trim();

  return (
    <>
      <div className="flex gap-7 flex-1">
        <div className={col}>
          <h3>{t('blocks.footer.pages_links', 'روابط الصفحات')}</h3>
          <SallaMenu
            data-testid="store-footer-menu"
            source="footer"
            withCookiePreferences
            suppressHydrationWarning
          />
        </div>
        <span className="lineafter" />
        <div className={col}>
          <h3>{t('pages.cart.linkeuser', 'حسابى')}</h3>
          <SallaUserMenu inline suppressHydrationWarning />
        </div>
        <div className="relative md:ml-0 ml-3">
          <span className="lineafter block h-full" />
          <button className="group h-16 rounded-full w-6 bg-primary absolute top-1/2 -translate-y-1/2 -left-3">
            <div
              className="flex-center h-full w-full"
              tooltip={t('pages.cart.btn_up', 'الرجوع الى اعلى الصفحة')}
              flow="right"
              id="to_up"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              dangerouslySetInnerHTML={{ __html: TO_UP_ICON }}
            />
          </button>
        </div>
      </div>

      <div
        className="items-center justify-between md:flex hidden gap-8 my-2"
        style={{ writingMode: 'vertical-rl' }}
      >
        <FooterCopyright />
      </div>
    </>
  );
}
