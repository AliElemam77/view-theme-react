import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useViewSettings } from '../../hooks/useViewSettings';

export interface ActionBtnProps {
  text: string;
  href?: string;
  /** Twig `data_style`: `filled` swaps the two colours. */
  dataStyle?: 'filled' | 'outline' | string;
  color?: string;
  backgroundColor?: string;
  icon?: boolean;
  /** Twig `spinner`: the centred loading spinner (V_offer_collection). */
  spinner?: boolean;
  /** Twig `inject`: an empty `<span id="inject"><b></b></span>` after the text, filled at runtime. */
  inject?: ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
  /** Twig `attr`: rendered as `data-pro-colid="[attr]"`. */
  attr?: string;
  children?: ReactNode;
}

const ARROW =
  'M9.864.429c.698.232.712.238.712.238v.001l-.002.003q0 .004-.003.01l-.012.037-.047.128a15.5 15.5 0 0 1-.886 1.936c-.619 1.134-1.587 2.555-2.933 3.452-.344.23-.697.435-1.047.62h19.365v1.5H5.646c.35.184.703.389 1.047.619 1.346.897 2.314 2.318 2.933 3.453a15.5 15.5 0 0 1 .886 1.935l.047.128.012.036.003.011.001.003.001.001-.712.238-.71.238-.003-.006-.008-.025-.039-.104a14.014 14.014 0 0 0-.795-1.736c-.576-1.058-1.402-2.227-2.448-2.924-1.113-.742-2.333-1.214-3.287-1.5a14 14 0 0 0-1.481-.359L1.01 8.35l-.019-.003-.003-.001.053-.742-.053-.743h.003l.019-.004.082-.012q.111-.02.323-.063c.281-.058.684-.153 1.158-.296.954-.286 2.174-.758 3.287-1.5C6.907 4.29 7.733 3.12 8.31 2.063A14 14 0 0 0 9.104.325l.039-.104.008-.025.002-.006z';

/** Port of `components/custom/btn.twig` (the `.fancy` button), markup and inline colours unchanged. */
export function ActionBtn({
  text,
  href,
  dataStyle,
  color = 'var(--color-primary)',
  backgroundColor = '#ffffff',
  icon = false,
  spinner = false,
  inject,
  id,
  className = '',
  style,
  onClick,
  attr,
  children,
}: ActionBtnProps) {
  const { reveal } = useViewSettings();
  const { isRTL } = useTheme();
  if (!text) return null;

  const filled = dataStyle === 'filled';
  const fg = filled ? color : backgroundColor; // border + text
  const key = filled ? backgroundColor : color; // keys + content

  const btnStyle: CSSProperties = {
    borderColor: fg,
    color: fg,
    backgroundColor: filled ? backgroundColor : color,
    ...style,
  };

  const inner = (
    <>
      <span className="top-key" style={{ color: key }} />
      {spinner && (
        <div
          id="spinner"
          className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-200"
        >
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
      <span id="content_btn" className="content" style={{ color: key }}>
        <span className="text" style={{ color: fg }}>
          {text}
          {inject !== undefined && <span id="inject">{inject === true ? <b /> : inject}</span>}
          {children}
        </span>
        {icon && (
          <span className={`${isRTL ? '' : 'flip-x '}icon`} style={{ color: fg }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="16" fill="none">
              <path fill="currentColor" d={ARROW} />
            </svg>
          </span>
        )}
      </span>
      <span className="bottom-key-1" style={{ color: key }} />
      <span className="bottom-key-2" style={{ color: key }} />
    </>
  );

  const cls = `${className} fancy border-2 bg-transparent ${reveal}`.replace(/\s+/g, ' ').trim();
  const common = {
    id,
    'data-style': dataStyle,
    'data-pro-colid': attr ? `[${attr}]` : undefined,
    className: cls,
    style: btnStyle,
    onClick,
  };

  if (!href && onClick) {
    return (
      <button type="button" {...common}>
        {inner}
      </button>
    );
  }
  return (
    <Link to={href || '#'} {...common}>
      {inner}
    </Link>
  );
}
