import type { CSSProperties, ReactNode } from 'react';

export interface SectionWrapperProps {
  id?: string;
  className?: string;
  style?: CSSProperties;
  hasContainer?: boolean;
  notmrb?: boolean;
  children: ReactNode;
  ariaLabel?: string;
}

/**
 * SectionWrapper handles repeating home block containerization and margin spacing:
 * - `hasContainer`: wraps content inside `.container` (defaults to true).
 * - `notmrb`: when false/unset, applies standard vertical spacing (`my-8 md:my-14`); when true, margins are 0.
 */
export function SectionWrapper({
  id,
  className = '',
  style,
  hasContainer = true,
  notmrb = false,
  children,
  ariaLabel,
}: SectionWrapperProps) {
  const spacingClass = notmrb ? 'my-0 py-0' : 'my-8 md:my-14';

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`s-block relative ${spacingClass} ${className}`.trim()}
      style={style}
    >
      {hasContainer ? <div className="container">{children}</div> : children}
    </section>
  );
}
