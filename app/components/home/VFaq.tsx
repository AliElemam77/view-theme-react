import { memo, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { collectionItems, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

export interface VFaqQuestionItem {
  question?: string;
  answer?: string;
}

export interface VFaqData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_faq?: boolean;
  varsion_2?: boolean;
  questions?: unknown;
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
 * Port of `V_faq.twig` + home.js `vfq`: the first question starts open, opening
 * one closes the others, and `#see-all-questions` expands the `hidden-faq`
 * questions (5th onwards) through their max-height transition, then hides.
 */
export const VFaq = memo(function VFaq({ data = {} }: { data?: VFaqData }) {
  const { t } = useTranslation();
  const { reveal, spacing } = useViewSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [expanded, setExpanded] = useState(false);

  const questions = collectionItems<VFaqQuestionItem>(data.questions, 'questions');
  const position = twigPosition(data);
  const isV2 = booleanValue(data.varsion_2);
  const showMore = booleanValue(data.show_more_faq);

  return (
    <section
      className={cx('s-block V__faq', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_faq-${position}`}
      id={`V_faq-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          fqa
          more={showMore && !expanded}
          moreAlt={t('blocks.header.all_ques')}
          onMoreClick={() => setExpanded(true)}
          jocer={booleanValue(data.has_jocer_image)}
        />
        <div className="w-full  mx-auto space-y-3">
          {questions.map((q, idx) => {
            const isOpen = openIndex === idx;
            const isHidden = idx >= 4 && showMore;
            const open = isOpen ? 'open' : '';
            return (
              // A settings list without ids.
              // react-doctor-disable-next-line react-doctor/no-array-index-as-key
              <div
                key={idx}
                className={cx('V__faq_item-wrapper', isHidden && 'hidden-faq', isHidden && expanded && 'expand')}
              >
                <div
                  className={cx(
                    reveal,
                    'V__faq_item bg-primaryops',
                    isV2 ? 'v2 rounded-r-md' : 'rounded-theme',
                    'border-lightgray border-r-[4px] border-r-transparent overflow-hidden transition-all duration-200',
                    open
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className={cx(
                      'V__faq_question md:text-lg text-xs font-bold w-full cursor-pointer flex justify-between items-center p-2 md:p-4 text-primary-d',
                      idx === 0 ? 'font-bold' : 'font-medium',
                      open
                    )}
                  >
                    <span>
                      {isV2 && `${String(idx + 1).padStart(2, '0')} `}
                      {text(q.question)}
                    </span>
                    {isV2 ? (
                      <svg
                        className={cx('V__faq_arrow md:w-4 w-2 md:h-4 h-2 transform transition-transform', open)}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <div className={cx('circle-plus', isOpen ? 'opened' : 'closed')}>
                        <div className="circle">
                          <div className="horizontal" />
                          <div className="vertical" />
                        </div>
                      </div>
                    )}
                  </button>
                  <div className={cx('V__faq_answer md:text-sm text-xxs text-mediumgray', open)}>
                    {text(q.answer)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
