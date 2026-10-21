'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  DatePicker,
  Label,
  Group,
  DateInput,
  DateSegment,
  Popover,
  Dialog,
  Calendar,
  CalendarGrid,
  CalendarCell,
  Heading,
  Button as AriaButton,
} from 'react-aria-components';
import { parseAbsolute, parseDate } from '@internationalized/date';
import {
  Check,
  PencilSimple,
  Trash,
  DownloadSimple,
  Plus,
  CalendarBlank,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import {
  Button,
  Field,
  SelectField,
  CheckField,
  ConfirmDialog,
  Badge,
  EmptyState,
} from './ui';
import { ProgrammeCalendar } from './calendar';
import {
  readStore,
  writeStore,
  initialStore,
  availabilityFor,
  isSlotFree,
  STORE_KEY,
  DRAFT_KEY,
  type Store,
} from '@/lib/data/booking';
import { venues } from '@/lib/data/mock';
import {
  categories,
  localised,
  type Event,
  type NewsPost,
  type Reservation,
  type Slot,
} from '@/lib/data/types';
import { BOOKING_MODE, TIME_ZONE } from '@/lib/config';
import { dateLabel, numberLabel, slotTimes } from '@/lib/dates';
import { toCSV, downloadFile } from '@/lib/download';
import { notify } from './providers';
type Edit =
  | { kind: 'reservation'; value: Reservation }
  | { kind: 'event'; value: Event }
  | { kind: 'news'; value: NewsPost }
  | null;
type Confirm =
  | { kind: 'cancel'; id: string }
  | { kind: 'delete'; id: string }
  | { kind: 'reset' }
  | null;
export function Admin() {
  const t = useTranslations();
  const l = useLocale();
  const [store, setStore] = useState<Store>(initialStore);
  const [venue, setVenue] = useState('sea');
  const [month, setMonth] = useState('2027-03');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [cancelled, setCancelled] = useState(false);
  const [edit, setEdit] = useState<Edit>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const refresh = () => setStore(readStore());
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('saida-data', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('saida-data', refresh);
    };
  }, []);
  const save = (next: Store) => {
    writeStore(next);
    setStore(next);
    notify(t('admin.saved'));
  };
  const approve = (id: string) => {
    const next = readStore();
    const event = next.events.find((e) => e.id === id);
    if (event) event.status = 'published';
    save(next);
  };
  const awaiting = store.events.filter((e) => e.status === 'review').length;
  const availability = availabilityFor(store.reservations, venue, month);
  const records = store.reservations
    .filter(
      (r) =>
        (cancelled || r.status === 'confirmed') &&
        r.venue_id === venue &&
        r.date.startsWith(month) &&
        (!date || r.date === date),
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const handleConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === 'reset') {
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(DRAFT_KEY);
      save(initialStore());
    }
    if (confirm.kind === 'cancel') {
      const next = readStore();
      const row = next.reservations.find((r) => r.id === confirm.id);
      if (row) {
        row.status = 'cancelled';
        const event = next.events.find((e) => e.id === row.event_id);
        if (event) event.status = 'cancelled';
      }
      save(next);
    }
    if (confirm.kind === 'delete') {
      const next = readStore();
      next.news_posts = next.news_posts.filter((n) => n.id !== confirm.id);
      save(next);
    }
    setConfirm(null);
  };
  const saveEdit = () => {
    if (!edit) return;
    setError('');
    const next = readStore();
    if (edit.kind === 'reservation') {
      const row = edit.value;
      if (
        !/^2027-\d{2}-\d{2}$/.test(row.date) ||
        isNaN(Date.parse(row.date)) ||
        new Date(row.date).toISOString().slice(0, 10) !== row.date
      ) {
        setError(t('admin.dateError'));
        return;
      }
      if (
        !isSlotFree(
          next.reservations,
          row.venue_id,
          row.date,
          row.slot,
          BOOKING_MODE,
          row.id,
        )
      ) {
        setError(t('admin.conflict'));
        return;
      }
      next.reservations = next.reservations.map((r) =>
        r.id === row.id ? row : r,
      );
      next.events = next.events.map((e) =>
        e.id === row.event_id
          ? { ...e, venue_id: row.venue_id, ...slotTimes(row.date, row.slot) }
          : e,
      );
    } else if (edit.kind === 'event') {
      const event = edit.value;
      if (
        event.title_en.trim().length < 5 ||
        event.title_ar.trim().length < 5
      ) {
        setError(t('validation.newsTitle'));
        return;
      }
      if (
        event.description_en.trim().length < 30 ||
        event.description_ar.trim().length < 30
      ) {
        setError(t('validation.description'));
        return;
      }
      next.events = next.events.map((e) => (e.id === event.id ? event : e));
      if (event.status === 'cancelled')
        next.reservations = next.reservations.map((r) =>
          r.event_id === event.id ? { ...r, status: 'cancelled' } : r,
        );
      if (event.status === 'published') {
        const reservation = next.reservations.find(
          (r) => r.event_id === event.id,
        );
        if (reservation?.status === 'cancelled') {
          if (
            !isSlotFree(
              next.reservations,
              reservation.venue_id,
              reservation.date,
              reservation.slot,
              BOOKING_MODE,
              reservation.id,
            )
          ) {
            setError(t('admin.conflict'));
            return;
          }
          reservation.status = 'confirmed';
        }
      }
    } else {
      const post = { ...edit.value };
      if (post.title_en.trim().length < 5 || post.title_ar.trim().length < 5) {
        setError(t('validation.newsTitle'));
        return;
      }
      if (post.body_en.trim().length < 20 || post.body_ar.trim().length < 20) {
        setError(t('validation.newsBody'));
        return;
      }
      if (
        post.status === 'scheduled' &&
        (!post.published_at || new Date(post.published_at) <= new Date())
      ) {
        setError(t('validation.schedule'));
        return;
      }
      if (post.status === 'published' && !post.published_at)
        post.published_at = new Date().toISOString();
      const existing = next.news_posts.findIndex((n) => n.id === post.id);
      if (existing < 0) next.news_posts.push(post);
      else next.news_posts[existing] = post;
    }
    try {
      save(next);
      setEdit(null);
    } catch {
      setError(t('common.error'));
    }
  };
  const updateEdit = (key: string, value: unknown) =>
    setEdit((current) =>
      current
        ? ({ ...current, value: { ...current.value, [key]: value } } as Edit)
        : current,
    );
  const openEdit = (value: Edit) => {
    setEdit(value);
    setError('');
  };
  const createPost = () => {
    const id = crypto.randomUUID();
    openEdit({
      kind: 'news',
      value: {
        id,
        slug: 'post-' + id,
        title_en: '',
        title_ar: '',
        body_en: '',
        body_ar: '',
        category: 'announcement',
        published_at: null,
        status: 'draft',
        image_url: null,
      },
    });
  };
  return (
    <div className="page-bottom container">
      <header className="admin-heading">
        <div>
          <h1>{t('admin.title')}</h1>
          <p>{t('admin.subtitle')}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setConfirm({ kind: 'reset' })}
        >
          {t('admin.reset')}
        </Button>
      </header>
      <p className="notice notice-warning">{t('admin.warning')}</p>
      <div className="admin-stats">
        <div className="admin-stat">
          <strong>
            {numberLabel(
              store.reservations.filter((r) => r.status === 'confirmed').length,
              l,
            )}
          </strong>
          <span>{t('admin.total')}</span>
        </div>
        <div className="admin-stat">
          <strong>
            {numberLabel(
              availability.flatMap((d) => d.slots).filter((s) => s.available)
                .length,
              l,
            )}
          </strong>
          <span>
            {t('admin.available')} ·{' '}
            {dateLabel(month + '-01', l, { month: 'short' })}
          </span>
        </div>
        <div className="admin-stat">
          <strong>
            {numberLabel(
              store.events.filter((e) => e.status === 'published').length,
              l,
            )}
          </strong>
          <span>{t('admin.published')}</span>
        </div>
      </div>
      <Tabs onSelectionChange={() => setSearch('')}>
        <TabList aria-label={t('admin.title')} className="admin-tabs">
          {['reservations', 'events', 'news', 'exports'].map((id) => (
            <Tab key={id} id={id} className="view-tab">
              {t('admin.' + id)}
            </Tab>
          ))}
        </TabList>
        <TabPanel id="reservations">
          <div className="calendar-layout">
            <div>
              <SelectField
                label={t('common.venue')}
                value={venue}
                onChange={(v) => {
                  setVenue(v);
                  setDate('');
                }}
                options={venues.map((v) => ({
                  id: v.id,
                  label: localised(v, 'name', l),
                }))}
              />
              <div className="mt-6">
                <ProgrammeCalendar
                  value={date}
                  onChange={setDate}
                  month={month}
                  onMonthChange={(m) => {
                    setMonth(m);
                    setDate('');
                  }}
                  availability={availability}
                  label={t('admin.calendar')}
                />
              </div>
              <div className="calendar-legend">
                {['available', 'partial', 'full'].map((s) => (
                  <span key={s}>
                    <i className={s} />
                    {t('common.' + s)}
                  </span>
                ))}
              </div>
              <Button variant="ghost" onPress={() => setDate('')}>
                {t('events.allDates')}
              </Button>
            </div>
            <div>
              <div className="admin-controls">
                <h2 className="font-sans text-lead">{t('admin.table')}</h2>
                <CheckField isSelected={cancelled} onChange={setCancelled}>
                  {t('admin.showCancelled')}
                </CheckField>
              </div>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t('common.date')}</th>
                      <th>{t('admin.event')}</th>
                      <th>{t('common.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((row) => (
                      <tr key={row.id}>
                        <td>
                          {dateLabel(row.date, l, {
                            day: 'numeric',
                            month: 'short',
                          })}
                          <br />
                          <span className="muted">
                            {t('common.' + row.slot)}
                          </span>
                        </td>
                        <td>
                          {row.event_id
                            ? localised(
                                store.events.find(
                                  (e) => e.id === row.event_id,
                                ) || {},
                                'title',
                                l,
                              )
                            : t('admin.noEvent')}
                        </td>
                        <td>
                          <Badge
                            tone={row.status === 'confirmed' ? 'sea' : 'red'}
                          >
                            {t('common.' + row.status)}
                          </Badge>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Button
                              variant="ghost"
                              size="icon"
                              isDisabled={row.status === 'cancelled'}
                              aria-label={t('admin.editReservation')}
                              onPress={() =>
                                openEdit({
                                  kind: 'reservation',
                                  value: { ...row },
                                })
                              }
                            >
                              <PencilSimple weight="thin" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              isDisabled={row.status === 'cancelled'}
                              aria-label={t('admin.cancelAction')}
                              onPress={() =>
                                setConfirm({ kind: 'cancel', id: row.id })
                              }
                            >
                              <Trash weight="thin" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!records.length && <EmptyState title={t('admin.empty')} />}
            </div>
          </div>
        </TabPanel>
        <TabPanel id="events">
          {awaiting > 0 && (
            <p className="notice notice-warning mb-6">
              {t('admin.awaiting', {
                count: awaiting,
                n: numberLabel(awaiting, l),
              })}
            </p>
          )}
          <div className="admin-controls">
            <Field
              label={t('events.searchLabel')}
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.event')}</th>
                  <th>{t('common.date')}</th>
                  <th>{t('common.venue')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {store.events
                  .filter((e) =>
                    (e.title_en + e.title_ar)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  // Events awaiting review come first.
                  .sort(
                    (a, b) =>
                      Number(b.status === 'review') -
                      Number(a.status === 'review'),
                  )
                  .map((event) => (
                    <tr key={event.id}>
                      <td>{localised(event, 'title', l)}</td>
                      <td>{dateLabel(event.starts_at, l)}</td>
                      <td>
                        {localised(
                          venues.find((v) => v.id === event.venue_id)!,
                          'name',
                          l,
                        )}
                      </td>
                      <td>
                        <Badge
                          tone={
                            event.status === 'published'
                              ? 'sea'
                              : event.status === 'cancelled'
                                ? 'red'
                                : 'neutral'
                          }
                        >
                          {t('common.' + event.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="table-actions">
                          {event.status === 'review' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onPress={() => approve(event.id)}
                            >
                              <Check weight="thin" />
                              {t('admin.approve')}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onPress={() =>
                              openEdit({ kind: 'event', value: { ...event } })
                            }
                          >
                            <PencilSimple weight="thin" />
                            {t('common.edit')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabPanel>
        <TabPanel id="news">
          <div className="admin-controls">
            <Field
              label={t('common.search')}
              value={search}
              onChange={setSearch}
            />
            <Button onPress={createPost}>
              <Plus weight="thin" />
              {t('admin.newPost')}
            </Button>
          </div>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.news')}</th>
                  <th>{t('admin.publishAt')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {store.news_posts
                  .filter((n) =>
                    (n.title_en + n.title_ar)
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((post) => (
                    <tr key={post.id}>
                      <td>{localised(post, 'title', l)}</td>
                      <td>
                        {post.published_at
                          ? dateLabel(post.published_at, l)
                          : t('common.dash')}
                      </td>
                      <td>
                        <Badge
                          tone={post.status === 'published' ? 'sea' : 'neutral'}
                        >
                          {t('common.' + post.status)}
                        </Badge>
                      </td>
                      <td>
                        <div className="table-actions">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('admin.editNews')}
                            onPress={() =>
                              openEdit({ kind: 'news', value: { ...post } })
                            }
                          >
                            <PencilSimple weight="thin" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t('common.delete')}
                            onPress={() =>
                              setConfirm({ kind: 'delete', id: post.id })
                            }
                          >
                            <Trash weight="thin" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </TabPanel>
        <TabPanel id="exports">
          <div className="export-panel">
            <h2 className="text-section">{t('admin.exportTitle')}</h2>
            <p>{t('admin.exportText')}</p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="secondary"
                onPress={() =>
                  downloadFile(
                    toCSV(store.reservations),
                    'saida-reservations.csv',
                    'text/csv;charset=utf-8',
                  )
                }
              >
                <DownloadSimple weight="thin" />
                {t('admin.exportReservations')}
              </Button>
              <Button
                variant="secondary"
                onPress={() =>
                  downloadFile(
                    toCSV(
                      store.events.map((event) => ({
                        ...event,
                        ...store.submission_details?.[event.id],
                        organiser_email:
                          store.reservations.find(
                            (r) => r.event_id === event.id,
                          )?.organiser_email || '',
                        organiser_phone:
                          store.reservations.find(
                            (r) => r.event_id === event.id,
                          )?.organiser_phone || '',
                      })),
                    ),
                    'saida-submissions.csv',
                    'text/csv;charset=utf-8',
                  )
                }
              >
                <DownloadSimple weight="thin" />
                {t('admin.exportSubmissions')}
              </Button>
            </div>
          </div>
        </TabPanel>
      </Tabs>
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={t(
          confirm?.kind === 'reset'
            ? 'admin.resetTitle'
            : confirm?.kind === 'cancel'
              ? 'admin.cancelTitle'
              : 'admin.deleteTitle',
        )}
        danger
        confirmLabel={t(
          confirm?.kind === 'reset'
            ? 'admin.reset'
            : confirm?.kind === 'cancel'
              ? 'admin.cancelAction'
              : 'common.delete',
        )}
        onConfirm={handleConfirm}
      >
        {t(
          confirm?.kind === 'reset'
            ? 'admin.resetText'
            : confirm?.kind === 'cancel'
              ? 'admin.cancelText'
              : 'admin.deleteText',
        )}
      </ConfirmDialog>
      <ConfirmDialog
        open={!!edit}
        onClose={() => setEdit(null)}
        title={t(
          edit?.kind === 'reservation'
            ? 'admin.editReservation'
            : edit?.kind === 'event'
              ? 'admin.editEvent'
              : 'admin.editNews',
        )}
        onConfirm={saveEdit}
      >
        <div className="form-fields">
          {edit?.kind === 'reservation' && (
            <>
              <SelectField
                label={t('common.venue')}
                value={edit.value.venue_id}
                onChange={(v) => updateEdit('venue_id', v)}
                options={venues.map((v) => ({
                  id: v.id,
                  label: localised(v, 'name', l),
                }))}
              />
              <ReservationDate
                value={edit.value.date}
                onChange={(v) => updateEdit('date', v)}
              />
              <SelectField
                label={t('common.time')}
                value={edit.value.slot}
                onChange={(v) => updateEdit('slot', v as Slot)}
                options={(BOOKING_MODE === 'whole-day'
                  ? ['whole-day']
                  : ['morning', 'afternoon', 'evening']
                ).map((id) => ({ id, label: t('common.' + id) }))}
              />
              <div className="notice">
                <strong>{t('admin.private')}</strong>
                <p>{edit.value.organiser_email}</p>
                <p dir="ltr">{edit.value.organiser_phone}</p>
              </div>
            </>
          )}
          {(edit?.kind === 'event' || edit?.kind === 'news') && (
            <>
              <Field
                label={t('admin.titleEn')}
                value={edit.value.title_en}
                onChange={(v) => updateEdit('title_en', v)}
              />
              <Field
                label={t('admin.titleAr')}
                value={edit.value.title_ar}
                onChange={(v) => updateEdit('title_ar', v)}
              />
            </>
          )}
          {edit?.kind === 'event' && (
            <>
              <Field
                label={t('admin.bodyEn')}
                value={edit.value.description_en}
                onChange={(v) => updateEdit('description_en', v)}
                multiline
              />
              <Field
                label={t('admin.bodyAr')}
                value={edit.value.description_ar}
                onChange={(v) => updateEdit('description_ar', v)}
                multiline
              />
              <SelectField
                label={t('common.category')}
                value={edit.value.category}
                onChange={(v) => updateEdit('category', v)}
                options={categories.map((id) => ({
                  id,
                  label: t('categories.' + id),
                }))}
              />
              <Field
                label={t('booking.accessibility') + ' · ' + t('common.en')}
                value={edit.value.accessibility_en}
                onChange={(v) => updateEdit('accessibility_en', v)}
                multiline
              />
              <Field
                label={t('booking.accessibility') + ' · ' + t('common.ar')}
                value={edit.value.accessibility_ar}
                onChange={(v) => updateEdit('accessibility_ar', v)}
                multiline
              />
              <SelectField
                label={t('common.status')}
                value={edit.value.status}
                onChange={(v) => updateEdit('status', v)}
                options={['review', 'published', 'cancelled'].map((id) => ({
                  id,
                  label: t('common.' + id),
                }))}
              />
            </>
          )}
          {edit?.kind === 'news' && (
            <>
              <Field
                label={t('admin.bodyEn')}
                value={edit.value.body_en}
                onChange={(v) => updateEdit('body_en', v)}
                multiline
              />
              <Field
                label={t('admin.bodyAr')}
                value={edit.value.body_ar}
                onChange={(v) => updateEdit('body_ar', v)}
                multiline
              />
              <SelectField
                label={t('common.category')}
                value={edit.value.category}
                onChange={(v) => updateEdit('category', v)}
                options={['announcement', 'programme', 'community'].map(
                  (id) => ({ id, label: t('news.' + id) }),
                )}
              />
              <SelectField
                label={t('admin.status')}
                value={edit.value.status}
                onChange={(v) => updateEdit('status', v)}
                options={['draft', 'scheduled', 'published'].map((id) => ({
                  id,
                  label: t('common.' + id),
                }))}
              />
              {edit.value.status !== 'draft' && (
                <PublishDate
                  value={edit.value.published_at}
                  onChange={(v) => updateEdit('published_at', v)}
                />
              )}
            </>
          )}
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
        </div>
      </ConfirmDialog>
    </div>
  );
}
function ReservationDate({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTranslations();
  return (
    <DatePicker
      value={parseDate(value)}
      onChange={(v) => v && onChange(v.toString())}
      minValue={parseDate('2027-01-01')}
      maxValue={parseDate('2027-12-31')}
      className="field"
    >
      <Label>{t('common.date')}</Label>
      <Group className="input flex">
        <DateInput className="flex flex-1">
          {(s) => <DateSegment segment={s} />}
        </DateInput>
        <AriaButton
          aria-label={t('common.date')}
          className="button button-icon button-ghost"
        >
          <CalendarBlank weight="thin" />
        </AriaButton>
      </Group>
      <DatePopover />
    </DatePicker>
  );
}
function PublishDate({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const t = useTranslations();
  return (
    <DatePicker
      value={value ? parseAbsolute(value, TIME_ZONE) : null}
      onChange={(v) => onChange(v?.toAbsoluteString() || null)}
      granularity="minute"
      hideTimeZone
      className="field"
    >
      <Label>{t('admin.publishAt')}</Label>
      <Group className="input flex">
        <DateInput className="flex flex-1">
          {(s) => <DateSegment segment={s} />}
        </DateInput>
        <AriaButton
          aria-label={t('common.date')}
          className="button button-icon button-ghost"
        >
          <CalendarBlank weight="thin" />
        </AriaButton>
      </Group>
      <DatePopover />
    </DatePicker>
  );
}
function DatePopover() {
  return (
    <Popover className="popover p-4">
      <Dialog>
        <Calendar className="calendar">
          <header className="calendar-header">
            <AriaButton
              slot="previous"
              className="button button-icon button-ghost"
            >
              <CaretLeft weight="thin" />
            </AriaButton>
            <Heading />
            <AriaButton slot="next" className="button button-icon button-ghost">
              <CaretRight weight="thin" />
            </AriaButton>
          </header>
          <CalendarGrid className="calendar-grid">
            {(d) => <CalendarCell date={d} className="calendar-cell" />}
          </CalendarGrid>
        </Calendar>
      </Dialog>
    </Popover>
  );
}
