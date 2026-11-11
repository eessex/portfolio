import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import { SUBSCRIBERS_PATH } from '@/lib/email-subscriptions/paths'
import { spamReasonLabel } from '@/lib/email-subscriptions/spam-reasons'
import type { EmailSubscriptionsPage } from '@/lib/email-subscriptions/types'
import { Badges } from '@/ui/badges/badges'
import dashboardStyles from '@/ui/dashboard/dashboard.module.scss'
import tableStyles from '@/ui/data-table/data-table.module.scss'
import { ExportButtons } from '@/ui/email-subscriptions/export-buttons'
import { FlagSuspiciousButton } from '@/ui/email-subscriptions/flag-suspicious-button'
import { RecentExports } from '@/ui/email-subscriptions/recent-exports'
import { SpamToggle } from '@/ui/email-subscriptions/spam-toggle'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'
import { formattedDateTime } from '@/ui/format/dates'
import { Pagination } from '@/ui/pagination/pagination'

export function Subscribers({
  data
}: {
  data: EmailSubscriptionsPage
}) {
  const {
    items,
    page,
    pageCount,
    totalCount,
    unexportedCount,
    spamCount,
    recentExports
  } = data

  return (
    <section
      aria-labelledby='subscribers-heading'
      className={dashboardStyles['dashboard-inner']}
    >
      <div className={styles['toolbar']}>
        <h2 id='subscribers-heading'>
          {totalCount}{' '}
          {totalCount === 1 ? 'subscriber' : 'subscribers'}
          {spamCount > 0 && (
            <span className={styles['spam-count']}>
              {' '}
              ({spamCount} spam)
            </span>
          )}
        </h2>
        <div className={styles['actions']}>
          <FlagSuspiciousButton />
          <ExportButtons
            exportableCount={totalCount - spamCount}
            unexportedCount={unexportedCount}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <p>No one has subscribed yet.</p>
      ) : (
        <table
          className={`${tableStyles['data-table']} ${styles['subscribers-table']}`}
        >
          <thead>
            <tr>
              <th scope='col'>Email</th>
              <th scope='col'>Subscribed</th>
              <th scope='col'>Last exported</th>
              <th scope='col'>
                <span className='visually-hidden'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <th scope='row'>
                  <span className={styles['email']}>
                    {item.email}
                  </span>
                  {item.isSpam && (
                    <Badges
                      badges={[
                        {
                          text: spamBadgeText(item.spamReason),
                          color: 'red'
                        }
                      ]}
                    />
                  )}
                </th>
                <td>
                  <span className={tableStyles['cell-label']}>
                    Subscribed{' '}
                  </span>
                  {formattedTimestamp(item.createdAt)}
                </td>
                <td>
                  <span className={tableStyles['cell-label']}>
                    Last exported{' '}
                  </span>
                  {item.exportedAt
                    ? formattedTimestamp(item.exportedAt)
                    : 'Never'}
                </td>
                <td>
                  <SpamToggle
                    id={item.id}
                    email={item.email}
                    isSpam={item.isSpam}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        page={page}
        pageCount={pageCount}
        basePath={SUBSCRIBERS_PATH}
        label='Subscriber pages'
      />

      <RecentExports exports={recentExports} />
    </section>
  )
}

function spamBadgeText(reason?: string) {
  const label = spamReasonLabel(reason)
  return label ? `Spam: ${label}` : 'Spam'
}

// Timestamps, not dates: formattedDateTime shifts a tz-less value
function formattedTimestamp(date: Date) {
  return formattedDateTime(date, 'md', DEFAULT_TIME_ZONE)
}
