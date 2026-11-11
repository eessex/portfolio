'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

import { setEmailSubscriptionSpam } from '@/lib/email-subscriptions/actions'
import { useToast } from '@/ui/toast/toast-context'

export function SpamToggle({
  id,
  email,
  isSpam
}: {
  id: string
  email: string
  isSpam: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { addErrorMessage } = useToast()

  function toggle() {
    startTransition(async () => {
      const res = await setEmailSubscriptionSpam(id, !isSpam)
      if (res?.ok) {
        router.refresh()
      } else {
        addErrorMessage(
          res?.message ?? 'Failed to update subscriber.'
        )
      }
    })
  }

  return (
    <button
      type='button'
      className='button-sm'
      onClick={toggle}
      disabled={isPending}
      aria-label={`${isSpam ? 'Not spam' : 'Mark as spam'}: ${email}`}
    >
      {isSpam ? 'Not spam' : 'Mark as spam'}
    </button>
  )
}
