import type { SVGProps } from 'react';

/**
 * Line icons used across the theme chrome. Each is a plain function component
 * that spreads `props` onto the `<svg>`, so callers can pass `className`,
 * `width`/`height`, `aria-*`, `slot`, etc. Colour follows `currentColor`.
 *
 * Style: 24×24 viewBox, 1.5 stroke, round caps/joins, no fill.
 */

const base: SVGProps<SVGSVGElement> = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  width: 24,
  height: 24,
  fill: 'none',
  color: 'currentColor',
};

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export const CheckCircleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...props}>
    <path
      d="M22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12Z"
      {...stroke}
    />
    <path d="M8 12.5L10.5 15L16 9" {...stroke} />
  </svg>
);
