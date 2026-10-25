'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tabs, TabPanel } from 'react-aria-components';
import { MotionConfig } from 'motion/react';
import { Clock } from '@phosphor-icons/react';
import {
  AppLink,
  Button,
  ButtonLink,
  PageIntro,
  Arrow,
  EmptyState,
} from './ui';
import { AnimatedTabList } from './ui/animated-tabs';
import { HoverImageList } from './ui/hover-image-list';
import { Photo, PhotoCredit } from './artwork';
import { ShareLinks } from './share-links';
import { usePublicData } from '@/lib/data/hooks';
import { publishedNews } from '@/lib/data';
import { localised, type NewsPost } from '@/lib/data/types';
import { dateLabel, numberLabel } from '@/lib/dates';
import { newsPhoto } from '@/lib/photos';
import { cn } from '@/lib/utils';
export function NewsGrid({
  posts,
  className,
}: {
  posts: NewsPost[];
  className?: string;
}) {
  const t = useTranslations();
  const l = useLocale();
  return (
    <div className={cn('news-grid', className)}>
      {posts.map((post) => (
        <article key={post.id} className="news-card">
          <div className="news-card-art">
            <Photo
              src={post.image_url}
              fallback={newsPhoto(post.id)}
              decorative
            />
          </div>
          <div className="news-meta">
            <span>{t('news.' + post.category)}</span>
            <time dateTime={post.published_at || undefined}>
              {post.published_at
                ? dateLabel(post.published_at, l)
                : t('common.pending')}
            </time>
          </div>
          <h3>
            <AppLink
              href={'/' + l + '/news/' + post.slug}
              className="news-title"
            >
              {localised(post, 'title', l)}
            </AppLink>
          </h3>
          <AppLink href={'/' + l + '/news/' + post.slug}>
            {t('common.readMore')}
            <Arrow />
          </AppLink>
        </article>
      ))}
    </div>
  );
}
const NEWS_PAGE_SIZE = 9;
const newsCategories: NewsPost['category'][] = [
  'announcement',
  'programme',
  'community',
];
const excerpt = (post: NewsPost, l: string) =>
  localised(post, 'body', l).split('\n\n')[0];
/** Minutes at roughly 200 words a minute, never less than one. */
const readingMinutes = (post: NewsPost, l: string) =>
  Math.max(
    1,
    Math.ceil(localised(post, 'body', l).trim().split(/\s+/).length / 200),
  );

