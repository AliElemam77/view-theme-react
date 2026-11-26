import { memo, useEffect, useRef } from 'react';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

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
  [key: string]: unknown;
}

const DEFAULT_APP = 'elfsight-app-d6b9ab42-3cc0-467e-9e9a-e68ed3251585';
const PLATFORM_SRC = 'https://static.elfsight.com/platform/platform.js';

/** The Elfsight parts the Twig script hides as they appear (branding, load more, toolbar). */
const HIDDEN = [
  'a[rel="noreferrer"]',
  '.eapps-instagram-feed-posts-grid-load-more-container.eapps-instagram-feed-posts-grid-load-more-enabled',
  '.eapps-widget-toolbar',
];

/**
 * Port of `V_instagram_feed.twig` + its inline script: the Elfsight app `<div>`
 * (class `class_name`, lazy) goes right before `#instaembd`, the platform script
 * is loaded, and a MutationObserver on the widget hides the branding link, the
 * load-more button and the widget toolbar whenever Elfsight renders them.
 */
export const VInstagramFeed = memo(function VInstagramFeed({ data = {} }: { data?: VInstagramFeedData }) {
  const { spacing } = useViewSettings();
  const appRef = useRef<HTMLDivElement>(null);
  const position = twigPosition(data);
  const className = text(data.class_name);
  const appClass = className || DEFAULT_APP;

  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    if (!document.querySelector(`script[src="${PLATFORM_SRC}"]`)) {
      const script = document.createElement('script');
      script.src = PLATFORM_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    // Third-party markup, outside React's tree: hide it the way the Twig script does.
    const observer = new MutationObserver(() => {
      HIDDEN.forEach((selector) => {
        const el = app.querySelector<HTMLElement>(selector);
        if (el) el.style.setProperty('display', 'none', 'important');
      });
    });
    observer.observe(app, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [appClass]);

  return (
    <section
      className={cx('s-block V_instagram_feed', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_instagram_feed-${position}`}
      id={`V_instagram_feed-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <div key={appClass} ref={appRef} className={appClass} data-elfsight-app-lazy="" />
        <div id="instaembd" data-class={className} />
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
