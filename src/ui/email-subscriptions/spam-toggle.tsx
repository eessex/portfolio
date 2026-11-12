'use client'

import { CheckIcon, NoSymbolIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useLayoutEffect, useRef, useTransition } from 'react'

import { setEmailSubscriptionSpam } from '@/lib/email-subscriptions/actions'
import styles from '@/ui/email-subscriptions/subscribers.module.scss'
import { useToast } from '@/ui/toast/toast-context'

export function SpamToggle({
  id,
  email,
  isSpam,
  fallbackFocusId
}: {
  id: string
  email: string
  isSpam: boolean
  /** Focused when no row is left beside this one */
  fallbackFocusId: string
}) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  // set by a click, so only a toggled row's unmount moves focus
  const isToggledRef = useRef(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { addErrorMessage } = useToast()

  // a toggled row moves to another table once the refresh lands
  // (including after a lost response that saved), unmounting this
  // button; still in the DOM here, so its neighbours can be found
  useLayoutEffect(() => {
    const button = buttonRef.current
    return () => {
      if (isToggledRef.current) moveFocus(button, fallbackFocusId)
    }
  }, [fallbackFocusId])

  function toggle() {
    isToggledRef.current = true
    startTransition(async () => {
      let res
      try {
        res = await setEmailSubscriptionSpam(id, !isSpam)
      } catch {
        addErrorMessage('Failed to update subscriber.')
        // the change may have saved before the response was lost
        router.refresh()
        return
      }
      if (!res?.ok) {
        addErrorMessage(
          res?.message ?? 'Failed to update subscriber.'
        )
      }
      // an error may still have saved (a lost DB response comes back
      // as one), or found the row already gone, so refresh either
      // way and keep the focus intent for when the row moves; a row
      // that stays keeps its button, and moveFocus leaves focus the
      // user has since moved alone
      router.refresh()
    })
  }

  return (
    <button
      ref={buttonRef}
      type='button'
      className={`button-sm ${styles['row-button']}`}
      onClick={toggle}
      disabled={isPending}
      aria-label={`${isSpam ? 'Unmark spam' : 'Mark as spam'}: ${email}`}
    >
      {isSpam ? (
        <>
          <CheckIcon /> Unmark spam
        </>
      ) : (
        <>
          <NoSymbolIcon /> Mark as spam
        </>
      )}
    </button>
  )
}

function moveFocus(
  button: HTMLButtonElement | null,
  fallbackFocusId: string
) {
  // left alone if the user moved on while it saved; disabling the
  // button may have dropped focus to the body
  const active = document.activeElement
  if (active && active !== button && active !== document.body) {
    return
  }
  // skips a row whose own toggle is still saving
  const row = button?.closest('tr')
  const neighbor = [
    row?.nextElementSibling,
    row?.previousElementSibling
  ]
    .map((r) => r?.querySelector<HTMLButtonElement>('button:enabled'))
    .find(Boolean)
  ;(neighbor ?? document.getElementById(fallbackFocusId))?.focus()
}
