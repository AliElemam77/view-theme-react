import { memo, useEffect, useRef } from 'react';
import { SallaCountDown } from '@salla.sa/twilight-components-react/count-down';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue, linkUrl, optionValue } from '../../lib/fieldValue';
import { cx, separatorProps, text, twigDefaultTrue, twigPosition } from './ViewBlockUtils';

export interface VCountdownBannerData {
  banner_height?: number;
  background_type?: unknown;
  background_image_url?: string;
  background_fixed?: boolean;
  background_video_url?: string;
  use_custom_colorsbg?: boolean;
  background_color?: string;
  glow_color?: string;
  text_color?: string;
  button_bg_color?: string;
  main_title?: string;
  sub_title?: string;
  sub_title_mini?: string;
  has_jocer_image?: boolean;
  has_counter?: boolean;
  end_time_offer?: string;
  btn_fqa?: string;
  btn_url?: unknown;
  btn_style?: unknown;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

/**
 * Port of `V_countdown_banner.twig`. Twig reads `use_custom_colorsbg|default(true)`,
 * and `default` also replaces `false`, so the theme colours always win.
 */
export const VCountdownBanner = memo(function VCountdownBanner({
  data = {},
}: {
  data?: VCountdownBannerData;
}) {
  const { reveal, spacing } = useViewSettings();
  const videoRef = useRef<HTMLVideoElement>(null);

  const position = twigPosition(data);
  const custom = twigDefaultTrue(data.use_custom_colorsbg);
  const bgType = optionValue(data.background_type);
  const bgImage = text(data.background_image_url);
  const bgVideo = text(data.background_video_url);
  const hasBgImage = bgImage !== '' && bgType === 'img';
  const height = text(data.banner_height);
  const textColor = text(data.text_color);
  const hasCounter = booleanValue(data.has_counter);
  const subMini = text(data.sub_title_mini);

  // React does not emit `muted` in SSR; autoplay needs it.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, [bgVideo, bgType]);

  // Twig: `'color:' ~ c.text_color ~ ' !important;'` (empty colour = invalid declaration).
  const customTextStyle = custom && textColor ? { color: textColor } : undefined;

  return (
    <section
      className={cx('s-block V__countdown_banner', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_countdown_banner-${position}`}
      id={`V_countdown_banner-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <div className=" relative mx-auto overflow-hidden" style={{ height: height ? `${height}px` : undefined }}>
          <div
            className={cx(
              'w-full h-full absolute inset-0',
              hasBgImage && 'bg-center bg-no-repeat lazy',
              hasBgImage && (booleanValue(data.background_fixed) ? 'bg-fixed bg-cover' : 'bg-cover')
            )}
            data-bg={hasBgImage ? bgImage : undefined}
            style={
              hasBgImage
                ? { backgroundImage: `url(${bgImage})` }
                : { backgroundColor: custom ? 'var(--color-primary-light)' : text(data.background_color) }
            }
          >
            {bgVideo !== '' && bgType === 'vid' && (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                aria-label={text(data.main_title)}
                className="w-full h-full object-cover"
              >
                <source src={bgVideo} />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          {bgType === 'colo' && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 flex-center abstract-background opacity-50 pointer-events-none"
              // `--color-primary-revers` (sic) as in Twig.
              style={{ color: custom ? 'var(--color-primary-revers)' : text(data.glow_color) }}
            >
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full border-2 border-current rinddg-1" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full border-2 border-current rinddg-2 opacity-80" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full border-2 border-current rinddg-3 opacity-85" />
            </div>
          )}
          <div className="flex-center flex-col z-2 h-full ">
            {!hasCounter && subMini !== '' && (
              <p
                className="text-sm"
                style={{ color: custom ? textColor || undefined : 'var(--color-primary-revers)' }}
              >
                {subMini}
              </p>
            )}
            <BlockTitle
              title={text(data.main_title)}
              sub={text(data.sub_title)}
              jocer={booleanValue(data.has_jocer_image)}
              style={customTextStyle}
              className="z-2"
              level2Class="justify-center"
              subStyle={customTextStyle}
            />
            {hasCounter && (
              <SallaCountDown className="w-full" size="md" boxed labeled date={text(data.end_time_offer)} />
            )}
            <div className={cx('flex-center', reveal)}>
              <ActionBtn
                text={text(data.btn_fqa)}
                href={linkUrl(data.btn_url)}
                dataStyle={optionValue(data.btn_style)}
                color={custom ? 'var(--color-primary-dark)' : text(data.text_color)}
                backgroundColor={custom ? 'var(--color-primary-light)' : text(data.button_bg_color)}
                icon
              />
            </div>
          </div>
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
