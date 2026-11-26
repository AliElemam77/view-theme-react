import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { SallaButton } from '@salla.sa/twilight-components-react/button';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot, useIsClient, usePageConfig } from '@salla.sa/twilight-theme-engine/hooks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import type { ThankYouPageProps } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import { stripUnsafeHtml } from '@salla.sa/twilight-theme-engine/utils';
import { copyToClipboard } from '../../lib/clipboard';

const WAVE_PATH =
  'M0,96L120,112C240,128,480,160,720,165.3C960,171,1200,149,1320,138.7L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z';

/** `.thanks-item` stagger: `app.anime('.thanks-item', …)` delays each by `i * 100`ms. */
const thanksDelay = (i: number) => ({ animationDelay: `${i * 100}ms` });

/**
 * View's `<salla-button onclick="app.copyToClipboard(event)" shape="link" data-content="…">`:
 * the inner `<button>` the web component renders (a plain button stays valid inside a
 * `<p>`). Copying runs `app.copyToClipboard`'s steps: `copied` for a second (green
 * text, check icon) and `salla.notify.success("Copied : text")`.
 */
export function CopyButton({
  content,
  color = 'primary',
  className = '',
  title,
  children,
}: {
  content: string;
  color?: 'primary' | 'dark';
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const onCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    copyToClipboard(content);
    setCopied(true);
    try {
      window.salla?.notify.success(`${t('pages.products.copied', 'تم النسخ')} : ${content}`);
    } catch {
      /* SDK not ready */
    }
  };

  return (
    <button
      type="button"
      title={title}
      data-content={content}
      onClick={onCopy}
      className={`s-button-element s-button-link s-button-${color}-link s-button-loader-after ${className} ${copied ? 'copied' : 'code-to-copy'}`
        .replace(/\s+/g, ' ')
        .trim()}
    >
      <span className="s-button-text">{children}</span>
    </button>
  );
}

/**
 * Theme fork of the engine `ThankYouPage` (rendered by `app/routes/thankyou.$orderId.tsx`):
 * View's `pages/thank-you.twig` + `thankyou.js` instead of the `<salla-thank-you-page>`
 * family. The primary band with its wave, the `delivery-bro.svg` illustration, title and
 * copyable order number grow in (`.thanks-item`, `thank-you.scss`), then the order
 * details button, the merchant's instructions, shipments / next-order coupon / pickup
 * branch, the "email sent" or resend-invoice block and the support contacts.
 */
