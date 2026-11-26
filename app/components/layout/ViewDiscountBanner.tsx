/**
 * Port of the fixed discount coupon of View's `layouts/extentions.twig`
 * (`add_fixed_discount_coupons`) + app.js `V__copoun`: a ticket tucked at the
 * reading-side edge that slides in when its black stub is clicked and slides out
 * on a click outside it. The stub/ticket notches are the SVG masks global.scss uses.
 */
import { useEffect, useRef, useState } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useViewSettings } from '../../hooks/useViewSettings';
import { copyToClipboard } from '../../lib/clipboard';
import { booleanValue, optionValue } from '../../lib/fieldValue';

const COPY_ICON =
  "M9.54883 2.21875C11.1511 2.21874 12.4206 2.21919 13.4248 2.33789C14.4557 2.45976 15.3047 2.71508 16.0137 3.29688C16.2541 3.49419 16.4746 3.71467 16.6719 3.95508C17.2232 4.62686 17.482 5.42441 17.6113 6.38379C17.7163 7.16288 17.7398 8.10116 17.7461 9.23047C18.3688 9.24348 18.9157 9.27099 19.3916 9.33496C20.2917 9.45598 21.0495 9.71547 21.6514 10.3174C22.2533 10.9193 22.5128 11.677 22.6338 12.5771C22.7503 13.4441 22.75 14.5466 22.75 15.9141V17.0234C22.75 18.3909 22.7503 19.4934 22.6338 20.3604C22.5128 21.2605 22.2533 22.0182 21.6514 22.6201C21.0495 23.222 20.2917 23.4815 19.3916 23.6025C18.5247 23.7191 17.4222 23.7188 16.0547 23.7188H14.9453C13.5778 23.7188 12.4753 23.7191 11.6084 23.6025C10.7083 23.4815 9.95055 23.222 9.34863 22.6201C8.74672 22.0182 8.48723 21.2605 8.36621 20.3604C8.30224 19.8844 8.27473 19.3375 8.26172 18.7148C7.13241 18.7085 6.19413 18.6851 5.41504 18.5801C4.45566 18.4508 3.65811 18.1919 2.98633 17.6406C2.74592 17.4433 2.52544 17.2228 2.32813 16.9824C1.74633 16.2735 1.49101 15.4245 1.36914 14.3936C1.25044 13.3893 1.24999 12.1198 1.25 10.5176V10.4199C1.24999 8.81766 1.25044 7.54816 1.36914 6.54395C1.49101 5.51302 1.74633 4.664 2.32813 3.95508C2.52544 3.71467 2.74592 3.49419 2.98633 3.29688C3.69525 2.71508 4.54427 2.45976 5.5752 2.33789C6.57941 2.21919 7.84891 2.21874 9.45117 2.21875H9.54883ZM15 10.7188C13.5648 10.7188 12.5639 10.7208 11.8086 10.8223C11.0748 10.9209 10.6859 11.1012 10.4092 11.3779C10.1324 11.6547 9.95217 12.0436 9.85352 12.7773C9.75202 13.5326 9.75 14.5336 9.75 15.9688V16.9688C9.75 18.4039 9.75202 19.4049 9.85352 20.1602C9.95217 20.8939 10.1324 21.2828 10.4092 21.5596C10.6859 21.8363 11.0748 22.0166 11.8086 22.1152C12.5639 22.2167 13.5648 22.2188 15 22.2188H16C17.4352 22.2188 18.4361 22.2167 19.1914 22.1152C19.9252 22.0166 20.3141 21.8363 20.5908 21.5596C20.8676 21.2828 21.0478 20.8939 21.1465 20.1602C21.248 19.4049 21.25 18.4039 21.25 16.9688V15.9688C21.25 14.5336 21.248 13.5326 21.1465 12.7773C21.0478 12.0436 20.8676 11.6547 20.5908 11.3779C20.3141 11.1012 19.9252 10.9209 19.1914 10.8223C18.4361 10.7208 17.4352 10.7188 16 10.7188H15ZM9.5 3.71875C7.83789 3.71875 6.65689 3.72007 5.75098 3.82715C4.8621 3.93225 4.33579 4.13013 3.93848 4.45605C3.77392 4.59111 3.62236 4.74267 3.4873 4.90723C3.16138 5.30454 2.9635 5.83085 2.8584 6.71973C2.75132 7.62564 2.75 8.80664 2.75 10.4688C2.75 12.1309 2.75132 13.3119 2.8584 14.2178C2.9635 15.1067 3.16138 15.633 3.4873 16.0303C3.62236 16.1948 3.77392 16.3464 3.93848 16.4814C4.31534 16.7906 4.80869 16.9849 5.61621 17.0938C6.2952 17.1852 7.1401 17.2082 8.25 17.2148V15.9141C8.24998 14.5466 8.24968 13.4441 8.36621 12.5771C8.48723 11.677 8.74672 10.9193 9.34863 10.3174C9.95055 9.71547 10.7083 9.45598 11.6084 9.33496C12.4753 9.21843 13.5778 9.21873 14.9453 9.21875H16.2461C16.2395 8.10885 16.2165 7.26395 16.125 6.58496C16.0162 5.77744 15.8219 5.28409 15.5127 4.90723C15.3776 4.74267 15.2261 4.59111 15.0615 4.45605C14.6642 4.13013 14.1379 3.93225 13.249 3.82715C12.3431 3.72007 11.1621 3.71875 9.5 3.71875Z";
