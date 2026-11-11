import { DEFAULT_TIME_ZONE } from '@/lib/dates'
import type { SubscribersExportRecord } from '@/lib/email-subscriptions/types'
import tableStyles from '@/ui/data-table/data-table.module.scss'
import { DownloadExportButton } from '@/ui/email-subscriptions/download-export-button'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'
import { formattedDateTime } from '@/ui/format/dates'

const scopeLabels = { all: 'All', new: 'New' } as const

/**
 * Every export is listed once its rows are stamped, so a lost
 * response or download isn't lost. Only 'new' exports download
 * again: Export all already returns everyone.
 */
export function RecentExports({
  exports
}: {
  exports: SubscribersExportRecord[]
}) {
  if (exports.length === 0) return null

  return (
    <section
      aria-labelledby='recent-exports-heading'
      className={styles['recent-exports']}
    >
      <h3 id='recent-exports-heading'>Recent exports</h3>
      <table
        className={`${tableStyles['data-table']} ${styles['subscribers-table']}`}
      >
        <thead>
          <tr>
            <th scope='col'>Exported</th>
            <th scope='col'>Type</th>
            <th scope='col'>Subscribers</th>
            <th scope='col'>
              <span className='visually-hidden'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {exports.map((item) => {
            const when = formattedDateTime(
              item.createdAt,
              'md',
              DEFAULT_TIME_ZONE
            )
            return (
              <tr key={item.id}>
                <th scope='row'>{when}</th>
                <td>
                  <span className={tableStyles['cell-label']}>
                    Type{' '}
                  </span>
                  {scopeLabels[item.scope]}
                </td>
                <td>
                  <span className={tableStyles['cell-label']}>
                    Subscribers{' '}
                  </span>
                  {item.subscriberCount}
                </td>
                <td>
                  {item.scope === 'new' && (
                    <DownloadExportButton
                      batchId={item.id}
                      label={`New export, ${when}`}
                    />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
