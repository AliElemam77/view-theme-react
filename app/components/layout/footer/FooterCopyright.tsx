import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { MadeWithSalla } from '@salla.sa/twilight-theme-engine/layout';
import { useViewSettings } from '../../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../../lib/fieldValue';

/**
 * The owner link (`show_copyright` / `copyright_owner` / `owner_website`) and the
 * `{% hook copyright %}` text, as both Twig spots print them: the mobile bar
 * under the footer and the vertical strip of the basic layout.
 */
export function FooterCopyright() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  // Twig tests the owner with the default 'Salla' but prints it with '2025 سلة'.
  const rawOwner = settings.copyright_owner;
  const owner = rawOwner === undefined || rawOwner === null ? '2025 سلة' : optionValue(rawOwner);
  const show = booleanValue(settings.show_copyright, true) && owner.trim() !== '';
  const year = new Date().getFullYear();

  return (
    <>
      {show && (
        <a
          href={linkUrl(settings.owner_website) ?? '#'}
          target="_blank"
          tooltip={t('pages.cart.copyrights', 'المطور والمشغل الرسمي لهذا المتجر')}
        >
          © {owner}
        </a>
      )}
      <span className="text-sm copyright-text">
        {/* `{% hook copyright %}`: the platform copyright line, which apps may replace. */}
        <HookSlot
          name="copyright"
          context={{ storeName: store.name }}
          fallback={
            <>
              {t('blocks.footer.copyright', 'جميع الحقوق محفوظة')}{' '}
              <Link to="/">{store.name}</Link> © {year}
              <MadeWithSalla className="ms-2" />
            </>
          }
        />
      </span>
    </>
  );
}
