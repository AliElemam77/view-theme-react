import { memo, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export interface VBannerLineData {
  main_image_first?: string;
  main_title?: string;
  main_titleamsll?: string;
  has_jocer_image?: boolean;
  btn_txt?: string;
  btn_url?: unknown;
  btn_sselector?: unknown;
  use_custom_colors?: boolean;
  background_color?: string;
  text_color?: string;
  primary_border_color?: string;
  secondary_border_color?: string;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const LINE_TRANSITION = 'transform 900ms cubic-bezier(.25,.1,.25,1)';

/**
 * Port of `V_banner_line.twig` + home.js `vbbpn`: the six `.line-anim` bars start at
 * scaleX(0) (origin left) and grow in, 150ms apart, once the block is half visible.
 */
export const VBannerLine = memo(function VBannerLine({ data = {} }: { data?: VBannerLineData }) {
  const { spacing } = useViewSettings();
  const sectionRef = useRef<HTMLElement>(null);
  const [linesIn, setLinesIn] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setLinesIn(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: [0.5] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const position = twigPosition(data);
  const custom = booleanValue(data.use_custom_colors);
  const primaryBorder = custom ? text(data.primary_border_color) : 'var(--color-bg)';
  const secondaryBorder = custom ? text(data.secondary_border_color) : 'var(--color-primary-dark)';

  // Twig concatenates the raw colour without `color:` when custom colours are on,
  // which is an invalid declaration: only `text-align` survives then.
  const textStyle: CSSProperties = custom
    ? { textAlign: 'center' }
    : { textAlign: 'center', color: 'var(--color-primary-dark)' };

  // DOM order of the `.line-anim` bars drives the 150ms stagger.
  const line = (index: number, backgroundColor: string): CSSProperties => ({
    backgroundColor,
    transformOrigin: 'left center',
    transform: linesIn ? 'scaleX(1)' : 'scaleX(0)',
    transition: LINE_TRANSITION,
    transitionDelay: linesIn ? `${index * 150}ms` : undefined,
    willChange: 'transform',
  });

  return (
    <section
      ref={sectionRef}
      className={cx('s-block relative V_banner_line', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_banner_line-${position}`}
      id={`V_banner_line-${position}`}
      style={{ background: custom ? text(data.background_color) : 'var(--color-primary)' }}
    >
      <div className="flex flex-col absolute top-10 left-0 max-w-1/4 w-full gap-5 pointer-events-none z-0">
        <span className="h-2 rounded-full line-anim" style={line(0, primaryBorder)} />
        <div className="center-between gap-4 w-4/5 self-end">
          <span className="w-1/4 h-2 rounded-full line-anim" style={line(1, primaryBorder)} />
          <span className="h-2 w-full rounded-full line-anim" style={line(2, secondaryBorder)} />
        </div>
      </div>

      <div className={cx(booleanValue(data.has_container) && 'container', 'relative z-10 block')}>
        <div className="flex items-center justify-between flex-col py-9">
          <img
            src={text(data.main_image_first) || undefined}
            alt=""
            className="max-h-40 md:max-h-64 text-primary-d md:mb-6 mb-5"
          />
          <BlockTitle
            title={text(data.main_title)}
            sub={text(data.main_titleamsll)}
            jocer={booleanValue(data.has_jocer_image)}
            className="!mx-0"
            level2Class="text-center"
            subStyle={textStyle}
            titleStyle={textStyle}
          />
          <ActionBtn
            text={text(data.btn_txt)}
            href={linkUrl(data.btn_url)}
            dataStyle={optionValue(data.btn_sselector)}
            color={custom ? text(data.background_color) : 'var(--color-primary)'}
            backgroundColor={custom ? text(data.text_color) : '#fff'}
            icon
            className="!w-fit"
          />
        </div>
      </div>

      <div className="flex flex-col absolute bottom-10 right-0 max-w-1/4 w-full gap-5 pointer-events-none z-0">
        <span className="h-2 rounded-full line-anim" style={line(3, primaryBorder)} />
        <div className="center-between gap-4 w-4/5">
          <span className="w-1/4 h-2 rounded-full line-anim" style={line(4, primaryBorder)} />
          <span className="h-2 w-full rounded-full line-anim" style={line(5, secondaryBorder)} />
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
