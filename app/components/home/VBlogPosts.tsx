import { memo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { SallaSlider } from '@salla.sa/twilight-components-react/slider';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { blog } from '@salla.sa/twilight-theme-engine/api/blog';
import { BlockTitle } from '../common/BlockTitle';
import { SectionSeparator } from '../common/SectionSeparator';
import { BlogCard, normalizeArticle, type BlogCardArticle } from '../blog/BlogCard';
import { useViewSettings } from '../../hooks/useViewSettings';
import { booleanValue } from '../../lib/fieldValue';
import { asArray, cx, separatorProps, text, twigPosition } from './ViewBlockUtils';

/** An article as Twig's `skeleton.twig` reads it, or as the blog API sends it. */
export type VBlogPostArticle = BlogCardArticle;

export interface VBlogPostsData {
  has_container?: boolean;
  notmrb?: boolean;
  main_title?: string;
  sub_title?: string;
  has_jocer_image?: boolean;
  show_more_articles?: boolean;
  articles?: unknown;
  saprator?: unknown;
  use_custom_colors?: boolean;
  line_color?: string;
  star_color?: string;
  star_position_x?: number;
  merge_with_adjacent?: boolean;
  position?: number;
  [key: string]: unknown;
}

const articleId = (item: unknown): string | null => {
  const raw = item && typeof item === 'object' ? ((item as BlogCardArticle).id ?? (item as BlogCardArticle).value) : item;
  return raw === undefined || raw === null || raw === '' ? null : String(raw);
};

/**
 * Port of `V_blog_posts.twig`: a `<salla-slider>` carousel (1.5 / 2.5 / 3 per view
 * at 0 / 767 / 880, 10px apart) of `components/custom/skeleton.twig` cards. The
 * block saves only which articles were picked, so each one is read from
 * `blog/articles/<id>` (what Twig gets resolved server side).
 */
export const VBlogPosts = memo(function VBlogPosts({ data = {} }: { data?: VBlogPostsData }) {
  const { t } = useTranslation();
  const { reveal, spacing } = useViewSettings();
  const store = useStore();
  const allowLikes = Boolean(store?.settings?.blog?.allow_likes_and_comments);
  const position = twigPosition(data);

  const picked = asArray(data.articles)
    .map((item) => ({ item, id: articleId(item) }))
    .filter((entry): entry is { item: unknown; id: string } => entry.id !== null);

  const results = useQueries({
    queries: picked.map(({ id }) => ({ ...blog.queries.article(id), retry: false })),
  });

  const articles = picked
    .map(({ item, id }, index) => ({ id, article: normalizeArticle(item, results[index]?.data) }))
    .filter(({ article }) => article.title || article.url);

  return (
    <section
      className={cx('s-block V_blog_posts', !booleanValue(data.notmrb) && spacing)}
      aria-label={`Section V_blog_posts-${position}`}
      id={`V_blog_posts-${position}`}
    >
      <div className={booleanValue(data.has_container) ? 'container' : ''}>
        <BlockTitle
          title={text(data.main_title)}
          sub={text(data.sub_title)}
          more={booleanValue(data.show_more_articles)}
          moreUrl="/blog"
          moreAlt={t('blocks.header.all_art')}
          jocer={booleanValue(data.has_jocer_image)}
        />
        <SallaSlider
          id={`thumbs-blog-${position}`}
          className="V__articals"
          autoHeight
          showControls={false}
          type="carousel"
          sliderConfig={{
            spaceBetween: 10,
            breakpoints: {
              0: { slidesPerView: 1.5 },
              767: { slidesPerView: 2.5 },
              880: { slidesPerView: 3 },
            },
          }}
        >
          <div slot="items">
            {articles.map(({ id, article }, index) => (
              <BlogCard key={`${id}:${index}`} article={article} allowLikes={allowLikes} reveal={reveal} />
            ))}
          </div>
        </SallaSlider>
      </div>
      <SectionSeparator {...separatorProps(data)} />
    </section>
  );
});
