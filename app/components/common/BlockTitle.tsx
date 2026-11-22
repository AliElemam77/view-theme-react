import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';

export interface BlockTitleProps {
  title?: string;
  sub?: string;
  more?: boolean;
  moreAlt?: string;
  moreUrl?: string;
  onMoreClick?: () => void;
  titleStyle?: CSSProperties;
  subStyle?: CSSProperties;
  className?: string;
  levelClass?: string;
  level2Class?: string;
  center?: boolean;
  jocer?: boolean;
  fqa?: boolean;
}

/**
 * BlockTitle renders the standard View block header (h2 title, subtitle, optional jocer icon, and optional more/action link).
 */
export function BlockTitle({
  title,
  sub,
  more,
  moreAlt,
  moreUrl,
  onMoreClick,
  titleStyle,
  subStyle,
  className = '',
  levelClass = '',
  level2Class = '',
  center = false,
  jocer = false,
  fqa = false,
}: BlockTitleProps) {
  if (!title && !sub) return null;

  const showMore = Boolean(more ?? Boolean(moreAlt));
  const alignClasses = center
    ? 'text-center justify-center items-center'
    : 'text-start items-center justify-between';

  return (
    <div
      className={`mx-auto flex flex-col xs:flex-row gap-4 mb-5 md:mb-6 ${alignClasses} ${className}`.trim()}
    >
      <div className={`${center ? 'text-center' : 'text-center md:text-start'} ${levelClass}`.trim()}>
        <div
          className={`flex items-baseline ${
            showMore ? 'md:justify-normal justify-center' : center ? 'justify-center' : 'justify-start'
          } gap-2 ${level2Class}`.trim()}
        >
          {jocer && (
            <img
              src="https://cdn.salla.sa/form-builder/BtFck49qPdG3Qujymr5Y6LHJ6CqPq98hYaVy7BdX.webp"
              alt="jocer-icon"
              width={24}
              height={24}
              className="w-6 h-6 object-contain aspect-square dark:invert carbon:invert"
              loading="lazy"
            />
          )}
          {title && (
            <h2
              className="text-lg md:text-2xl font-bold text-primary-d"
              style={titleStyle}
            >
              {title}
            </h2>
          )}
        </div>
        {sub && (
          <p
            className="md:text-base text-sm text-primary mt-1 opacity-80"
            style={subStyle}
          >
            {sub}
          </p>
        )}
      </div>

      {showMore && moreAlt && (
        fqa || onMoreClick ? (
          <button
            type="button"
            onClick={onMoreClick}
            className="text-sm text-primary hover:underline transition-all duration-200 self-center xs:self-auto cursor-pointer"
          >
            {moreAlt}
          </button>
        ) : moreUrl ? (
          <Link
            to={moreUrl}
            className="text-sm text-primary hover:underline transition-all duration-200 self-center xs:self-auto"
          >
            {moreAlt}
          </Link>
        ) : null
      )}
    </div>
  );
}