export function NewsIndex() {
  const t = useTranslations();
  const l = useLocale();
  const { news } = usePublicData();
  const [category, setCategory] = useState('all');
  const [visible, setVisible] = useState(NEWS_PAGE_SIZE);
  const posts = publishedNews(news);
  const n = (value: number) => numberLabel(value, l);
  const counts = Object.groupBy(posts, (p) => p.category);
  // Only story types that have stories get a tab.
  const tabs = [
    { id: 'all', label: t('news.all'), count: n(posts.length) },
    ...newsCategories
      .filter((c) => counts[c]?.length)
      .map((c) => ({
        id: c,
        label: t('news.' + c),
        count: n(counts[c]!.length),
      })),
  ];
  const selected = tabs.some((tab) => tab.id === category) ? category : 'all';
  const latest = posts[0]?.published_at;
  return (
    <MotionConfig reducedMotion="user">
      <div className="page-bottom container">
        <header className="news-masthead">
          <div>
            <p className="eyebrow">{t('news.eyebrow')}</p>
            <h1>{t('news.title')}</h1>
          </div>
          <div className="news-masthead-aside">
            <p className="intro-text">{t('news.intro')}</p>
            <p className="news-masthead-meta">
              <span>
                {t('news.storyCount', {
                  count: posts.length,
                  n: n(posts.length),
                })}
              </span>
              {latest && (
                <span>{t('news.updated', { date: dateLabel(latest, l) })}</span>
              )}
            </p>
          </div>
        </header>
        <Tabs
          selectedKey={selected}
          onSelectionChange={(key) => {
            setCategory(String(key));
            setVisible(NEWS_PAGE_SIZE);
          }}
        >
          <AnimatedTabList
            tabs={tabs}
            label={t('news.filterLabel')}
            className="news-tabs"
          />
          {tabs.map((tab) => (
            <TabPanel key={tab.id} id={tab.id} className="news-panel">
              <Stories
                posts={
                  tab.id === 'all'
                    ? posts
                    : posts.filter((p) => p.category === tab.id)
                }
                visible={visible}
                onShowMore={() => setVisible(visible + NEWS_PAGE_SIZE)}
              />
            </TabPanel>
          ))}
        </Tabs>
      </div>
      <section className="cta">
        <div className="cta-inner container">
          <div>
            <p className="eyebrow">{t('news.bridgeLabel')}</p>
            <h2>{t('news.bridgeTitle')}</h2>
          </div>
          <div>
            <p>{t('news.bridgeText')}</p>
            <ButtonLink href={'/' + l + '/events'} variant="light">
              {t('common.viewAll')}
              <Arrow />
            </ButtonLink>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

function Stories({
  posts,
  visible,
  onShowMore,
}: {
  posts: NewsPost[];
  visible: number;
  onShowMore: () => void;
}) {
  const t = useTranslations();
  const l = useLocale();
  const list = useRef<HTMLOListElement>(null);
  const firstNew = useRef<number | null>(null);
  // The button may disappear, so move focus to the first newly shown story.
  useEffect(() => {
    if (firstNew.current === null) return;
    list.current
      ?.querySelectorAll<HTMLElement>('.story-row-title')
      [firstNew.current - 1]?.focus();
    firstNew.current = null;
  }, [visible]);
  if (!posts.length)
    return (
      <EmptyState title={t('news.noneTitle')}>{t('news.noneText')}</EmptyState>
    );
  const [lead, ...others] = posts;
  const rest = others.slice(0, visible - 1);
  const href = (post: NewsPost) => '/' + l + '/news/' + post.slug;
  const minutes = (post: NewsPost) =>
    t('news.readingTime', {
      count: readingMinutes(post, l),
      n: numberLabel(readingMinutes(post, l), l),
    });
  const date = (post: NewsPost) =>
    post.published_at ? dateLabel(post.published_at, l) : t('common.pending');
  return (
    <>
      <article className="lead-story">
        <div className="lead-media">
          <Photo
            src={lead.image_url}
            fallback={newsPhoto(lead.id)}
            eager
            decorative
          />
          <span className="lead-chip">
            <Clock weight="bold" aria-hidden />
            {minutes(lead)}
          </span>
        </div>
        <div className="lead-body">
          <p className="lead-kicker">
            <span className="lead-flag">{t('news.latest')}</span>
            <span>{t('news.' + lead.category)}</span>
          </p>
          <h2>
            <AppLink href={href(lead)} className="lead-title">
              {localised(lead, 'title', l)}
            </AppLink>
          </h2>
          <p className="lead-excerpt">{excerpt(lead, l)}</p>
          <p className="lead-foot">
            <time dateTime={lead.published_at || undefined}>{date(lead)}</time>
            <span className="lead-read" aria-hidden>
              {t('common.readMore')}
              <Arrow />
            </span>
          </p>
        </div>
      </article>
      {rest.length > 0 && (
        <section className="more-stories" aria-labelledby="more-stories-title">
          <h2 id="more-stories-title" className="more-stories-title">
            {t('news.moreStories')}
          </h2>
          <HoverImageList
            items={rest}
            rtl={l === 'ar'}
            focusInset={88}
            listRef={list}
            preview={(post) => (
              <Photo
                src={post.image_url}
                fallback={newsPhoto(post.id)}
                eager
                decorative
              />
            )}
            renderRow={(post) => (
              <article className="story-row">
                <time
                  className="story-row-date"
                  dateTime={post.published_at || undefined}
                >
                  {post.published_at ? (
                    <>
                      <strong>
                        {dateLabel(post.published_at, l, { day: 'numeric' })}
                      </strong>
                      <span>
                        {dateLabel(post.published_at, l, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </>
                  ) : (
                    t('common.pending')
                  )}
                </time>
                <div className="story-row-main">
                  <p className="story-row-kicker">
                    <span>{t('news.' + post.category)}</span>
                    <span>{minutes(post)}</span>
                  </p>
                  <h3>
                    <AppLink href={href(post)} className="story-row-title">
                      {localised(post, 'title', l)}
                    </AppLink>
                  </h3>
                  <p className="story-row-excerpt">{excerpt(post, l)}</p>
                </div>
                <div className="story-row-thumb">
                  <Photo
                    src={post.image_url}
                    fallback={newsPhoto(post.id)}
                    decorative
                  />
                </div>
                <span className="story-row-arrow" aria-hidden>
                  <Arrow diagonal />
                </span>
              </article>
            )}
          />
        </section>
      )}
      {posts.length > NEWS_PAGE_SIZE && (
        <div className="news-more">
          <p className="muted" aria-live="polite">
            {t('news.showing', {
              shown: numberLabel(Math.min(visible, posts.length), l),
              total: posts.length,
              n: numberLabel(posts.length, l),
            })}
          </p>
          {visible < posts.length && (
            <Button
              variant="secondary"
              onPress={() => {
                firstNew.current = visible;
                onShowMore();
              }}
            >
              {t('news.showMore')}
            </Button>
          )}
        </div>
      )}
    </>
  );
}
export function NewsArticle({
  slug,
  initial,
}: {
  slug: string;
  initial: NewsPost | null;
}) {
  const { news, ready } = usePublicData();
  const post = ready
    ? publishedNews(news).find((n) => n.slug === slug)
    : initial;
  const t = useTranslations();
  const l = useLocale();
  if (!post)
    return (
      <div className="section container">
        <EmptyState
          title={t('errors.notFoundTitle')}
          action={<AppLink href={'/' + l + '/news'}>{t('news.back')}</AppLink>}
        />
      </div>
    );
  return (
    <div className="container">
      <article className="article">
        <div className="back-link">
          <AppLink href={'/' + l + '/news'}>{t('news.back')}</AppLink>
        </div>
        <PageIntro
          eyebrow={t('news.' + post.category)}
          title={localised(post, 'title', l)}
        >
          <time dateTime={post.published_at || undefined}>
            {post.published_at
              ? dateLabel(post.published_at, l)
              : t('common.pending')}
          </time>
        </PageIntro>
        <p className="notice">{t('news.sampleNote')}</p>
        <div className="article-art">
          <Photo src={post.image_url} eager fallback={newsPhoto(post.id)} />
        </div>
        {!post.image_url && <PhotoCredit photo={newsPhoto(post.id)} />}
        <div className="prose">
          {localised(post, 'body', l)
            .split('\n\n')
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
        </div>
        <ShareLinks
          title={localised(post, 'title', l)}
          label={t('news.share')}
        />
      </article>
      <section className="section border-t border-line">
        <div className="section-heading">
          <h2>{t('news.more')}</h2>
        </div>
        <NewsGrid
          posts={publishedNews(news)
            .filter((n) => n.id !== post.id)
            .slice(0, 3)}
        />
      </section>
    </div>
  );
}