const BARCODE =
  "M.105 59.241h13.327v3.201H.105zm0-35.224h13.327v-3.201H.105zm0-5.603h13.327V15.21H.105zm0 20.813h13.327v-2.402H.105zm0-31.222h13.327v-2.4H.105zm0 84.06h13.327v-2.403H.105zm0-77.656h13.327v-2.4H.105zm0 16.012h13.327v-1.6H.105zm0-26.419h13.327v-1.6H.105zm0 91.263h13.327v-1.6H.105zm0-45.631h13.327v-1.6H.105zm0 33.624h13.327v-1.6H.105zm0-40.827h13.327v-1.604H.105zm0 33.621h13.327v-1.6H.105zm0-4.804h13.327v-1.6H.105zm0 28.592h13.327v-.573H.105zm0-2.173h13.327v-.8H.105zm0-8.806h13.327v-.8H.105zm0-4.003h13.327v-.801H.105zm0-4.803h13.327v-.8H.105zm0-2.403h13.327v-.798H.105zm0-11.205h13.327v-.801H.105zm0-1.603h13.327v-.799H.105zm0-6.404h13.327v-.8H.105zm0-2.402h13.327v-.799H.105zm0-3.105v.703h13.327v-.799H.105zm0-1.696h13.327v-.802H.105zm0-6.407h13.327v-.8H.105zm0-9.53v.726h13.327v-.801H.105zm0-3.279h13.327v-.799H.105zm0-4.801h13.327v-.801H.105zm0-7.206h13.327v-.801H.105zm0-8.806h13.327v-.801H.105zm0-1.6h13.327v-.802H.105zM.105 0v.802h13.327V0z";
