'use client'

import { downloadSubscribersExport } from '@/lib/email-subscriptions/actions'
import { useCsvDownload } from '@/ui/email-subscriptions/export-buttons'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'

export function DownloadExportButton({
  batchId,
  label
}: {
  batchId: string
  label: string
}) {
  const { download, error, isPending } = useCsvDownload()

  return (
    <>
      <button
        type='button'
        className='button-sm'
        onClick={() =>
          download(() => downloadSubscribersExport(batchId))
        }
        disabled={isPending}
        aria-label={`Download again: ${label}`}
      >
        Download again
      </button>
      {error && (
        <p role='alert' className={styles['export-error']}>
          {error}
        </p>
      )}
    </>
  )
}
