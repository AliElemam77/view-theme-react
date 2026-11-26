import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { BlogListPage } from '../../../app/components/blog/BlogListPage';
import { BlogSinglePage } from '../../../app/components/blog/BlogSinglePage';
import { BlogCard, articleDate } from '../../../app/components/blog/BlogCard';

const state = vi.hoisted(() => ({
  allowLikes: true,
  theme: {} as Record<string, unknown>,
  body: [] as string[],
  listCalls: [] as unknown[],
  itemsListProps: null as null | Record<string, unknown>,
}));

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Breadcrumb: ({ className }: { className?: string }) => <nav className={`crumb ${className ?? ''}`} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/providers', () => ({
  useTwilight: () => ({ theme: { settings: state.theme }, store: {} }),
  useLocation: () => ({ pathname: '/ar/blog', searchStr: '' }),
}));
vi.mock('@salla.sa/twilight-theme-engine/i18n', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  HookSlot: ({ name }: { name: string }) => <i data-hook={name} />,
  useDate: () => ({ format: (d: unknown) => `D(${String(d)})` }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ isRTL: true, settings: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: { blog: { allow_likes_and_comments: state.allowLikes } } }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useDocumentClass', () => ({
  useDocumentClass: ({ body }: { body?: { class?: string | string[] } }) => {
    const c = body?.class;
    state.body = Array.isArray(c) ? c : c ? [c] : [];
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useBlogLike', () => ({
  useBlogLike: (_id: number, count: number) => ({ active: true, count, toggle: () => {}, loading: false }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useComments', () => ({
  useComments: () => ({ commentsKey: 0, refresh: () => {} }),
}));
vi.mock('@salla.sa/twilight-components-react/comments', () => ({
  SallaComments: ({ itemId, type }: any) => <div className="comments" data-item-id={itemId} data-type={type} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/api/blog', () => ({
  blog: {
    articles: {
      list: async (params: unknown) => {
        state.listCalls.push(params);
        return { data: [], cursor: { next: null, current: 2 } };
      },
    },
  },
}));
vi.mock('@salla.sa/twilight-components-react', () => ({
  ItemsList: (props: any) => {
    state.itemsListProps = props;
    return <div className={props.itemsClassName}>{props.children(props.items)}</div>;
  },
}));

const article = (id: number, extra: Record<string, unknown> = {}) => ({
  id: String(id),
  name: `Post ${id}`,
  description: `<p>Body ${id}</p>`,
  url: `/blog/post-${id}/a-${id}`,
  image: `https://cdn/img-${id}.jpg`,
  author: { name: 'Ali', url: '/blog/author/1' },
  created_at: '2024-03-05 10:00:00',
  stats: { likes: 3, comments: 0 },
  ...extra,
});

const categories = [
  { id: '1', name: 'News', url: '/blog/news/c-1', is_current: true },
  { id: '2', name: 'Tips', url: '/blog/tips/c-2' },
];

const page = { slug: 'blog.index', title: 'المدونة' };

beforeEach(() => {
  state.allowLikes = true;
  state.theme = {};
  state.listCalls = [];
  state.itemsListProps = null;
});

describe('BlogCard (skeleton.twig)', () => {
  it('renders the Twig card: date badge, likes row, clamped title and raw excerpt, read-more button', () => {
    const { container } = render(<BlogCard article={article(1) as never} />);
    const card = container.querySelector('[data-testid="store-blog-article-card"]')!;
    expect(card.className).toContain('bg-primary-reverse');
    expect(card.className).toContain('rounded-cotm');
    expect(card.className).toContain('p-4 sm:p-3');
    expect(card.className).toContain('reveal');

    const badge = card.querySelector('.absolute.top-6.right-6')!;
    expect(badge.textContent).toBe('05Mar');
    expect(card.querySelector('.post-entry__icons')?.textContent).toContain('3 blocks.header.like');
    expect(card.querySelector('h3')?.className).toContain('line-clamp-1');
    expect(card.querySelector('article')?.innerHTML).toBe('<p>Body 1</p>');
    expect(card.querySelector('.fancy')?.getAttribute('data-style')).toBe('outline');
  });

  it('hides the author/likes row when the store turns likes and comments off', () => {
    state.allowLikes = false;
    const { container } = render(<BlogCard article={article(1) as never} />);
    expect(container.querySelector('.post-entry__icons')).toBeNull();
  });

  it('drops `reveal` when has_animation is off', () => {
    state.theme = { has_animation: false };
    const { container } = render(<BlogCard article={article(1) as never} />);
    expect(container.firstElementChild?.className).not.toContain('reveal');
  });

  it('reads written-out Arabic dates', () => {
    expect(articleDate('٧ ديسمبر ٢٠٢٤')).toEqual({ day: '07', month: 'Dec' });
  });
});

