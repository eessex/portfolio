'use client'

import { useEffect, useId, useRef } from 'react'

import {
  ELAPSED_FIELD,
  HONEYPOT_FIELD,
  MIN_ELAPSED_MS
} from '@/lib/email-subscriptions/form-fields'
import { SUBSCRIBE_API_PATH } from '@/lib/email-subscriptions/paths'
import type { FormResponse } from '@/lib/types'
import styles from '@/ui/email-subscribe/email-subscribe.module.scss'
import {
  markSubscribed,
  useIsSubscribed
} from '@/ui/email-subscribe/use-is-subscribed'
import { Form } from '@/ui/form/form'
import { useToast } from '@/ui/toast/toast-context'

export function EmailSubscribe({
  label,
  labelClassName
}: {
  /** Names a group around the form; hide it with labelClassName */
  label: string
  labelClassName?: string
}) {
  const isSubscribed = useIsSubscribed()
  const { addSuccessMessage } = useToast()
  // unique, since the mobile Menu tray repeats the footer's form
  const id = useId()
  const descriptionId = `${id}-description`
  const emailId = `${id}-email`
  const labelId = `${id}-label`
  const renderedAt = useRef<number | null>(null)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  // a route, not a server action, so BotID can guard it
  async function subscribe(
    formData: FormData
  ): Promise<FormResponse<never>> {
    // a fast human (e.g. autofill) would otherwise be dropped as a bot
    const startedAt = renderedAt.current ?? Date.now()
    const wait = MIN_ELAPSED_MS - (Date.now() - startedAt)
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait))
    }
    formData.set(ELAPSED_FIELD, String(Date.now() - startedAt))
    try {
      const res = await fetch(SUBSCRIBE_API_PATH, {
        method: 'POST',
        body: formData
      })
      return (await res.json()) as FormResponse<never>
    } catch {
      return { ok: false, message: 'Failed to subscribe, try again.' }
    }
  }

  function onSuccess() {
    addSuccessMessage('Thank you for subscribing!')
    markSubscribed()
  }

  if (!isSubscribed) {
    return (
      <div role='group' aria-labelledby={labelId}>
        <span id={labelId} className={labelClassName}>
          {label}
        </span>
        <Form
          className={styles['email-subscribe']}
          aria-describedby={descriptionId}
          action={subscribe}
          isUnsavedChangesConfirmed={false}
          onSuccess={onSuccess}
          submitButtonText='Subscribe'
          submitButtonClassName=''
        >
          <p id={descriptionId} className='visually-hidden'>
            Subscribe to irregular updates
          </p>
          <label htmlFor={emailId} className='visually-hidden'>
            Email address
          </label>
          {/* bot field with nonsense name - browser autofill ignores */}
          <input
            type='text'
            name={HONEYPOT_FIELD}
            className='visually-hidden'
            tabIndex={-1}
            autoComplete='off'
            aria-hidden='true'
          />
          <input
            id={emailId}
            type='email'
            name='email'
            placeholder='Email address'
            required
            disabled={isSubscribed}
            aria-disabled={isSubscribed}
          />
        </Form>
      </div>
    )
  } else {
    return null
  }
}
