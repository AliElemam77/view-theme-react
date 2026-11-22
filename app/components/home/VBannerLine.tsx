import { memo } from 'react';
import type { CSSProperties } from 'react';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { linkUrl, optionValue } from '../../lib/fieldValue';

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
  priority?: boolean;
}

export const VBannerLine = memo(function VBannerLine({
  data,
}: {
  data?: VBannerLineData;
}) {
  if (!data) return null;

  const useCustomColors = Boolean(data.use_custom_colors);
  const bgColor = useCustomColors ? data.background_color : 'var(--color-primary)';
  const textColor = useCustomColors ? data.text_color : 'var(--color-primary-dark)';
  const primaryBorder = useCustomColors ? data.primary_border_color : 'var(--color-bg)';
  const secondaryBorder = useCustomColors ? data.secondary_border_color : 'var(--color-primary-dark)';

  const btnUrl = linkUrl(data.btn_url);
  const btnStyle = optionValue(data.btn_sselector) || 'filled';
  const saprator = optionValue(data.saprator);

  const sectionStyle: CSSProperties = {
    background: bgColor,
  };

  const lineStyle1: CSSProperties = { backgroundColor: primaryBorder };
  const lineStyle2: CSSProperties = { backgroundColor: secondaryBorder };

  return (
    <SectionWrapper
      id={`V_banner_line-${data.position ?? 0}`}
      ariaLabel="Section V_banner_line"
      className="V_banner_line overflow-hidden"
      style={sectionStyle}
      hasContainer={false}
      notmrb={data.notmrb}
    >
      {/* Decorative top start lines */}
      <div className="flex flex-col absolute top-10 start-0 max-w-1/4 w-full gap-5 pointer-events-none z-0">
        <span className="h-2 rounded-full" style={lineStyle1} />
        <div className="flex items-center justify-between gap-4 w-4/5 self-end">
          <span className="w-1/4 h-2 rounded-full" style={lineStyle1} />
          <span className="h-2 w-full rounded-full" style={lineStyle2} />
        </div>
      </div>

      <div className={`${data.has_container ? 'container' : ''} relative z-10 block`}>
        <div className="flex items-center justify-between flex-col py-9">
          {data.main_image_first && (
            <img
              src={data.main_image_first}
              alt=""
              className="max-h-40 md:max-h-64 object-contain text-primary-d mb-5 md:mb-6"
              loading={data.priority ? 'eager' : 'lazy'}
              fetchPriority={data.priority ? 'high' : 'auto'}
            />
          )}

          <BlockTitle
            title={data.main_title}
            sub={data.main_titleamsll}
            center
            className="!mb-4 text-center"
            titleStyle={{ color: textColor }}
            subStyle={{ color: textColor }}
          />

          {data.btn_txt && (
            <ActionBtn
              text={data.btn_txt}
              href={btnUrl}
              dataStyle={btnStyle}
              color={useCustomColors ? data.background_color : 'var(--color-primary)'}
              backgroundColor={useCustomColors ? data.text_color : '#ffffff'}
              icon
              className="!w-fit mt-2"
            />
          )}
        </div>
      </div>

      {/* Decorative bottom end lines */}
      <div className="flex flex-col absolute bottom-10 end-0 max-w-1/4 w-full gap-5 pointer-events-none z-0">
        <span className="h-2 rounded-full" style={lineStyle1} />
        <div className="flex items-center justify-between gap-4 w-4/5">
          <span className="w-1/4 h-2 rounded-full" style={lineStyle1} />
          <span className="h-2 w-full rounded-full" style={lineStyle2} />
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
