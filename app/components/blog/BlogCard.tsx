import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import type { ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import { ActionBtn } from '../common/ActionBtn';
import { useViewSettings } from '../../hooks/useViewSettings';

/** An article as Twig's `skeleton.twig` reads it, or as the blog API sends it. */
export interface BlogCardArticle {
  id?: number | string;
  value?: number | string;
  title?: string;
  name?: string;
  url?: string;
  body?: string;
  description?: string;
  created_at?: unknown;
  image?: string | { url?: string; alt?: string } | null;
  author?: { name?: string; url?: string } | null;
  likes_count?: number;
  comments_count?: number;
  stats?: { likes?: number; comments?: number };
  [key: string]: unknown;
}

const PLACEHOLDER = '/images/placeholder.webp';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** Month names the API may write a date out with (Arabic and English), by month index. */
const MONTH_NAMES: string[][] = [
  ['يناير', 'january', 'jan'],
  ['فبراير', 'february', 'feb'],
  ['مارس', 'march', 'mar'],
  ['أبريل', 'ابريل', 'إبريل', 'april', 'apr'],
  ['مايو', 'may'],
  ['يونيو', 'june', 'jun'],
  ['يوليو', 'july', 'jul'],
  ['أغسطس', 'اغسطس', 'august', 'aug'],
  ['سبتمبر', 'september', 'sep', 'sept'],
  ['أكتوبر', 'اكتوبر', 'october', 'oct'],
  ['نوفمبر', 'november', 'nov'],
  ['ديسمبر', 'december', 'dec'],
];

const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
const str = (value: unknown) =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
const pad = (n: number) => String(n).padStart(2, '0');
const latinDigits = (s: string) =>
  s
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));

/**
 * Twig's `created_at|date('d')` and `|date('M')`: the zero-padded day and the
 * English short month. A written-out date ("31 ديسمبر 2024") is read as is; a
 * missing one is today, as Twig's `date` filter does.
 */
export function articleDate(value: unknown): { day: string; month: string } {
  const raw =
    value && typeof value === 'object' && 'date' in value ? (value as { date?: unknown }).date : value;
  if (typeof raw === 'string' && raw.trim()) {
    const s = latinDigits(raw.trim());
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (iso) return { day: pad(Number(iso[3])), month: MONTHS[Number(iso[2]) - 1] ?? '' };
    const written = s.match(/^(\d{1,2})\s+([^\s,]+)/);
    if (written) {
      const name = written[2].toLowerCase();
      const index = MONTH_NAMES.findIndex((names) => names.includes(name));
      if (index >= 0) return { day: pad(Number(written[1])), month: MONTHS[index] };
    }
    const parsed = new Date(s);
    if (!Number.isNaN(parsed.getTime()))
      return { day: pad(parsed.getUTCDate()), month: MONTHS[parsed.getUTCMonth()] };
  }
  let date = new Date();
  if (typeof raw === 'number') date = new Date(raw < 1e12 ? raw * 1000 : raw);
  else if (raw instanceof Date) date = raw;
  return { day: pad(date.getUTCDate()), month: MONTHS[date.getUTCMonth()] };
}

/** The fields `skeleton.twig` reads, from a saved pick merged with the fetched article. */
export function normalizeArticle(saved: unknown, fetched?: unknown) {
  const a = {
    ...(saved && typeof saved === 'object' ? (saved as BlogCardArticle) : {}),
    ...(fetched && typeof fetched === 'object' ? (fetched as BlogCardArticle) : {}),
  } as BlogCardArticle;
  const image = typeof a.image === 'string' ? { url: a.image } : (a.image ?? {});
  return {
    url: str(a.url),
    title: str(a.title) || str(a.name),
    body: str(a.body) || str(a.description),
    imageUrl: str(image.url),
    imageAlt: str((image as { alt?: unknown }).alt),
    authorName: str(a.author?.name),
    authorUrl: str(a.author?.url),
    likes: Number(a.likes_count ?? a.stats?.likes ?? 0) || 0,
    comments: Number(a.comments_count ?? a.stats?.comments ?? 0) || 0,
    created_at: a.created_at,
  };
}

export type NormalizedArticle = ReturnType<typeof normalizeArticle>;

