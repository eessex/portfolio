'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import {
  exportEmailSubscriptions,
  type SubscribersExport
} from '@/lib/email-subscriptions/actions'
import type { ExportScope } from '@/lib/email-subscriptions/types'
import type { FormResponse } from '@/lib/types'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'
import { useToast } from '@/ui/toast/toast-context'

const REVOKE_DELAY_MS = 40_000

export function saveCsv({ csv, filename }: SubscribersExport) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' })
  )
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  // revoking right away can cancel the download in Firefox/Safari
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}

/**
 * Fetches a CSV and saves it. A lost response may still have stamped
 * rows, so its error points to Recent exports.
 */
export function useCsvDownload() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string>()
  const router = useRouter()
  const { addSuccessMessage } = useToast()

  function download(
    fetchCsv: () => Promise<FormResponse<SubscribersExport>>
  ) {
    startTransition(async () => {
      let res
      try {
        res = await fetchCsv()
      } catch {
        setError(
          'The export didn’t finish. If it went through, download it from Recent exports.'
        )
        router.refresh()
        return
      }
      if (!res?.ok || !res.res) {
        setError(res?.message ?? 'Failed to export subscribers.')
        return
      }
      try {
        saveCsv(res.res)
      } catch {
        setError(
          'Couldn’t save the file. Download it from Recent exports.'
        )
        router.refresh()
        return
      }
      setError(undefined)
      addSuccessMessage(
        `Exported ${res.res.count} ${res.res.count === 1 ? 'subscriber' : 'subscribers'}.`
      )
      router.refresh()
    })
  }

  return { download, error, isPending }
}

export function ExportButtons({
  exportableCount,
  unexportedCount
}: {
  exportableCount: number
  unexportedCount: number
}) {
  const { download, error, isPending } = useCsvDownload()

  function run(scope: ExportScope) {
    download(() => exportEmailSubscriptions(scope))
  }

  return (
    <div className={styles['export']}>
      <div className={styles['export-buttons']}>
        <button
          type='button'
          className='button-outline'
          onClick={() => run('all')}
          disabled={isPending || exportableCount === 0}
        >
          Export all ({exportableCount})
        </button>
        <button
          type='button'
          className='button-outline'
          onClick={() => run('new')}
          disabled={isPending || unexportedCount === 0}
        >
          Export new ({unexportedCount})
        </button>
      </div>
      {error && (
        <p role='alert' className={styles['export-error']}>
          {error}
        </p>
      )}
    </div>
  )
}