const MASKS: { id: string; transform: string; d: string }[] = [
  { id: "mask-black-rond", transform: "scale(0.008130081300813009,0.006896551724137931)", d: "M6.19979 11.8824C6.19979 15.0285 3.64953 17.5814 0.500755 17.5814V22.6038C3.64953 22.6038 6.19979 25.1541 6.19979 28.3029C6.19979 31.449 3.64953 34.0019 0.500755 34.0019V39.0243C3.64953 39.0243 6.19979 41.5746 6.19979 44.7234C6.19979 47.8695 3.64953 50.4224 0.500755 50.4224V55.1403C10.1241 55.1403 17.9257 62.942 17.9257 72.5653C17.9257 82.1886 10.1241 89.9903 0.500755 89.9903V95.0127C3.64953 95.0127 6.19979 97.563 6.19979 100.712C6.19979 103.861 3.64953 106.411 0.500755 106.411V111.433C3.64953 111.433 6.19979 113.983 6.19979 117.132C6.19979 120.278 3.64953 122.831 0.500755 122.831V127.854C3.64953 127.854 6.19979 130.404 6.19979 133.553C6.19979 136.699 3.64953 139.252 0.500755 139.252V144.279H122.5L122.5 0.853821H0.500755V6.18333C3.64953 6.18333 6.19979 8.73358 6.19979 11.8824Z" },
  { id: "mask-prima-round", transform: "scale(0.003952569169960474,0.006944444444444444)", d: "M246.409 132.4C246.409 129.251 248.959 126.701 252.105 126.701V121.678C248.959 121.678 246.409 119.125 246.409 115.979C246.409 112.83 248.959 110.28 252.105 110.28V105.258C248.959 105.258 246.409 102.707 246.409 99.5587C246.409 96.4099 248.959 93.8597 252.105 93.8597V89.1417C242.485 89.1417 234.683 81.3374 234.683 71.7167C234.683 62.0934 242.485 54.2917 252.105 54.2917V49.2693C248.959 49.2693 246.409 46.7164 246.409 43.5703C246.409 40.4215 248.959 37.8712 252.105 37.8712V32.8488C248.959 32.8488 246.409 30.2959 246.409 27.1498C246.409 24.001 248.959 21.4507 252.105 21.4507V16.4283C248.959 16.4283 246.409 13.8754 246.409 10.7293C246.409 7.58049 248.959 5.03024 252.105 5.03024V0H0.968155V143.426H252.105V138.099C248.959 138.099 246.409 135.546 246.409 132.4Z" },
  { id: "mask-black-rond-inverse", transform: "scale(0.009259259259259259,0.006944444444444444)", d: "M101.335 11.0285C101.335 14.1747 103.886 16.7276 107.034 16.7276V21.75C103.886 21.75 101.335 24.3003 101.335 27.449C101.335 30.5952 103.886 33.1481 107.034 33.1481V38.1705C103.886 38.1705 101.335 40.7208 101.335 43.8695C101.335 47.0157 103.886 49.5686 107.034 49.5686V54.2865C97.4111 54.2865 89.6094 62.0882 89.6094 71.7115C89.6094 81.3348 97.4111 89.1365 107.034 89.1365V94.1589C103.886 94.1589 101.335 96.7092 101.335 99.858C101.335 103.007 103.886 105.557 107.034 105.557V110.579C103.886 110.579 101.335 113.13 101.335 116.278C101.335 119.425 103.886 121.977 107.034 121.977V127C103.886 127 101.335 129.55 101.335 132.699C101.335 135.845 103.886 138.398 107.034 138.398V143.426H6.66943e-06L0 0H107.034V5.3295C103.886 5.3295 101.335 7.87976 101.335 11.0285Z" },
  { id: "mask-prima-round-inverse", transform: "scale(0.003968253968253968,0.006944444444444444)", d: "M5.69643 132.4C5.69643 129.251 3.14618 126.701 0 126.701V121.678C3.14618 121.678 5.69643 119.125 5.69643 115.979C5.69643 112.83 3.14618 110.28 0 110.28V105.258C3.14618 105.258 5.69643 102.707 5.69643 99.5587C5.69643 96.4099 3.14618 93.8597 0 93.8597V89.1417C9.62069 89.1417 17.4224 81.3374 17.4224 71.7167C17.4224 62.0934 9.62069 54.2917 0 54.2917V49.2693C3.14618 49.2693 5.69643 46.7164 5.69643 43.5703C5.69643 40.4215 3.14618 37.8712 0 37.8712V32.8488C3.14618 32.8488 5.69643 30.2959 5.69643 27.1498C5.69643 24.001 3.14618 21.4507 0 21.4507V16.4283C3.14618 16.4283 5.69643 13.8754 5.69643 10.7293C5.69643 7.58049 3.14618 5.03024 0 5.03024V0H251.137V143.426H0V138.099C3.14618 138.099 5.69643 135.546 5.69643 132.4Z" },
];