/** Twig's `is_placeholder`: no image, or the store's placeholder one. */
const isPlaceholder = (url: string) => !url || /placeholder/i.test(url);

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="var(--medium-gray-color)"
        d="M6.194 14.837a11.41 11.41 0 0 1 11.613 0c.116.07.26.15.422.242.712.402 1.79 1.01 2.529 1.732.462.452.9 1.048.98 1.778.084.776-.254 1.503-.933 2.15-1.172 1.116-2.577 2.011-4.396 2.011H7.591c-1.818 0-3.224-.895-4.396-2.01-.678-.648-1.017-1.375-.932-2.151.08-.73.519-1.326.98-1.777.738-.723 1.816-1.33 2.529-1.733.162-.092.306-.173.422-.242m10.845 1.289a9.91 9.91 0 0 0-10.077 0q-.254.15-.545.313c-.712.405-1.545.877-2.125 1.445-.36.352-.513.643-.538.868-.02.178.026.472.477.901 1.035.987 2.088 1.597 3.36 1.597h8.818c1.273 0 2.326-.61 3.362-1.597.45-.429.495-.723.475-.901-.024-.225-.178-.516-.538-.868-.58-.568-1.412-1.04-2.125-1.445-.192-.109-.376-.213-.544-.313M12 1.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5m0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5"
      />
    </svg>
  );
}

function LikeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="var(--medium-gray-color)"
        fillRule="evenodd"
        d="M12.794 3.19c.73-.64 1.85-.57 2.5.16.05.06.11.14.21.29l.071.101c.114.164.18.257.23.349a4.54 4.54 0 0 1 .437 3.778l-.048.162-.27.86-.058.193c-.1.329-.19.625-.182.717.01.03.05.08.1.11.1.04.55.04.99.04h1.002c2.414.006 3.68.077 4.448 1.04.1.12.18.25.26.38.65 1.18.07 2.44-1.1 4.95l-.014.03c-.99 2.131-1.54 3.313-2.606 4.04-.1.07-.21.14-.32.2-1.13.65-2.38.65-4.87.65h-.832c-2.847-.001-4.308-.038-5.378-1.07a3 3 0 0 1-.37-.43 3.75 3.75 0 0 1-3 1.5c-1.52 0-2.75-1.23-2.75-2.75v-6c0-1.52 1.23-2.75 2.75-2.75.96 0 1.837.362 2.5.956l.06-.166c.306-.79.828-1.366 1.853-2.499l.037-.041 4.09-4.53.104-.112c.078-.084.12-.129.156-.158m-8.8 8.05c-.69 0-1.25.56-1.25 1.25v6c0 .69.56 1.25 1.25 1.25 1.24 0 2.25-1.01 2.25-2.25v-4c0-1.24-1.01-2.25-2.25-2.25m9.98-7.02-.01.02a.24.24 0 0 0-.208.102q-.026.03-.072.078l-4.12 4.56c-.93 1.03-1.39 1.54-1.6 2.08-.21.53-.21 1.22-.21 2.58v.97c0 2.73.03 3.86.66 4.48.617.598 1.792.646 4.047.65h1.433c2.016-.001 3.067-.021 3.81-.45.07-.04.15-.09.22-.14.723-.488 1.17-1.444 2.046-3.322l.064-.138.048-.104c.861-1.867 1.377-2.985 1.102-3.496a1 1 0 0 0-.11-.17c-.345-.436-1.468-.476-3.307-.48h-1.185c-.748-.002-1.184-.022-1.578-.27-.35-.22-.62-.57-.74-.96-.148-.495-.012-.942.233-1.748l.007-.022.27-.87c.026-.089.047-.158.066-.216.024-.079.043-.136.054-.194a3.05 3.05 0 0 0-.483-2.508l-.117-.172-.035-.054c-.038-.057-.06-.093-.085-.116a.27.27 0 0 0-.2-.09"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        fill="var(--medium-gray-color)"
        d="M14.057 1.75c1.837 0 3.293 0 4.432.153 1.173.158 2.121.49 2.87 1.239.748.748 1.08 1.696 1.238 2.869.153 1.139.153 2.595.153 4.432v.614c0 1.837 0 3.293-.153 4.432-.158 1.173-.49 2.121-1.239 2.87-.748.748-1.696 1.08-2.869 1.238-1.139.153-2.595.153-4.432.153h-.048c-.527.012-.917.052-1.287.136-.914.21-1.767.634-2.695 1.095q-.27.135-.548.272l-.053.025c-.736.36-1.361.665-1.864.828-.507.163-1.138.266-1.688-.134l-.006-.005c-.45-.335-.632-.82-.691-1.259a4 4 0 0 1 .028-1.082c-1.039-.208-1.91-.615-2.563-1.268-.749-.748-1.081-1.696-1.239-2.869-.153-1.139-.153-2.595-.153-4.432v-.614c0-1.837 0-3.293.153-4.432.158-1.173.49-2.121 1.239-2.87.748-.748 1.696-1.08 2.869-1.238C6.65 1.75 8.106 1.75 9.943 1.75zM10 3.25c-1.907 0-3.261.002-4.29.14-1.005.135-1.585.389-2.008.812s-.677 1.003-.812 2.009c-.139 1.028-.14 2.382-.14 4.289v.5c0 1.907.002 3.261.14 4.29.135 1.005.389 1.585.812 2.008.398.398.992.704 1.846.867l.034-.121c.082-.288.147-.515.184-.694a.75.75 0 1 1 1.468.3c-.049.24-.132.536-.213.822l-.046.16a19 19 0 0 0-.152.562q-.061.248-.106.487c-.063.345-.081.623-.054.826.02.154.06.216.085.242.038.003.139-.002.353-.071.388-.126.917-.382 1.72-.774l.498-.246c.926-.462 1.965-.98 3.068-1.234.505-.115 1.006-.16 1.596-.174H14c1.907 0 3.261-.002 4.29-.14 1.005-.135 1.585-.389 2.008-.812s.677-1.003.812-2.009c.139-1.028.14-2.382.14-4.289v-.5c0-1.907-.002-3.261-.14-4.29-.135-1.005-.389-1.585-.812-2.008s-1.003-.677-2.009-.812c-1.028-.139-2.382-.14-4.289-.14zm6 9.5a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5zm-4-5a.75.75 0 0 1 0 1.5H8a.75.75 0 0 1 0-1.5z"
      />
    </svg>
  );
}

