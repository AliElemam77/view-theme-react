import type { CSSProperties } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, optionValue } from '../../lib/fieldValue';

export interface BlockTitleProps {
  title?: string;
  sub?: string;
  /** Twig `more`: shows the "more" link/button (its text is `moreAlt`). */
  more?: boolean;
  moreAlt?: string;
  moreUrl?: string;
  onMoreClick?: () => void;
  titleStyle?: CSSProperties;
  subStyle?: CSSProperties;
  /** Twig `class` / `style` on the outer row. */
  className?: string;
  style?: CSSProperties;
  /** Twig `classone_level` / `classone_level2`. */
  levelClass?: string;
  level2Class?: string;
  /** @deprecated Not in Twig's `titles.twig`; ignored. Pass classes instead. */
  center?: boolean;
  jocer?: boolean;
  /** Twig `fqa`: the "more" control is a button (`#see-all-questions`), not a link. */
  fqa?: boolean;
}

const JOCER_DEFAULT = 'https://cdn.salla.sa/form-builder/BtFck49qPdG3Qujymr5Y6LHJ6CqPq98hYaVy7BdX.webp';

/** Port of `components/custom/titles.twig`, markup and classes unchanged. */
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
  style,
  levelClass = '',
  level2Class = '',
  jocer = false,
  fqa = false,
}: BlockTitleProps) {
  const { settings, reveal } = useViewSettings();
  if (!title && !sub) return null;

  const jocerSrc = optionValue(settings.jocer_image) || JOCER_DEFAULT;
  const invertJocer = booleanValue(settings.invert_image_dark_jocer, true);
  const cls = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

  return (
    <div
      className={cls(
        'mx-auto flex flex-col xs:flex-row justify-between items-center gap-4 md:mb-6 mb-5',
        className
      )}
      style={style}
    >
      <div className={cls('text-center md:text-right', levelClass)}>
        <div
          className={cls(
            'flex items-baseline',
            more && 'md:justify-normal justify-center',
            'gap-2',
            level2Class,
            reveal
          )}
        >
          {jocer && (
            <img
              src={jocerSrc}
              alt="jocer-icon"
              width={24}
              height={24}
              className={cls(
                'w-6 h-6 object-contain aspect-square',
                invertJocer && 'dark:invert carbon:invert'
              )}
              loading="lazy"
              decoding="async"
            />
          )}
          {title && (
            <h2 className="text-lg md:text-2xl font-bold text-primary-d" style={titleStyle}>
              {title}
            </h2>
          )}
        </div>
        {sub && (
          <p className={cls('md:text-base text-sm text-primary mt-1', reveal)} style={subStyle}>
            {sub}
          </p>
        )}
      </div>
      {more &&
        (fqa ? (
          <button
            type="button"
            id="see-all-questions"
            onClick={onMoreClick}
            className={cls('text-sm text-primary hover:underline duretion-200', reveal)}
          >
            {moreAlt}
          </button>
        ) : (
          <Link
            to={moreUrl || '#'}
            className={cls('text-sm text-primary hover:underline duretion-200', reveal)}
          >
            {moreAlt}
          </Link>
        ))}
    </div>
  );
}
