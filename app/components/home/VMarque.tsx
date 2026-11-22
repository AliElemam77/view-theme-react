import { memo, useState } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { Marquee } from '../common/Marquee';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { linkUrl, optionValue } from '../../lib/fieldValue';

export interface MarqueeItem {
  item_text?: string;
  item_text_active?: string;
  text_color?: string;
  item_icon?: string;
  button_link?: unknown;
  button_text?: string;
  main_image?: string;
}

export interface VMarqueData {
  sellectstyle?: unknown;
  color_bg?: string;
  color_bgtow?: string;
  add_mask?: boolean;
  addraduse?: boolean;
  has_container?: boolean;
  notmrb?: boolean;
  offers_marquee?: MarqueeItem[];
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  use_custom_colors?: boolean;
  position?: number;
}

export const VMarque = memo(function VMarque({ data }: { data?: VMarqueData }) {
  if (!data) return null;

  const [dismissed, setDismissed] = useState(false);
  const items = data.offers_marquee ?? [];
  if (items.length === 0 || dismissed) return null;

  const selectStyle = optionValue(data.sellectstyle) || 'normal';
  const isFixed = selectStyle === 'fixed';
  const saprator = optionValue(data.saprator);

  const bgStyle: CSSProperties = {
    background:
      data.color_bg && data.color_bgtow
        ? `linear-gradient(to right, ${data.color_bgtow}, ${data.color_bg})`
        : 'var(--color-primary-light)',
  };

  return (
    <SectionWrapper
      id={`V_marque-${data.position ?? 0}`}
      ariaLabel="Offers Section"
      className={`V__marquee p-1 ${isFixed ? 'V__marquee_fixed z-50' : ''} ${
        data.addraduse ? 'rounded-theme' : ''
      }`}
      style={bgStyle}
      hasContainer={data.has_container}
      notmrb={data.notmrb || isFixed}
    >
      <div className="flex items-center w-full">
        {isFixed && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="hover:opacity-40 transition-all opacity-70 p-1 me-2 shrink-0"
            aria-label="Close Offers Section"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 21 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M10.6673 2C6.07565 2 2.33398 5.74167 2.33398 10.3333C2.33398 14.925 6.07565 18.6667 10.6673 18.6667C15.259 18.6667 19.0007 14.925 19.0007 10.3333C19.0007 5.74167 15.259 2 10.6673 2ZM13.4673 12.25C13.709 12.4917 13.709 12.8917 13.4673 13.1333C13.3423 13.2583 13.184 13.3167 13.0257 13.3167C12.8673 13.3167 12.709 13.2583 12.584 13.1333L10.6673 11.2167L8.75065 13.1333C8.62565 13.2583 8.46732 13.3167 8.30898 13.3167C8.15065 13.3167 7.99232 13.2583 7.86732 13.1333C7.62565 12.8917 7.62565 12.4917 7.86732 12.25L9.78398 10.3333L7.86732 8.41667C7.62565 8.175 7.62565 7.775 7.86732 7.53333C8.10898 7.29167 8.50898 7.29167 8.75065 7.53333L10.6673 9.45L12.584 7.53333C12.8257 7.29167 13.2257 7.29167 13.4673 7.53333C13.709 7.775 13.709 8.175 13.4673 8.41667L11.5507 10.3333L13.4673 12.25Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        <Marquee addMask={data.add_mask} speed={30} className="flex-1">
          <div className="flex items-center gap-8 py-1">
            {items.map((item, index) => {
              const url = linkUrl(item.button_link);
              return (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 text-sm md:text-base font-bold whitespace-nowrap"
                  style={{ color: item.text_color }}
                >
                  <span>{item.item_text}</span>
                  {item.item_text_active && (
                    <span className="font-extrabold">{item.item_text_active}</span>
                  )}
                  {item.item_icon && <i className={item.item_icon} aria-hidden="true" />}
                  {url && item.button_text && (
                    <Link
                      to={url}
                      className="px-3 py-0.5 rounded-full border text-xs hover:opacity-80 transition-opacity"
                      style={{ borderColor: item.text_color || 'currentColor' }}
                    >
                      {item.button_text}
                    </Link>
                  )}
                  {item.main_image && (
                    <img
                      src={item.main_image}
                      alt=""
                      className="w-6 h-6 object-contain inline-block"
                      loading="lazy"
                    />
                  )}
                </span>
              );
            })}
          </div>
        </Marquee>
      </div>

      {/* Separator */}
      {(saprator === 'solid' || saprator === 'star') && (
        <div
          className={`relative w-full py-6 ${data.merge_with_adjacent ? '-my-6' : 'mt-3'} ${
            saprator === 'solid' ? 'container' : ''
          }`}
        >
          <div
            className="h-px w-full"
            style={{
              backgroundColor:
                data.use_custom_colors && data.line_color
                  ? data.line_color
                  : 'var(--color-primary-light)',
            }}
          />
          {saprator === 'star' && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${data.star_position_x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="48" height="57" viewBox="0 0 48 57" fill="none">
                <path
                  d="M24.2847 0.870117L19.0863 22.72L0.569443 28.8541L19.0863 34.9883L24.2847 56.8382L29.4832 34.9883L48 28.8541L29.4832 22.72L24.2847 0.870117Z"
                  fill={
                    data.use_custom_colors && data.star_color
                      ? data.star_color
                      : 'var(--color-primary-light)'
                  }
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
});