export interface BlogCardProps {
  /** A blog API article, a saved block pick, or an already-normalized article. */
  article: BlogCardArticle | ArticleSummary | NormalizedArticle;
  /** `store.settings.blog.allow_likes_and_comments`; read from the store when omitted. */
  allowLikes?: boolean;
  /** The `reveal` class (`has_animation`); read from the theme settings when omitted. */
  reveal?: string;
}

const isNormalized = (a: BlogCardProps['article']): a is NormalizedArticle =>
  'imageUrl' in a && 'authorName' in a;

/** One `components/custom/skeleton.twig` card, markup and classes unchanged. */
export function BlogCard({ article: input, allowLikes, reveal }: BlogCardProps) {
  const { t } = useTranslation();
  const store = useStore();
  const view = useViewSettings();
  const article = isNormalized(input) ? input : normalizeArticle(input);
  const likesOn = allowLikes ?? Boolean(store?.settings?.blog?.allow_likes_and_comments);
  const { day, month } = articleDate(article.created_at);
  const placeholder = isPlaceholder(article.imageUrl);
  const url = article.url || '#';

  return (
    <div
      data-testid="store-blog-article-card"
      className={cx(
        'list-block relative post-entry  h-full transition-shadow duration-200 bg-primary-reverse hover:shadow-default rounded-cotm justify-around overflow-hidden flex flex-col p-4 sm:p-3',
        reveal ?? view.reveal
      )}
    >
      <Link
        to={url}
        className="post-entry__image relative overflow-hidden hover:opacity-90  rounded-cotm m-auto bg-border-color flex items-center justify-center"
      >
        <img
          className={cx(
            placeholder ? 'sm:h-full w-20 object-contain opacity-60' : 'h-full w-full object-cover',
            'lazy'
          )}
          src={article.imageUrl || PLACEHOLDER}
          alt={article.imageAlt || 'article-image'}
          width={600}
          height={400}
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
        />
      </Link>
      {/* Physical `right-6` in both directions, as in Twig. */}
      <div className=" flex items-center flex-col gap-1 absolute top-6 right-6 bg-bgcolor rounded-theme text-xs py-1 px-2">
        <span className="font-bold text-darkgray">{day}</span>
        <span className="font-medium text-mediumgray ">{month}</span>
      </div>
      <div className="flex-1 pt-4 flex justify-between flex-col h-auto gap-1.5">
        {likesOn && (
          <div className="post-entry__icons center-between text-mediumgray  text-sm">
            <Link
              to={article.authorUrl || '#'}
              className="flex items-center gap-1 flex-1"
              style={{ fontSize: '0.7em' }}
            >
              <UserIcon />
              <span className="line-clamp-1">{article.authorName}</span>
            </Link>
            {article.likes > 0 && (
              <div className="flex items-center gap-1 flex-1" style={{ fontSize: '0.8em' }}>
                <LikeIcon />
                <span className="line-clamp-1">
                  {article.likes} {t('blocks.header.like')}
                </span>
              </div>
            )}
            {article.comments > 0 && (
              <div className="flex items-center gap-1 flex-1" style={{ fontSize: '0.7em' }}>
                <CommentIcon />
                <span className="line-clamp-1">
                  {article.comments} {t('blocks.header.comment')}
                </span>
              </div>
            )}
          </div>
        )}
        <h3 className="text-base sm:text-base font-semibold text-darkgray line-clamp-1">
          <Link to={url} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <article
          className="text-base sm:text-sm text-mediumgray  opacity-60 font-light line-clamp-4 text-ellipsis"
          // Twig prints `article.body|raw`.
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
        <ActionBtn
          text={t('pages.products.read_more', 'اقرأ المزيد')}
          href={article.url}
          dataStyle="outline"
          color="var(--color-primary-reverse)"
          backgroundColor="var(--color-primary)"
          icon
        />
      </div>
    </div>
  );
}
