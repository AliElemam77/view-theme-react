import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export interface ActionBtnProps {
  text: string;
  href?: string;
  dataStyle?: 'filled' | 'outline' | string;
  color?: string;
  backgroundColor?: string;
  icon?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: MouseEvent) => void;
  attr?: string;
  children?: ReactNode;
}

/**
 * ActionBtn implements the View theme's `.fancy` button element with custom outline/filled modes.
 */
export function ActionBtn({
  text,
  href,
  dataStyle = 'filled',
  color = 'var(--color-primary)',
  backgroundColor = '#ffffff',
  icon = true,
  className = '',
  style,
  onClick,
  attr,
  children,
}: ActionBtnProps) {
  if (!text) return null;

  const isFilled = dataStyle === 'filled';
  const computedBorderColor = isFilled ? color : backgroundColor;
  const computedColor = isFilled ? color : backgroundColor;
  const computedBg = isFilled ? backgroundColor : color;

  const btnStyle: CSSProperties = {
    borderColor: computedBorderColor,
    color: computedColor,
    backgroundColor: computedBg,
    ...style,
  };

  const keyColor = isFilled ? backgroundColor : color;

  const innerContent = (
    <>
      <span className="top-key" style={{ color: keyColor }} />
      <span id="content_btn" className="content" style={{ color: keyColor }}>
        <span className="text" style={{ color: computedColor }}>
          {text}
          {children}
        </span>
        {icon && (
          <span className="icon rtl:rotate-0 ltr:rotate-180" style={{ color: computedColor }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="16" fill="none">
              <path
                fill="currentColor"
                d="M9.864.429c.698.232.712.238.712.238v.001l-.002.003q0 .004-.003.01l-.012.037-.047.128a15.5 15.5 0 0 1-.886 1.936c-.619 1.134-1.587 2.555-2.933 3.452-.344.23-.697.435-1.047.62h19.365v1.5H5.646c.35.184.703.389 1.047.619 1.346.897 2.314 2.318 2.933 3.453a15.5 15.5 0 0 1 .886 1.935l.047.128.012.036.003.011.001.003.001.001-.712.238-.71.238-.003-.006-.008-.025-.039-.104a14.014 14.014 0 0 0-.795-1.736c-.576-1.058-1.402-2.227-2.448-2.924-1.113-.742-2.333-1.214-3.287-1.5a14 14 0 0 0-1.481-.359L1.01 8.35l-.019-.003-.003-.001.053-.742-.053-.743h.003l.019-.004.082-.012q.111-.02.323-.063c.281-.058.684-.153 1.158-.296.954-.286 2.174-.758 3.287-1.5C6.907 4.29 7.733 3.12 8.31 2.063A14 14 0 0 0 9.104.325l.039-.104.008-.025.002-.006z"
              />
            </svg>
          </span>
        )}
      </span>
      <span className="bottom-key-1" style={{ color: keyColor }} />
      <span className="bottom-key-2" style={{ color: keyColor }} />
    </>
  );

  const baseClasses = `fancy border-2 bg-transparent ${className}`.trim();

  if (href) {
    return (
      <Link
        to={href}
        data-style={dataStyle}
        data-pro-colid={attr ? `[${attr}]` : undefined}
        className={baseClasses}
        style={btnStyle}
        onClick={onClick}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type="button"
      data-style={dataStyle}
      data-pro-colid={attr ? `[${attr}]` : undefined}
      className={baseClasses}
      style={btnStyle}
      onClick={onClick}
    >
      {innerContent}
    </button>
  );
}