export function ThankYouPage({
  page,
  order,
  thank_you_title,
  messages = [],
  instructions,
  is_pickable,
}: ThankYouPageProps) {
  const { store } = useTwilight();
  const { t } = useTranslation();
  // The order components and `order.sendInvoice` read the order id from `salla.config.page.id`.
  usePageConfig(page);
  // Order widgets rewrite their light DOM once the SDK loads, which can come before hydration.
  const isClient = useIsClient();
  const title = thank_you_title || t('pages.thank_you.hero_title', 'شكراً لتسوقكم عبر متجرنا... 😊');
  const orderInstructions = order?.instructions || instructions;
  const contacts = store.contacts ?? {};

  // thankyou.js: `salla.order.event.onInvoiceSent(res => { form.innerHTML = res.data.message; form.classList.add('sent') })`.
  const [invoiceMessage, setInvoiceMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const sendingTimerRef = useRef<number | null>(null);
  useEffect(() => {
    const clearSendingTimer = () => {
      if (sendingTimerRef.current !== null) {
        window.clearTimeout(sendingTimerRef.current);
        sendingTimerRef.current = null;
      }
    };
    const salla = window.salla;
    const onSent = (res: unknown) => {
      clearSendingTimer();
      setSending(false);
      const message = (res as { data?: { message?: string } } | undefined)?.data?.message;
      setInvoiceMessage(message ?? t('pages.thank_you.invoice_sent_success', 'تم إرسال الفاتورة بنجاح'));
    };
    const onFailed = () => {
      clearSendingTimer();
      setSending(false);
    };
    salla?.event?.on?.('order::invoice.sent', onSent);
    salla?.event?.on?.('order::invoice.not.sent', onFailed);
    return () => {
      clearSendingTimer();
      salla?.event?.off?.('order::invoice.sent', onSent);
      salla?.event?.off?.('order::invoice.not.sent', onFailed);
    };
  }, [t]);

  const onSendInvoice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    if (sendingTimerRef.current !== null) window.clearTimeout(sendingTimerRef.current);
    // Safety net: the invoice events clear it on a real response; this covers a silent bail.
    sendingTimerRef.current = window.setTimeout(() => {
      sendingTimerRef.current = null;
      setSending(false);
    }, 8000);
    window.salla?.form.onSubmit('order.sendInvoice', event);
  };

  const iconBox = (icon: string) => (
    <div className="bg-lightgray rounded-icon text-darkgray w-12 h-12 mb-2.5">
      <i className={`${icon} text-xl`}></i>
    </div>
  );

  return (
    <>
      <HookSlot name="thank-you:start" />
      <div className="h-52 -mb-52 w-full bg-primary rtl:right-0 ltr:left-0 relative -z-1">
        <svg
          className="text-primary absolute top-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <path className="fill-current" fillOpacity="1" d={WAVE_PATH}></path>
        </svg>
      </div>
      <div className="container mb-20">
        <Breadcrumb page={page} className="breadcrumbs thankyou-breadcrumbs w-full py-5" />
        <div className="bg-primary-reverse border border-lightgray text-darkgray p-4 md:p-8 rounded-md mb-6 md:mb-8">
          <div className="flex flex-col items-center pt-16 pb-10">
            <div className="rtl:-scale-x-100">
              <img
                src="/images/delivery-bro.svg"
                alt={title}
                className="thanks-item opacity-0 w-40 mb-8"
                style={thanksDelay(0)}
              />
            </div>
            <h1
              data-testid="store-thankyou-title"
              className="font-bold text-lg mb-2.5 thanks-item opacity-0"
              style={thanksDelay(1)}
            >
              {title}
            </h1>
            {order && (
              <p
                className="thanks-item opacity-0 text-mediumgray max-w-xs text-center text-sm leading-6 mb-6"
                style={thanksDelay(2)}
              >
                {t('pages.thank_you.order_id', 'رقم الطلب')}{' '}
                <CopyButton
                  content={String(order.reference_id)}
                  color="dark"
                  className="relative"
                >
                  <span data-testid="store-thankyou-order-id">#{order.reference_id}</span>
                  <i className="copy-icon sicon-swap-stroke pointer-events-none rtl:mr-1 ltr:ml-1"></i>
                </CopyButton>
              </p>
            )}
            {order && (
              <SallaButton
                onClick={() =>
                  window.salla?.order.show({ order_id: order.id, url: order.urls.customer })
                }
              >
                <span data-testid="store-thankyou-order-details-btn">
                  <i className="sicon-newspaper rtl:ml-1 ltr:mr-1"></i>
                  {t('pages.thank_you.order_details', 'تفاصيل الطلب')}
                </span>
              </SallaButton>
            )}
          </div>

          {orderInstructions && (
            <article
              className="article article--main article--small text-center"
              // nosemgrep: the store's own order message, with unsafe markup stripped
              dangerouslySetInnerHTML={{ __html: stripUnsafeHtml(orderInstructions) }}
            />
          )}

          {messages.map((message) => (
            <div
              key={message}
              className="flex flex-col items-center pt-1 pb-10 justify-start rtl:space-x-reverse space-x-2"
            >
              <span className="font-bold">{message}</span>
            </div>
          ))}

          <HookSlot name="thank-you:items.start" />

          <HookSlot name="thank-you:items.end" />
        </div>

        {isClient && (
          <>
            {/* Split shipment tracking - self-hides for single-shipment orders */}
            <salla-order-shipments
              className="block mb-6 md:mb-8 empty:hidden"
              {...(order ? { 'order-id': String(order.id) } : {})}
            />

            {/* Coupon the shopper can use on their next order — self-hides when none is granted */}
            <salla-next-order-coupon data-testid="store-thankyou-coupon" />

            {is_pickable && <salla-order-branch data-testid="store-thankyou-branch" />}
          </>
        )}

        <div className="lg:flex rtl:space-x-reverse lg:space-x-8">
          {order?.email_sent ? (
            <div className="duration-500 hover:shadow-default flex-1 bg-primary-reverse border border-lightgray text-darkgray p-8 rounded-md mb-6 md:mb-10 flex flex-col items-center justify-center">
              {iconBox('sicon-newspaper-alt')}
              <p className="text-sm mb-2.5">
                {t('pages.thank_you.email_sent', 'تم إرسال الفاتورة إلى بريدك الإلكتروني')}
              </p>
              <b className="text-sm">{order.customer?.email}</b>
            </div>
          ) : invoiceMessage !== null ? (
            <div id="invoice-form" className="thankyou-block sent">
              {invoiceMessage}
            </div>
          ) : (
            <div id="invoice-form" className="thankyou-block">
              {iconBox('sicon-newspaper-alt')}
              <p className="text-sm mb-2.5">
                {t('pages.thank_you.resend_email', 'إرسال الفاتورة إلى البريد الإلكتروني')}
              </p>
              <form onSubmit={onSendInvoice}>
                <div className="flex max-w-3xl w-full">
                  <input
                    data-testid="store-thankyou-email-input"
                    type="email"
                    className="form-input rtl:rounded-l-none ltr:rounded-r-none rtl:border-l-0 ltr:border-r-0 !w-[160px] sm:!w-[220px]"
                    aria-label={t('pages.profile.email', 'Email')}
                    placeholder="your@email.com"
                    required
                    name="email"
                  />
                  <SallaButton
                    type="submit"
                    loaderPosition="center"
                    loading={sending}
                    className="rtl:rounded-r-none ltr:rounded-l-none lg:w-24 h-10"
                  >
                    <span data-testid="store-thankyou-email-submit" className="btn__text">
                      {t('blocks.comments.submit', 'إرسال')}
                    </span>
                  </SallaButton>
                </div>
              </form>
            </div>
          )}

          <div className="thankyou-block">
            {iconBox('sicon-mail-letter')}
            <p className="text-sm mb-2.5">{t('common.titles.support', 'الدعم الفني')}</p>

            <div className="flex rtl:space-x-reverse space-x-6">
              {contacts.mobile && (
                <div className="text-sm unicode flex items-center">
                  <i className="sicon-phone"></i>
                  <a href={`tel:${contacts.mobile}`} className="hover:text-primary transition">
                    <b className="unicode mx-1.5">{contacts.mobile}</b>
                  </a>
                </div>
              )}

              {contacts.whatsapp && (
                <div className="text-sm unicode flex items-center">
                  <i className="sicon-whatsapp"></i>
                  <a
                    href={`https://wa.me/${contacts.whatsapp.replace(/[ +-]/g, '')}`}
                    className="hover:text-primary transition"
                    target="_blank"
                    rel="noopener"
                  >
                    <b className="unicode mx-1.5">{contacts.whatsapp}</b>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <HookSlot name="thank-you:end" />
      </div>
    </>
  );
}
