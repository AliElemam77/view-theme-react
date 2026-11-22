import { memo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { CountdownTimer } from '../common/CountdownTimer';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  has_counter?: boolean;
  end_time_offer?: string;
  btn_fqa?: string;
  btn_url?: unknown;
  btn_style?: unknown;
  has_container?: boolean;
  notmrb?: boolean;
  saprator?: unknown;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  priority?: boolean;
}

export const VCountdownBanner = memo(function VCountdownBanner({
  data,
}: {
  data?: VCountdownBannerData;
}) {
  if (!data) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const bgType = optionValue(data.background_type) || 'colo';
  const useCustomColors = data.use_custom_colorsbg ?? true;
  const height = data.banner_height || 400;

  const btnUrl = linkUrl(data.btn_url);
  const btnStyle = optionValue(data.btn_style) || 'filled';
  const saprator = optionValue(data.saprator);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!mediaQuery.matches) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [data.background_video_url]);

  const bgStyle: CSSProperties = {
    height: `${height}px`,
  };

  const textColor = useCustomColors ? data.text_color : 'var(--color-primary-dark)';
  const btnColor = useCustomColors ? 'var(--color-primary-dark)' : data.text_color;
  const btnBg = useCustomColors ? 'var(--color-primary-light)' : data.button_bg_color;

  return (
    <SectionWrapper
      id={`V_countdown_banner-${data.position ?? 0}`}
      ariaLabel="Section V_countdown_banner"
      className="V__countdown_banner"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container ? 'container' : ''}>
        <div className="relative mx-auto overflow-hidden rounded-theme" style={bgStyle}>
          {/* Background image or color */}
          <div
            className={`w-full h-full absolute inset-0 ${
              bgType === 'img' && data.background_image_url
                ? `bg-center bg-no-repeat ${data.background_fixed ? 'bg-fixed bg-cover' : 'bg-cover'}`
                : ''
            }`}
            style={{
              backgroundImage:
                bgType === 'img' && data.background_image_url
                  ? `url(${data.background_image_url})`
                  : undefined,
              backgroundColor:
                bgType !== 'img'
                  ? useCustomColors
                    ? 'var(--color-primary-light)'
                    : data.background_color || '#f2f6ef'
                  : undefined,
            }}
          >
            {bgType === 'vid' && data.background_video_url && (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                aria-label={data.main_title || 'Video background'}
                className="w-full h-full object-cover"
              >
                <source src={data.background_video_url} />
              </video>
            )}
          </div>

          {/* Abstract background rings */}
          {bgType === 'colo' && (
            <div
              className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 flex items-center justify-center opacity-50 pointer-events-none"
              style={{
                color: useCustomColors ? 'var(--color-primary-reverse)' : data.glow_color || '#5cd5c4',
              }}
            >
              <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 rounded-full border-2 border-current animate-ping opacity-30" />
              <span className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 rounded-full border-2 border-current opacity-40" />
            </div>
          )}

          {/* Banner content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
            {!data.has_counter && data.sub_title_mini && (
              <p className="text-sm mb-2" style={{ color: textColor }}>
                {data.sub_title_mini}
              </p>
            )}

            <BlockTitle
              title={data.main_title}
              sub={data.sub_title}
              center
              titleStyle={{ color: textColor }}
              subStyle={{ color: textColor }}
              className="!mb-4"
            />

            {data.has_counter && data.end_time_offer && (
              <div className="mb-6 flex justify-center w-full">
                <CountdownTimer targetDate={data.end_time_offer} />
              </div>
            )}

            {data.btn_fqa && (
              <div className="flex justify-center mt-2">
                <ActionBtn
                  text={data.btn_fqa}
                  href={btnUrl}
                  dataStyle={btnStyle}
                  color={btnColor}
                  backgroundColor={btnBg}
                  icon
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Separator */}
      {(saprator === 'solid' || saprator === 'star') && (
        <div
          className={`relative w-full py-6 ${data.merge_with_adjacent ? '-my-6' : 'mt-3'} ${
            saprator === 'solid' ? 'container' : ''
          }`}
        >
          <div
            className="h-px w-full"
            style={{
              backgroundColor:
                useCustomColors && data.line_color ? data.line_color : 'var(--color-primary-light)',
            }}
          />
          {saprator === 'star' && (
            <div
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{
                left: `${data.star_position_x ?? 50}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="48" height="57" viewBox="0 0 48 57" fill="none">
                <path
                  d="M24.2847 0.870117L19.0863 22.72L0.569443 28.8541L19.0863 34.9883L24.2847 56.8382L29.4832 34.9883L48 28.8541L29.4832 22.72L24.2847 0.870117Z"
                  fill={
                    useCustomColors && data.star_color ? data.star_color : 'var(--color-primary-light)'
                  }
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </SectionWrapper>
  );
});
