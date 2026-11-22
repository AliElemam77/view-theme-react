export interface SectionSeparatorProps {
  saprator?: 'none' | 'solid' | 'star' | string;
  merge_with_adjacent?: boolean;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number | string;
}

export function SectionSeparator({
  saprator,
  merge_with_adjacent = false,
  use_custom_colors = false,
  line_color,
  star_color,
  star_position_x = 50,
}: SectionSeparatorProps) {
  if (saprator !== 'solid' && saprator !== 'star') return null;

  const bgLine = use_custom_colors && line_color ? line_color : 'var(--color-primary-light)';
  const starFill = use_custom_colors && star_color ? star_color : 'var(--color-primary-light)';
  const posX =
    typeof star_position_x === 'number' || !isNaN(Number(star_position_x))
      ? `${star_position_x}%`
      : star_position_x || '50%';

  return (
    <div
      className={`relative w-full py-6 ${merge_with_adjacent ? '-my-6' : 'mt-3'} ${
        saprator === 'solid' ? 'container' : ''
      }`}
    >
      <div
        className="h-px w-full line-innercomponent"
        style={{ backgroundColor: bgLine }}
      />
      {saprator === 'star' && (
        <div
          className="absolute top-1/2 -translate-y-1/2 z-10"
          style={{ left: posX, transform: 'translateY(-50%)' }}
        >
          <svg
            width="48"
            height="57"
            viewBox="0 0 48 57"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.2847 0.870117L19.0863 22.72L0.569443 28.8541L19.0863 34.9883L24.2847 56.8382L29.4832 34.9883L48 28.8541L29.4832 22.72L24.2847 0.870117Z"
              fill={starFill}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
