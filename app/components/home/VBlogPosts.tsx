import { memo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionWrapper } from '../common/SectionWrapper';
import { BlockTitle } from '../common/BlockTitle';
import { ActionBtn } from '../common/ActionBtn';
import { SectionSeparator } from '../common/SectionSeparator';
import { optionValue } from '../../lib/fieldValue';

export interface VBlogPostArticle {
  id: number;
  title?: string;
  url?: string;
  body?: string;
  created_at?: string;
  image?: {
    url?: string;
    alt?: string;
  };
  author?: {
    name?: string;
    url?: string;
  };
  likes_count?: number;
  comments_count?: number;
}

export interface VBlogPostsData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_articles?: boolean;
  articles?: VBlogPostArticle[];
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
}

export const VBlogPosts = memo(function VBlogPosts({
  data,
}: {
  data?: VBlogPostsData;
}) {
  const { t } = useTranslation();
  if (!data) return null;

  const articles = Array.isArray(data.articles) ? data.articles : [];

  return (
    <SectionWrapper
      id={`V_blog_posts-${data.position ?? 0}`}
      ariaLabel="Section V_blog_posts"
      className="V_blog_posts"
      hasContainer={false}
      notmrb={data.notmrb}
    >
      <div className={data.has_container !== false ? 'container' : ''}>
        <BlockTitle
          title={data.main_title}
          sub={data.sub_title}
          jocer={data.has_jocer_image}
          more={Boolean(data.show_more_articles)}
          moreUrl="/blog"
          moreAlt={t('blocks.header.all_art', 'جميع المقالات')}
        />

        {articles.length > 0 && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 items-stretch flex-nowrap">
              {articles.map((art) => {
                let day = '';
                let month = '';
                if (art.created_at) {
                  const d = new Date(art.created_at);
                  if (!isNaN(d.getTime())) {
                    day = String(d.getDate());
                    month = d.toLocaleString('default', { month: 'short' });
                  }
                }

                return (
                  <div
                    key={art.id}
                    className="list-block relative post-entry h-full transition-shadow duration-200 bg-primary-reverse hover:shadow-default rounded-theme justify-around overflow-hidden flex flex-col p-4 w-[280px] md:w-[320px] shrink-0 border border-lightgray"
                  >
                    <a
                      href={art.url || '#'}
                      className="post-entry__image relative overflow-hidden hover:opacity-90 rounded-theme m-auto bg-border-color flex items-center justify-center aspect-[16/10] w-full"
                    >
                      <img
                        src={art.image?.url || '/images/placeholder.webp'}
                        alt={art.image?.alt || art.title || ''}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        width={600}
                        height={400}
                      />
                    </a>

                    {(day || month) && (
                      <div className="flex items-center flex-col gap-0.5 absolute top-6 end-6 bg-bgcolor rounded-theme text-xs py-1 px-2.5 shadow-sm">
                        <span className="font-bold text-darkgray leading-none">
                          {day}
                        </span>
                        <span className="font-medium text-mediumgray text-[10px] leading-none">
                          {month}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 pt-4 flex justify-between flex-col h-auto gap-2">
                      <h3 className="text-base font-semibold text-darkgray line-clamp-1">
                        <a href={art.url || '#'} className="hover:underline">
                          {art.title}
                        </a>
                      </h3>

                      {art.body && (
                        <p className="text-xs text-mediumgray opacity-70 font-light line-clamp-3">
                          {art.body.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      <div className="mt-3">
                        <ActionBtn
                          text={t('pages.products.read_more', 'اقرأ المزيد')}
                          href={art.url}
                          dataStyle="outline"
                          color="var(--color-primary-reverse)"
                          backgroundColor="var(--color-primary)"
                          icon
                          className="!w-full !justify-center text-xs !py-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
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
