import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import { SUBSCRIBERS_PATH } from '@/lib/email-subscriptions/paths'
import { spamReasonLabel } from '@/lib/email-subscriptions/spam-reasons'
import type {
  EmailSubscription,
  EmailSubscriptionsPage
} from '@/lib/email-subscriptions/types'
import dashboardStyles from '@/ui/dashboard/dashboard.module.scss'
import tableStyles from '@/ui/data-table/data-table.module.scss'
import {
  NEW_SECTION_ID,
  sectionHeadingId
} from '@/ui/email-subscriptions/section-ids'
import { SpamToggle } from '@/ui/email-subscriptions/spam-toggle'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'
import { formattedDateTime } from '@/ui/format/dates'
import { Pagination } from '@/ui/pagination/pagination'

type TableKind = 'new' | 'exported' | 'spam'

export function Subscribers({
  data
}: {
  data: EmailSubscriptionsPage
}) {
  const {
    items,
    page,
    pageCount,
    activeCount,
    unexportedCount,
    exportedItems,
    exportedPage,
    exportedPageCount,
    exportedCount,
    spamItems,
    spamPage,
    spamPageCount,
    spamCount
  } = data
  // each table's links keep the others' pages
  const pages = { page, exportedPage, spamPage }

  return (
    <div className={dashboardStyles['dashboard-inner']}>
      <SubscribersSection
        id={NEW_SECTION_ID}
        name='New'
        count={unexportedCount}
        items={items}
        kind='new'
        page={page}
        pageCount={pageCount}
        param='page'
        otherPages={pages}
        emptyText={emptyText(activeCount, spamCount)}
      />

      {exportedCount > 0 && (
        <SubscribersSection
          id='exported-subscribers'
          name='Exported'
          count={exportedCount}
          items={exportedItems}
          kind='exported'
          page={exportedPage}
          pageCount={exportedPageCount}
          param='exportedPage'
          otherPages={pages}
        />
      )}

      {spamCount > 0 && (
        <SubscribersSection
          id='spam-subscribers'
          name='Spam'
          count={spamCount}
          items={spamItems}
          kind='spam'
          page={spamPage}
          pageCount={spamPageCount}
          param='spamPage'
          otherPages={pages}
        />
      )}
    </div>
  )
}

function emptyText(activeCount: number, spamCount: number) {
  if (activeCount > 0) return 'Everyone has been exported.'
  return spamCount > 0
    ? 'No subscribers outside spam.'
    : 'No one has subscribed yet.'
}

function SubscribersSection({
  id,
  name,
  count,
  items,
  kind,
  page,
  pageCount,
  param,
  otherPages,
  emptyText
}: {
  id: string
  name: string
  count: number
  items: EmailSubscription[]
  kind: TableKind
  page: number
  pageCount: number
  param: string
  otherPages: Record<string, number>
  emptyText?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={sectionHeadingId(id)}
      className={styles['table-section']}
    >
      {/* focusable, where a moved row's toggle sends focus */}
      <h2
        id={sectionHeadingId(id)}
        className={styles['section-heading']}
        tabIndex={-1}
      >
        {name} ({count})
      </h2>
      {items.length === 0 && emptyText ? (
        <p className={styles['empty']}>{emptyText}</p>
      ) : (
        <SubscribersTable items={items} kind={kind} />
      )}
      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={SUBSCRIBERS_PATH}
        label={`${name} pages`}
        param={param}
        otherPages={otherPages}
        fragment={id}
      />
    </section>
  )
}

function SubscribersTable({
  items,
  kind
}: {
  items: EmailSubscription[]
  kind: TableKind
}) {
  const detailLabel = kind === 'spam' ? 'Reason' : 'Last exported'

  return (
    <table
      className={`${tableStyles['data-table']} ${tableStyles['is-full-bleed']} ${styles['subscribers-table']}`}
    >
      {/* the same columns in every table, so they line up */}
      <colgroup>
        <col />
        <col className={styles['date-col']} />
        <col className={styles['detail-col']} />
        <col className={styles['actions-col']} />
      </colgroup>
      <thead>
        <tr>
          <th scope='col'>Email</th>
          {/* new rows have no detail, so the date takes both */}
          <th scope='col' colSpan={kind === 'new' ? 2 : 1}>
            Subscribed
          </th>
          {kind !== 'new' && <th scope='col'>{detailLabel}</th>}
          <th scope='col'>
            <span className='visually-hidden'>Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <th scope='row'>
              <span className={styles['email']}>{item.email}</span>
            </th>
            <td colSpan={kind === 'new' ? 2 : 1}>
              <span className={tableStyles['cell-label']}>
                Subscribed{' '}
              </span>
              {formattedTimestamp(item.createdAt)}
            </td>
            {kind !== 'new' && (
              <td>
                <span className={tableStyles['cell-label']}>
                  {detailLabel}{' '}
                </span>
                {kind === 'spam'
                  ? spamReasonText(item)
                  : item.exportedAt &&
                    formattedTimestamp(item.exportedAt)}
              </td>
            )}
            <td>
              <SpamToggle
                id={item.id}
                email={item.email}
                isSpam={item.isSpam}
                fallbackFocusId={sectionHeadingId(NEW_SECTION_ID)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// the toggle clears the reason, so no reason means an admin marked it
function spamReasonText({
  spamReason,
  isSpamReviewed
}: EmailSubscription) {
  return (
    spamReasonLabel(spamReason) ??
    (isSpamReviewed ? 'Marked manually' : 'Unknown')
  )
}

// Timestamps, not dates: formattedDateTime shifts a tz-less value
function formattedTimestamp(date: Date) {
  return formattedDateTime(date, 'md', DEFAULT_TIME_ZONE)
}
