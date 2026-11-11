'use client'

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
      const res = await flagSuspiciousSubscriptions()
      if (res?.ok) {
        addSuccessMessage(res.message ?? 'Done.')
        router.refresh()
      } else {
        addErrorMessage(res?.message ?? 'Failed to flag subscribers.')
      }
    })
  }

  return (
    <button
      type='button'
      className='button-outline'
      onClick={flag}
      disabled={isPending}
    >
      Flag suspicious
    </button>
  )
}
