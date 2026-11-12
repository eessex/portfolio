'use client'

import { useEffect, useRef } from 'react'

import { ExportButtons } from '@/ui/email-subscriptions/export-buttons'
import { FlagSuspiciousButton } from '@/ui/email-subscriptions/flag-suspicious-button'
import {
  NEW_SECTION_ID,
  sectionHeadingId
} from '@/ui/email-subscriptions/section-ids'

/** Every table's, so in the page header */
export function SubscriberActions({
  activeCount,
  unexportedCount
}: {
  activeCount: number
  unexportedCount: number
}) {
  // kept while anyone's active, since a rules change can flag
  // exported rows too
  const isFlagVisible = activeCount > 0
  const isFlagShownBeforeRef = useRef(isFlagVisible)

  // otherwise focus falls back to the page when Flag suspicious unmounts
  useEffect(() => {
    const isFlagShownBefore = isFlagShownBeforeRef.current
    isFlagShownBeforeRef.current = isFlagVisible
    if (isFlagVisible || !isFlagShownBefore) return
    if (
      !document.activeElement ||
      document.activeElement === document.body
    ) {
      // Export all is disabled too, with no one left to export
      document
        .getElementById(sectionHeadingId(NEW_SECTION_ID))
        ?.focus()
    }
  }, [isFlagVisible])

  return (
    <>
      {isFlagVisible && <FlagSuspiciousButton />}
      <ExportButtons
        exportableCount={activeCount}
        unexportedCount={unexportedCount}
      />
    </>
  )
}
