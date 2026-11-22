import type { ReactNode } from 'react';

export interface MarqueeProps {
  children: ReactNode;
  speed?: number; // seconds for full cycle
  className?: string;
  addMask?: boolean;
  reverse?: boolean;
}

/**
 * Marquee renders an accessible infinite horizontal scrolling ticker.
 * Pauses on hover and respects `prefers-reduced-motion`.
 */
export function Marquee({
  children,
  speed = 25,
  className = '',
  addMask = false,
  reverse = false,
}: MarqueeProps) {
  const maskStyle = addMask
    ? {
        maskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }
    : undefined;

  const animationDirection = reverse ? 'reverse' : 'normal';

  return (
    <div
      className={`relative overflow-hidden w-full group ${className}`.trim()}
      style={maskStyle}
    >
      <div
        className="flex min-w-full shrink-0 items-center justify-around gap-6 motion-safe:animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
          animationDirection,
        }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        className="flex min-w-full shrink-0 items-center justify-around gap-6 motion-safe:animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: `${speed}s`,
          animationDirection,
        }}
      >
        {children}
      </div>
    </div>
  );
}
