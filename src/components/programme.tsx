'use client';
import { useDeferredValue, useState, ViewTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  SearchField,
  Input,
  Label,
} from 'react-aria-components';
import {
  List,
  CalendarBlank,
  MagnifyingGlass,
  MapPin,
  Clock,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  SelectField,
  CheckField,
  Button,
  EmptyState,
  Badge,
  AppLink,
  Arrow,
} from './ui';
import { ChipGroup } from './ui/chip-group';
import { ScrollSpy } from './ui/scroll-spy';
import { FocusCards } from './ui/focus-cards';
import { DateFilter } from './calendar';
import { DayCalendar } from './day-calendar';
import { Photo } from './artwork';
import { EventRow } from './event-row';
import { usePublicData } from '@/lib/data/hooks';
import { filterEvents } from '@/lib/data';
import { venues } from '@/lib/data/mock';
import { venuePhoto } from '@/lib/photos';
import {
  categories,
  localised,
  type Event,
  type EventFilters,
} from '@/lib/data/types';
import { dateKey, dateLabel, numberLabel, timeLabel } from '@/lib/dates';

const monthId = (month: string) => 'month-' + month;

export function Programme() {
  const t = useTranslations();
  const l = useLocale();
  const rtl = l === 'ar';
  const { events } = usePublicData();
  const [filters, setFilters] = useState<EventFilters>({});
  const deferred = useDeferredValue(filters);
  const [view, setView] = useState('list');
  const [month, setMonth] = useState('2027-03');
  const [selectedDay, setSelectedDay] = useState('');
  const n = (value: number) => numberLabel(value, l);
  const monthLabel = (m: string) =>
    dateLabel(m + '-01', l, { month: 'long', year: 'numeric' });
  const update = (key: keyof EventFilters, value: string | boolean) => {
    setFilters((f) => ({ ...f, [key]: value }));
    if (key === 'month' && value) setMonth(String(value));
  };
  const clear = () => {
    setFilters({});
    setSelectedDay('');
  };

  const published = filterEvents(events);
  const months = [
    ...new Set(published.map((e) => dateKey(e.starts_at).slice(0, 7))),
  ].sort();
  const results = filterEvents(events, deferred);
  const groups = Object.groupBy(results, (e) =>
    dateKey(e.starts_at).slice(0, 7),
  );
  // Counts beside each event type reflect every other active filter.
  const byCategory = Object.groupBy(
    filterEvents(events, { ...deferred, category: undefined }),
    (e) => e.category,
  );
  const now = new Date().toISOString();
  const upcoming = published.filter((e) => e.ends_at >= now);
  const highlights = (upcoming.length ? upcoming : published).slice(0, 3);
  const calendarEvents = selectedDay
    ? results.filter((e) => dateKey(e.starts_at) === selectedDay)
    : results.filter((e) => dateKey(e.starts_at).startsWith(month));

  const active = [
    filters.search && { key: 'search', label: '“' + filters.search + '”' },
    filters.month && { key: 'month', label: monthLabel(filters.month) },
    filters.category && {
      key: 'category',
      label: t('categories.' + filters.category),
    },
    filters.date && { key: 'date', label: dateLabel(filters.date, l) },
    filters.freeOnly && { key: 'freeOnly', label: t('events.freeOnly') },
  ].filter(Boolean) as { key: keyof EventFilters; label: string }[];

  const stats = [
    [published.length, t('events.statEvents')],
    [new Set(published.map((e) => e.venue_id)).size, t('events.statVenues')],
    [months.length, t('events.statMonths')],
    [published.filter((e) => e.entry === 'free').length, t('events.statFree')],
  ] as const;

  const empty = (
    <EmptyState
      title={t('events.noneTitle')}
      action={
        <Button variant="secondary" onPress={clear}>
          {t('common.clear')}
        </Button>
      }
    >
      {t('events.noneText')}
    </EmptyState>
  );

  return (
    // Motion honours reduced motion itself, so server and client render the same markup.
    <MotionConfig reducedMotion="user">
      <div className="page-bottom programme container">
        <header className="programme-hero">
          <div className="programme-hero-copy">
            <p className="eyebrow">{t('events.eyebrow')}</p>
            <h1>{t('events.title')}</h1>
            <p className="intro-text">{t('events.intro')}</p>
          </div>
          <dl className="programme-stats" aria-label={t('events.statsLabel')}>
            {stats.map(([value, label]) => (
              <div key={label} className="programme-stat">
                <dt>{label}</dt>
                <dd>{n(value)}</dd>
              </div>
            ))}
          </dl>
        </header>

        {highlights.length > 0 && (
          <section
            className="programme-highlights"
            aria-labelledby="highlights-title"
          >
            <div className="highlights-heading">
              <h2 id="highlights-title">{t('events.highlights')}</h2>
              <p className="muted">{t('events.highlightsText')}</p>
            </div>
            <FocusCards
              cards={highlights.map((e) => ({
                key: e.id,
                href: '/' + l + '/events/' + e.slug,
                title: localised(e, 'title', l),
                media: (
                  <Photo
                    src={e.image_url}
                    fallback={venuePhoto[e.venue_id]}
                    decorative
                  />
                ),
                corner: (
                  <time dateTime={e.starts_at} className="focus-card-date">
                    <strong>
                      {dateLabel(e.starts_at, l, { day: 'numeric' })}
                    </strong>
                    <span>{dateLabel(e.starts_at, l, { month: 'short' })}</span>
                  </time>
                ),
                kicker: (
                  <>
                    <span>{t('categories.' + e.category)}</span>
                    <span>{t('common.' + e.entry)}</span>
                  </>
                ),
                meta: (
                  <>
                    {dateLabel(e.starts_at, l, { weekday: 'long' })} ·{' '}
                    {timeLabel(e.starts_at, l)} · {venueName(e, l)}
                  </>
                ),
              }))}
            />
          </section>
        )}

        <Tabs selectedKey={view} onSelectionChange={(k) => setView(String(k))}>
          <section className="filter-dock" aria-label={t('events.refine')}>
            <div className="dock-top">
              <SearchField
                value={filters.search || ''}
                onChange={(v) => update('search', v)}
                className="dock-search"
              >
                <Label className="sr-only">{t('events.searchLabel')}</Label>
                <MagnifyingGlass weight="thin" aria-hidden />
                <Input
                  className="dock-search-input"
                  placeholder={t('events.searchPlaceholder')}
                />
              </SearchField>
              <TabList aria-label={t('events.view')} className="view-toggle">
                {[
                  ['list', List, t('events.list')],
                  ['calendar', CalendarBlank, t('events.calendar')],
                ].map(([id, Icon, label]) => (
                  <Tab
                    key={id as string}
                    id={id as string}
                    className="view-tab"
                  >
                    {({ isSelected }) => (
                      <>
                        {isSelected && (
                          <motion.span
                            layoutId="view-thumb"
                            className="view-thumb"
                            transition={{
                              type: 'spring',
                              stiffness: 520,
                              damping: 34,
                              mass: 0.45,
                            }}
                          />
                        )}
                        <Icon weight="thin" aria-hidden />
                        <span>{label as string}</span>
                      </>
                    )}
                  </Tab>
                ))}
              </TabList>
            </div>
            <div className="dock-chips">
              <span className="group-label" aria-hidden>
                {t('common.category')}
              </span>
              <ChipGroup
                label={t('common.category')}
                rtl={rtl}
                value={filters.category ? [filters.category] : []}
                onValueChange={(v) => update('category', v[0] ?? '')}
                options={categories.map((id) => ({
                  value: id,
                  label: t('categories.' + id),
                  count: n(byCategory[id]?.length ?? 0),
                }))}
              />
            </div>
            <div className="dock-fields">
              <SelectField
                label={t('events.month')}
                value={filters.month || ''}
                onChange={(v) => update('month', v)}
                options={[
                  { id: '', label: t('events.allMonths') },
                  ...months.map((id) => ({ id, label: monthLabel(id) })),
                ]}
              />
              <DateFilter
                value={filters.date || ''}
                onChange={(v) => update('date', v)}
              />
              <CheckField
                isSelected={!!filters.freeOnly}
                onChange={(v) => update('freeOnly', v)}
              >
                {t('events.freeOnly')}
              </CheckField>
            </div>
          </section>

          <div className="result-toolbar">
            <p aria-live="polite" className="result-count">
              <strong>
                {t('events.count', {
                  count: results.length,
                  n: n(results.length),
                })}
              </strong>{' '}
              <span className="muted">· {t('common.sample')}</span>
            </p>
            {active.length > 0 && (
              <div className="active-filters">
                <ul aria-label={t('events.activeFilters')}>
                  <AnimatePresence initial={false}>
                    {active.map((f) => (
                      <motion.li
                        key={f.key}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="filter-pill"
                          aria-label={t('events.removeFilter', {
                            label: f.label,
                          })}
                          onPress={() =>
                            update(f.key, f.key === 'freeOnly' ? false : '')
                          }
                        >
                          {f.label}
                          <X weight="bold" aria-hidden />
                        </Button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <Button variant="ghost" size="sm" onPress={clear}>
                  {t('common.clear')}
                </Button>
              </div>
            )}
          </div>

          <TabPanel id="list">
            {view === 'list' &&
              (results.length ? (
                <div className="agenda-layout">
                  <ScrollSpy
                    label={t('events.jumpTo')}
                    offset={150}
                    className="agenda-spy"
                    sections={Object.entries(groups).map(([m, items]) => ({
                      id: monthId(m),
                      label: dateLabel(m + '-01', l, { month: 'long' }),
                      meta: n(items?.length ?? 0),
                    }))}
                  />
                  <div className="agenda">
                    {Object.entries(groups).map(([m, items]) => (
                      <AgendaMonth key={m} month={m} items={items ?? []} />
                    ))}
                  </div>
                </div>
              ) : (
                empty
              ))}
          </TabPanel>
          <TabPanel id="calendar">
            {view === 'calendar' && (
              <div className="calendar-layout">
                <div className="glass-stage">
                  <Photo fallback="seashore" decorative className="glass-bg" />
                  <DayCalendar
                    value={selectedDay}
                    onChange={setSelectedDay}
                    month={month}
                    onMonthChange={(m) => {
                      setMonth(m);
                      setSelectedDay('');
                    }}
                    eventDates={results.map((e) => dateKey(e.starts_at))}
                    footer={
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-white/75">
                          {t('events.calendarHint')}
                        </p>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onPress={() => setSelectedDay('')}
                        >
                          {t('events.allDates')}
                        </Button>
                      </div>
                    }
                  />
                </div>
                <div>
                  <h2 className="agenda-month-title calendar-day-title">
                    {dateLabel(
                      selectedDay || month + '-01',
                      l,
                      selectedDay
                        ? { weekday: 'long', day: 'numeric', month: 'long' }
                        : { month: 'long', year: 'numeric' },
                    )}
                  </h2>
                  {calendarEvents.length ? (
                    <div className="event-list">
                      {calendarEvents.map((e) => (
                        <EventRow event={e} key={e.id} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={t('events.noEventsDay')} />
                  )}
                </div>
              </div>
            )}
          </TabPanel>
        </Tabs>
      </div>
    </MotionConfig>
  );
}

function venueName(event: Event, locale: string) {
  const venue = venues.find((v) => v.id === event.venue_id);
  return venue ? localised(venue, 'name', locale) : '';
}

/** One month of the agenda: a heading and its events strung along a thread that draws in as it scrolls into view. */
function AgendaMonth({ month, items }: { month: string; items: Event[] }) {
  const t = useTranslations();
  const l = useLocale();
  return (
    <section
      id={monthId(month)}
      className="agenda-month"
      aria-labelledby={monthId(month) + '-title'}
    >
      <header className="agenda-month-head">
        <h2 id={monthId(month) + '-title'} className="agenda-month-title">
          {dateLabel(month + '-01', l, { month: 'long', year: 'numeric' })}
        </h2>
        <span className="agenda-month-count">
          {t('events.count', {
            count: items.length,
            n: numberLabel(items.length, l),
          })}
        </span>
      </header>
      <div className="agenda-track">
        <motion.span
          className="agenda-thread"
          aria-hidden
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ type: 'spring', visualDuration: 0.9, bounce: 0 }}
        />
        <ol className="agenda-list">
          <AnimatePresence initial={false}>
            {items.map((e) => (
              <AgendaItem key={e.id} event={e} />
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </section>
  );
}

function AgendaItem({ event }: { event: Event }) {
  const t = useTranslations();
  const l = useLocale();
  const title = localised(event, 'title', l);
  return (
    <motion.li
      layout
      className="agenda-item"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.12 } }}
      transition={{ type: 'spring', visualDuration: 0.45, bounce: 0 }}
    >
      <time dateTime={event.starts_at} className="agenda-date">
        <span className="agenda-node" aria-hidden />
        <strong>{dateLabel(event.starts_at, l, { day: 'numeric' })}</strong>
        <span>{dateLabel(event.starts_at, l, { weekday: 'short' })}</span>
      </time>
      <article className="agenda-card">
        <div className="agenda-thumb">
          <Photo
            src={event.image_url}
            fallback={venuePhoto[event.venue_id]}
            decorative
          />
        </div>
        <div className="agenda-body">
          <p className="agenda-kicker">{t('categories.' + event.category)}</p>
          <h3>
            <ViewTransition
              name={'event-' + event.id}
              default="none"
              share="event-morph"
            >
              <AppLink
                href={'/' + l + '/events/' + event.slug}
                className="agenda-title"
              >
                {title}
              </AppLink>
            </ViewTransition>
          </h3>
          <p className="agenda-meta">
            <span>
              <Clock weight="thin" aria-hidden />
              {timeLabel(event.starts_at, l)}–{timeLabel(event.ends_at, l)}
            </span>
            <span>
              <MapPin weight="thin" aria-hidden />
              {venueName(event, l)}
            </span>
          </p>
        </div>
        <div className="agenda-aside">
          <Badge tone={event.entry === 'free' ? 'sea' : 'neutral'}>
            {t('common.' + event.entry)}
          </Badge>
          <span className="agenda-arrow" aria-hidden>
            <Arrow />
          </span>
        </div>
      </article>
    </motion.li>
  );
}
