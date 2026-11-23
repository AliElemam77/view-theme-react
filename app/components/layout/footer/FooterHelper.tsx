/**
 * Port of View's `components/footer/footer_helper.twig`: the `contacts`, `social` and
 * `email` (Mailchimp newsletter) partials, same markup, classes and inline styles.
 */
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useViewSettings } from '../../../hooks/useViewSettings';
import { optionValue } from '../../../lib/fieldValue';
import { CONTACT_ICONS, NEWSLETTER_ARROW_ICON, SOCIAL_ICONS } from './icons';

/** Twig's `|capitalize` / `|title` for the single-word social names. */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** `footer_helper.twig` `contacts`: the "Contact us" heading and one icon link per channel. */
export function FooterContacts() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { reveal } = useViewSettings();
  const contacts = store.contacts ?? {};
  const cls = `flex-center flex-col ${reveal}`.trim();

  const items: { key: keyof typeof CONTACT_ICONS; href: string; label: string; blank: boolean }[] =
    [];
  if (contacts.whatsapp)
    items.push({
      key: 'whatsapp',
      href: `https://wa.me/${contacts.whatsapp.replace(/\+/g, '')}`,
      label: t('pages.cart.whatsapp', 'واتساب'),
      blank: true,
    });
  if (contacts.phone)
    items.push({
      key: 'phone',
      href: `tel:${contacts.phone}`,
      label: t('pages.cart.telephone', 'هاتف'),
      blank: false,
    });
  if (contacts.mobile)
    items.push({
      key: 'mobile',
      href: `tel:${contacts.mobile}`,
      label: t('pages.cart.mobile', 'جوال'),
      blank: false,
    });
  if (contacts.email)
    items.push({
      key: 'email',
      href: `mailto:${contacts.email}`,
      label: t('pages.cart.email', 'البريد'),
      blank: false,
    });
  if (contacts.telegram)
    items.push({
      key: 'telegram',
      href: `https://t.me/${contacts.telegram.replace(/@/g, '')}`,
      label: t('pages.cart.telegram', 'تيليجرام'),
      blank: true,
    });

  return (
    <div className="flex flex-col">
      <h3>{t('blocks.footer.contact_us', 'تواصل معنا')}</h3>
      <div className="flex-center flex-wrap gap-3">
        {items.map((item) => (
          <a
            key={item.key}
            tooltip={item.label}
            href={item.href}
            target={item.blank ? '_blank' : undefined}
            rel="noopener"
            role="link"
            title={item.label}
            aria-label={item.label}
            className={cls}
            dangerouslySetInnerHTML={{ __html: CONTACT_ICONS[item.key] }}
          />
        ))}
      </div>
    </div>
  );
}

/** Maroof is the one social link shown as an image rather than an inline icon. */
const MAROOF_IMAGE = 'https://cdn.salla.sa/form-builder/J93PyJ6TfvCSvPYoVrf3Eoxt3Lmx4qO8yGv5XbyX.webp';

/** `footer_helper.twig`'s `socials` list, in its order. `pintrest` is Twig's spelling. */
const SOCIALS = [
  'maroof',
  'whatsapp',
  'pintrest',
  'snapchat',
  'instagram',
  'twitter',
  'facebook',
  'youtube',
  'tiktok',
] as const;

/** `footer_helper.twig` `social`: the store's social links with View's own icons. */
export function FooterSocial() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { reveal } = useViewSettings();
  const social = (store.social ?? {}) as Record<string, string | undefined>;

  return (
    <div
      className="flex flex-wrap gap-2 justify-center"
      role="navigation"
      aria-label="social media links"
    >
      {SOCIALS.map((name) => {
        // Twig reads `store.social.pintrest`; the store field is spelled `pinterest`.
        const url = social[name] || (name === 'pintrest' ? social.pinterest : undefined);
        if (!url) return null;
        const title = capitalize(name);
        const cls = `F__icon w-8 h-8 flex-center ${name} ${reveal}`.trim();
        const label = t('blocks.footer.social_visit', 'زيارة صفحة :name على موقع خارجي').replace(
          ':name',
          title
        );
        if (name === 'maroof') {
          return (
            <a
              key={name}
              tooltip={title}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cls}
              aria-label={label}
            >
              <img
                className="z-10 w-full h-full object-contain"
                width={100}
                height={100}
                src={MAROOF_IMAGE}
                alt={t('blocks.footer.social_logo_alt', 'شعار :name').replace(':name', title)}
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
              />
            </a>
          );
        }
        return (
          <a
            key={name}
            tooltip={title}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cls}
            aria-label={label}
            dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[name] }}
          />
        );
      })}
    </div>
  );
}

/** `footer_helper.twig` `email`: the Mailchimp signup band with the animated submit arrow. */
export function FooterNewsletter() {
  const { t, isRTL } = useTranslation();
  const { settings, reveal } = useViewSettings();
  const action = optionValue(settings.newsletter_action) || undefined;
  const promo = optionValue(settings.newsletter_promo_text) || 'جمالكِ يستحق البداية الأفضل...';

  return (
    <div id="mc_embed_shell" className="bg-primary-l flex-center lg:py-9 md:py-6 py-4  text-bgcolor">
      <div id="mc_embed_signup" className="w-full">
        <form
          action={action}
          method="post"
          id="mc-embedded-subscribe-form"
          name="mc-embedded-subscribe-form"
          className={`container flex flex-col md:flex-row justify-around items-center validate gap-2 ${reveal}`.trim()}
          target="_self"
          noValidate
        >
          <h1>{promo}</h1>
          {/* Twig writes a second `class="text-center"` here when centred; browsers keep the first. */}
          <div
            id="mc_embed_signup_scroll"
            className="max-w-xs flex items-center justify-between bg-primary-reverse border border-primary-d rounded-theme"
          >
            <div className="indicates-required hidden" />
            <div className="mc-field-group min-w-60">
              <input
                type="email"
                name="EMAIL"
                className="required email bg-transparent border-none text-xs text-primary placeholder:text-mediumgray "
                id="mce-EMAIL"
                placeholder={t('blocks.footer.mailer', 'ادخل البريد الألكترونى')}
                required
                defaultValue=""
              />
            </div>
            <div id="mce-responses" className="clear foot">
              <div className="response" id="mce-error-response" style={{ display: 'none' }} />
              <div className="response" id="mce-success-response" style={{ display: 'none' }} />
            </div>
            <div aria-hidden="true" style={{ position: 'absolute', left: '-5000px' }}>
              <input
                type="text"
                name="b_f0351b665155eef3382b18726_2cff91257d"
                tabIndex={-1}
                defaultValue=""
              />
            </div>
            <div className="optionalParent">
              <div className="clear foot flex-center">
                <button
                  type="submit"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  className={`button ${isRTL ? '' : 'flip-x'} group rtl:border-r ltr:border-l border-primary-d w-full h-full cursor-pointer py-2 px-3 flex items-center justify-center gap-2`}
                  tooltip={t('blocks.footer.supmeter', 'اشتراك')}
                  dangerouslySetInnerHTML={{ __html: NEWSLETTER_ARROW_ICON }}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
