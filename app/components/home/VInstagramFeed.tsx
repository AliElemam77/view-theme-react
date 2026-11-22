import { memo, useEffect } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VInstagramFeedData {
  has_container?: boolean;
  notmrb?: boolean;
  class_name?: string;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VInstagramFeed = memo(function VInstagramFeed({
  data,
}: {
  data?: VInstagramFeedData;
}) {
  if (!data) return null;

  const appClass = data.class_name || 'elfsight-app-d6b9ab42-3cc0-467e-9e9a-e68ed3251585';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existingScript = document.querySelector('script[src*="static.elfsight.com/platform/platform.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://static.elfsight.com/platform/platform.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <SectionWrapper
      id={`V_instagram_feed-${data.position ?? 0}`}
      ariaLabel="Section V_instagram_feed"
      className="V_instagram_feed"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <div className={appClass} data-elfsight-app-lazy="" />
      </div>

      <SectionSeparator
        saprator={optionValue(data.saprator)}
        merge_with_adjacent={Boolean(data.merge_with_adjacent)}
        use_custom_colors={Boolean(data.use_custom_colors)}
        line_color={data.line_color}
        star_color={data.star_color}
        star_position_x={data.star_position_x}
      />
    </SectionWrapper>
  );
});
