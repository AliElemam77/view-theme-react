import { memo, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

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
  questions?: VFaqQuestionItem[];
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VFaq = memo(function VFaq({
  data,
}: {
  data?: VFaqData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (!questions.length) return null;

  // Track which question is currently expanded (first one open by default)
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [showAll, setShowAll] = useState(false);

  const toggleQuestion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const visibleQuestions =
    data.show_more_faq && !showAll ? questions.slice(0, 4) : questions;

  const isV2 = Boolean(data.varsion_2);

  return (
    <SectionWrapper
      id={`V_faq-${data.position ?? 0}`}
      ariaLabel="Section V_faq"
      className="V__faq"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
          more={Boolean(data.show_more_faq && !showAll && questions.length > 4)}
          moreAlt={t('blocks.header.all_ques', 'عرض جميع الأسئلة')}
          onMoreClick={() => setShowAll(true)}
        />

        <div className="w-full mx-auto space-y-3">
          {visibleQuestions.map((q, idx) => {
            const isOpen = openIndex === idx;
            const numberFormatted = String(idx + 1).padStart(2, '0');

            return (
              <div key={idx} className="V__faq_item-wrapper">
                <div
                  className={`V__faq_item bg-primaryops ${
                    isV2 ? 'v2 rounded-s-md' : 'rounded-theme'
                  } border-lightgray border-s-[4px] ${
                    isOpen ? 'border-s-primary' : 'border-s-transparent'
                  } overflow-hidden transition-all duration-200`}
                >
                  <button
                    type="button"
                    onClick={() => toggleQuestion(idx)}
                    className={`V__faq_question md:text-lg text-sm w-full cursor-pointer flex justify-between items-center p-3 md:p-4 text-primary-d text-start ${
                      isOpen ? 'font-bold' : 'font-medium'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <span className="flex items-center gap-3">
                      {isV2 && (
                        <span className="text-primary font-bold text-sm">
                          {numberFormatted}
                        </span>
                      )}
                      <span>{q.question}</span>
                    </span>

                    {isV2 ? (
                      <svg
                        className={`V__faq_arrow md:w-5 w-4 md:h-5 h-4 transform transition-transform shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    ) : (
                      <div className={`circle-plus ${isOpen ? 'opened' : 'closed'}`}>
                        <div className="circle">
                          <div className="horizontal" />
                          <div
                            className={`vertical transition-transform ${
                              isOpen ? 'scale-y-0' : ''
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </button>

                  {isOpen && (
                    <div className="V__faq_answer md:text-sm text-xs text-mediumgray px-4 pb-4 pt-1 transition-all">
                      {q.answer}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {data.show_more_faq && !showAll && questions.length > 4 && (
          <div className="text-center mt-6">
            <button
              id="see-all-questions"
              type="button"
              onClick={() => setShowAll(true)}
              className="px-6 py-2 rounded-full border border-primary text-primary font-semibold hover:bg-primary hover:text-white transition-colors text-sm"
            >
              {t('blocks.header.all_ques', 'عرض جميع الأسئلة')}
            </button>
          </div>
        )}
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
