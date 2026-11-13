'use client'

import { FlagIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { flagSuspiciousSubscriptions } from '@/lib/email-subscriptions/actions'
import { useToast } from '@/ui/toast/toast-context'

/** Runs the spam rules over subscribers nobody has reviewed yet */
export function FlagSuspiciousButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { addSuccessMessage, addErrorMessage } = useToast()

  function flag() {
    startTransition(async () => {
      let res
      try {
        res = await flagSuspiciousSubscriptions()
      } catch {
        addErrorMessage('Failed to flag subscribers.')
        // earlier batches may have been flagged before it failed
        router.refresh()
        return
      }
      if (res?.ok) {
        addSuccessMessage(res.message ?? 'Done.')
      } else {
        addErrorMessage(res?.message ?? 'Failed to flag subscribers.')
      }
      // a failed batch can follow ones that already saved
      router.refresh()
    })
  }

  return (
    <button
      type='button'
      className='button-outline'
      onClick={flag}
      disabled={isPending}
    >
      <FlagIcon /> Flag suspicious
    </button>
  )
}