describe('BlogListPage (pages/blog/index.twig)', () => {
  it('lays out the sidebar of filled category buttons and the 1/2/3 column grid, with no visible heading', () => {
    const { container } = render(
      <BlogListPage page={page} articles={[article(1), article(2)] as never} categories={categories as never} />
    );
    const sidebar = container.querySelector('[data-testid="store-blog-categories"]')!;
    expect(sidebar.className).toContain('lg:w-1/5');
    const buttons = sidebar.querySelectorAll('.fancy');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].getAttribute('data-style')).toBe('filled');
    expect(buttons[0].className).toContain('mt-2');
    expect(sidebar.querySelectorAll('li')[0].className).toBe('text-primary');

    expect(container.querySelector('.flex.gap-3')).toBeTruthy();
    const grid = container.querySelector('.grid')!;
    expect(grid.className).toBe('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6');
    expect(grid.querySelectorAll('[data-testid="store-blog-article-card"]')).toHaveLength(2);

    expect(container.querySelector('h1')?.className).toBe('sr-only');
    expect(container.querySelector('salla-slider')).toBeNull();
    expect(state.itemsListProps?.mode).toBe('static');
  });

  it('pages through the filtered articles with an infinite list when there is a next cursor', async () => {
    render(
      <BlogListPage
        page={{ slug: 'blog.index.category', id: '7', title: 'News' }}
        articles={[article(1)] as never}
        categories={categories as never}
        cursor={{ next: 'https://api/blog/articles?cursor=abc%3D&category=7', current: 1 }}
        filter={{ category: '7' }}
        hook="blog:category"
      />
    );
    expect(state.itemsListProps?.mode).toBe('infinite');
    await (state.itemsListProps?.loader as () => Promise<unknown>)();
    expect(state.listCalls).toEqual([{ category: '7', cursor: 'abc=' }]);
  });

  it("shows Twig's placeholder when there are no articles", () => {
    const { container } = render(<BlogListPage page={page} articles={[]} categories={categories as never} />);
    expect(container.querySelector('.no-content-placeholder .sicon-inbox')).toBeTruthy();
    expect(container.querySelector('.grid')).toBeNull();
  });

  it('shows nothing when there are no articles but there are slides, as Twig does', () => {
    const { container } = render(<BlogListPage page={page} articles={[]} slides={[article(9)] as never} />);
    expect(container.querySelector('.no-content-placeholder')).toBeNull();
  });

  it('opens the mobile categories sheet by toggling `dropdown--is-opened` on <body>, and closes it on any other click', () => {
    const { container } = render(<BlogListPage page={page} articles={[]} categories={categories as never} />);
    const trigger = container.querySelector('.dropdown__trigger') as HTMLButtonElement;
    const links = container.querySelectorAll('.dropdown__menu a');
    expect(links).toHaveLength(2);
    expect(links[0].className).toContain('is-active');

    expect(state.body).toEqual([]);
    act(() => void fireEvent.click(trigger));
    expect(state.body).toEqual(['dropdown--is-opened']);
    act(() => void fireEvent.click(container.querySelector('.dropdown__close')!));
    expect(state.body).toEqual([]);

    act(() => void fireEvent.click(trigger));
    act(() => void fireEvent.click(trigger));
    expect(state.body).toEqual([]);
  });
});

describe('BlogSinglePage (pages/blog/single.twig)', () => {
  const single = {
    page: { slug: 'blog.single', id: '5', title: 'Post 5' },
    article: {
      ...article(5, { tags: [{ id: 1, name: 'tag', url: '/blog/tag/tag-1' }] }),
      stats: { likes: 4, comments: 2 },
    },
    related: [article(6), article(7, { image: '' })],
  };

  it("uses Twig's text-mediumgray, the center-between breadcrumb and the p-5 related cards", () => {
    const { container } = render(<BlogSinglePage {...(single as never)} />);
    expect(container.querySelector('nav.crumb')?.className).toContain('breadcrumbs w-full py-5 center-between');
    expect(container.querySelector('.mb-10.text-mediumgray.inline-flex')).toBeTruthy();
    expect(container.querySelector('.text-gray-500')).toBeNull();

    const like = container.querySelector('#blog-like')!;
    expect(like.className).toContain('liked');
    expect(like.textContent).toBe('4');

    expect(container.querySelector('article')?.innerHTML).toBe('<p>Body 5</p>');
    expect(container.querySelector('.sicon-tag')).toBeTruthy();
    expect(container.querySelector('.comments')?.getAttribute('data-type')).toBe('blog');

    const cards = container.querySelectorAll('aside .mt-5.flex.items-center.bg-white.p-5.rounded-md');
    expect(cards).toHaveLength(2);
    expect(cards[1].querySelector('img')?.className).toContain('w-10 object-contain opacity-60');
  });

  it('hides the like row and comments when the store turns them off', () => {
    state.allowLikes = false;
    const { container } = render(<BlogSinglePage {...(single as never)} />);
    expect(container.querySelector('#blog-like')).toBeNull();
    expect(container.querySelector('.comments')).toBeNull();
  });
});
