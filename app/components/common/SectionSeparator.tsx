import { useViewSettings } from '../../hooks/useViewSettings';

export interface SectionSeparatorProps {
  saprator?: 'none' | 'solid' | 'star' | string;
  merge_with_adjacent?: boolean;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number | string;
}

/**
 * The separator every View block ends with (identical markup in each `V_*.twig`).
 * The line grows in when 60% visible (`useLineInView`, home.js `vllpp`); the star
 * takes the `has_animation` reveal. Twig gives the line a second `class` attribute
 * the browser ignores, so the line itself never gets `reveal`.
 */
export function SectionSeparator({
  saprator,
  merge_with_adjacent = false,
  use_custom_colors = false,
  line_color,
  star_color,
  star_position_x,
}: SectionSeparatorProps) {
  const { reveal } = useViewSettings();
  if (saprator !== 'solid' && saprator !== 'star') return null;

  const custom = (color?: string) =>
    use_custom_colors && color ? color : 'var(--color-primary-light)';
  const hasX = star_position_x !== undefined && star_position_x !== null && star_position_x !== '';

  return (
    <div
      className={`relative w-full py-6 ${merge_with_adjacent ? '-my-6' : 'mt-3'} ${
        saprator === 'solid' ? 'container' : ''
      }`}
    >
      <div className="h-px w-full line-innercomponent" style={{ backgroundColor: custom(line_color) }} />
      {saprator === 'star' && (
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: hasX ? `${star_position_x}%` : '50%', transform: 'translateY(-50%)' }}
        >
          <svg
            width="48"
            height="57"
            viewBox="0 0 48 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={reveal || undefined}
          >
            <path
              d="M24.2847 0.870117L19.0863 22.72L0.569443 28.8541L19.0863 34.9883L24.2847 56.8382L29.4832 34.9883L48 28.8541L29.4832 22.72L24.2847 0.870117Z"
              fill={custom(star_color)}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
