import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export interface BlockTitleProps {
  title?: string;
  sub?: string;
  moreAlt?: string;
  moreUrl?: string;
  onMoreClick?: () => void;
  titleStyle?: CSSProperties;
  subStyle?: CSSProperties;
  className?: string;
  center?: boolean;
}

/**
 * BlockTitle renders the standard View block header (h2 title, subtitle, and optional more/action link).
 */
export function BlockTitle({
  title,
  sub,
  moreAlt,
  moreUrl,
  onMoreClick,
  titleStyle,
  subStyle,
  className = '',
  center = false,
}: BlockTitleProps) {
  if (!title && !sub) return null;

  const alignClasses = center
    ? 'text-center justify-center items-center'
    : 'text-start items-start justify-between';

  return (
    <div
      className={`mx-auto flex flex-col xs:flex-row gap-4 mb-5 md:mb-6 ${alignClasses} ${className}`.trim()}
    >
      <div className={center ? 'text-center' : 'text-start'}>
        {title && (
          <h2
            className="text-lg md:text-2xl font-bold text-primary-d"
            style={titleStyle}
          >
            {title}
          </h2>
        )}
        {sub && (
          <p
            className="text-sm md:text-base text-primary opacity-80 mt-1"
            style={subStyle}
          >
            {sub}
          </p>
        )}
      </div>

      {moreAlt && moreUrl && (
        <Link
          to={moreUrl}
          className="text-sm text-primary hover:underline transition-all duration-200 self-center xs:self-auto"
        >
          {moreAlt}
        </Link>
      )}

      {moreAlt && !moreUrl && onMoreClick && (
        <button
          type="button"
          onClick={onMoreClick}
          className="text-sm text-primary hover:underline transition-all duration-200 self-center xs:self-auto"
        >
          {moreAlt}
        </button>
      )}
    </div>
  );
}
