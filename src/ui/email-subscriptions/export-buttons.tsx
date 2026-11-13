'use client'

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

import {
  exportEmailSubscriptions,
  type SubscribersExport
} from '@/lib/email-subscriptions/actions'
import type { ExportScope } from '@/lib/email-subscriptions/types'
import type { FormResponse } from '@/lib/types'
import { useToast } from '@/ui/toast/toast-context'

const REVOKE_DELAY_MS = 40_000

function saveCsv({ csv, filename }: SubscribersExport) {
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
 * rows, so its error points to Export all.
 */
function useCsvDownload() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { addSuccessMessage, addErrorMessage } = useToast()

  function download(
    fetchCsv: () => Promise<FormResponse<SubscribersExport>>
  ) {
    startTransition(async () => {
      let res
      try {
        res = await fetchCsv()
      } catch {
        addErrorMessage(
          'The export didn’t finish. If it went through, use Export all to download everyone again.'
        )
        router.refresh()
        return
      }
      if (!res?.ok || !res.res) {
        // a lost DB response comes back as an error, though it may
        // have stamped rows
        addErrorMessage(
          `${res?.message ?? 'Failed to export subscribers.'} If it went through, use Export all to download everyone again.`
        )
        router.refresh()
        return
      }
      try {
        saveCsv(res.res)
      } catch {
        addErrorMessage(
          'Couldn’t save the file. Use Export all to download everyone again.'
        )
        router.refresh()
        return
      }
      addSuccessMessage(
        `Exported ${res.res.count} ${res.res.count === 1 ? 'subscriber' : 'subscribers'}.`
      )
      router.refresh()
    })
  }

  return { download, isPending }
}

export function ExportButtons({
  exportableCount,
  unexportedCount
}: {
  exportableCount: number
  unexportedCount: number
}) {
  const { download, isPending } = useCsvDownload()
  const exportAllRef = useRef<HTMLButtonElement>(null)
  const exportNewRef = useRef<HTMLButtonElement>(null)
  // set by Export new; cleared once it hides or focus moves on. Not
  // by an error, since a lost DB response may still have stamped rows
  const isFocusMovedOnHideRef = useRef(false)
  // nothing new, or the same rows as Export all
  const isNewVisible =
    unexportedCount > 0 && unexportedCount !== exportableCount

  // otherwise focus falls back to the page when Export new unmounts
  useEffect(() => {
    if (isNewVisible || isPending || !isFocusMovedOnHideRef.current) {
      return
    }
    isFocusMovedOnHideRef.current = false
    if (
      !document.activeElement ||
      document.activeElement === document.body
    ) {
      exportAllRef.current?.focus()
    }
  }, [isNewVisible, isPending])

  // so a later hide (e.g. by marking spam) doesn't pull focus back
  useEffect(() => {
    function clearOnFocusElsewhere(event: FocusEvent) {
      if (event.target !== exportNewRef.current) {
        isFocusMovedOnHideRef.current = false
      }
    }
    document.addEventListener('focusin', clearOnFocusElsewhere)
    return () =>
      document.removeEventListener('focusin', clearOnFocusElsewhere)
  }, [])

  function run(scope: ExportScope) {
    isFocusMovedOnHideRef.current = scope === 'new'
    download(() => exportEmailSubscriptions(scope))
  }

  return (
    <>
      <button
        ref={exportAllRef}
        type='button'
        className='button-outline'
        onClick={() => run('all')}
        disabled={isPending || exportableCount === 0}
      >
        <ArrowDownTrayIcon /> Export all ({exportableCount})
      </button>
      {isNewVisible && (
        <button
          ref={exportNewRef}
          type='button'
          className='button-primary'
          onClick={() => run('new')}
          disabled={isPending}
        >
          <ArrowDownTrayIcon /> Export new ({unexportedCount})
        </button>
      )}
    </>
  )
}