type Phase = 'idle' | 'active' | 'closing';

export function ViewDiscountBanner() {
  const { store } = useTwilight();
  const { t } = useTranslation();
  const { settings } = useViewSettings();
  const [phase, setPhase] = useState<Phase>('idle');
  const ref = useRef<HTMLDivElement>(null);
  const enabled = booleanValue(settings.add_fixed_discount_coupons);

  useEffect(() => {
    if (phase !== 'active') return;
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setPhase('closing');
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [phase]);

  if (!enabled) return null;

  const code = optionValue(settings.fixed_discount_code);
  const percent = optionValue(settings.coupon_discount_percentage);
  const copy = () => {
    copyToClipboard(code, () => {
      try {
        window.salla?.notify?.success?.(`${t('pages.products.copied')} : ${code}`);
      } catch {
        /* no notifier */
      }
    });
  };

  return (
    <>
      <div
        ref={ref}
        id="discount-banner"
        className={`z-[60] max-w-80 mx-auto${phase === 'idle' ? '' : ` ${phase}`}`}
        style={{ bottom: `${optionValue(settings.bottom_ver)}%` }}
        onAnimationEnd={() => phase === 'closing' && setPhase('idle')}
      >
        <figure className="mx-auto w-full flex items-stretch justify-center">
          <div className="flex-1 bg-primary-l p-4 flex flex-col text-right prima_round">
            <h3 className="leading-none whitespace-nowrap text-xs font-extrabold text-darkgray">
              {optionValue(settings.fixed_discount_title)}
            </h3>
            <div className="mt-2 mb-2 text-3xl font-black whitespace-nowrap">
              {t('blocks.header.discountma')} <span className="align-baseline text-price">{percent}%</span>
            </div>
            <div className="text-xs flex items-center justify-between border-b border-darkgray text-darkgray pb-0.5">
              <strong>{t('blocks.header.copune_ma')}</strong>
              <span>{code}</span>
              <button
                tooltip={`${t('blocks.header.copy')} : ${code}`}
                type="button"
                className="inline-flex items-center justify-center transition hover:opacity-90"
                onClick={copy}
                aria-label={t('blocks.header.copy_code_aria', { code })}
              >
                <svg width="24" height="24" viewBox="0 0 24 25" fill="none" className="md:h-6 md:w-6 w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                  <path d={COPY_ICON} fill="var(--dark-gray-color)" />
                </svg>
              </button>
            </div>
            <span className="mt-auto text-xs pt-0.5 opacity-90 leading-none">
              {optionValue(settings.fixed_discount_subtitle)}
            </span>
          </div>
          <div
            className="relative w-[35%] bg-darkgray flex items-center gap-2 text-lightgray justify-between rtl:pl-7 ltr:pr-7 py-2 rtl:pr-2 ltr:pl-2 black_rond rtl:-mr-0.5 ltr:-ml-0.5"
            id="blackRond"
            onClick={(event) => {
              event.stopPropagation();
              setPhase((current) => (current === 'active' ? 'closing' : 'active'));
            }}
          >
            <div className="flex flex-col items-center text-xxs">
              <span className="[writing-mode:vertical-rl] font-bold leading-none text-price">%{percent}</span>
              <span className="[writing-mode:vertical-rl] mt-2 leading-none">{t('blocks.header.copune_sol')}</span>
            </div>
            <span className="leading-none [writing-mode:vertical-rl]">{store.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 100" fill="none" width="14" height="100">
              <path fill="currentColor" d={BARCODE} />
            </svg>
          </div>
        </figure>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <defs>
          {MASKS.map((mask) => (
            <mask key={mask.id} id={mask.id} maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">
              <path fill="#fff" transform={mask.transform} d={mask.d} />
            </mask>
          ))}
        </defs>
      </svg>
    </>
  );
}
