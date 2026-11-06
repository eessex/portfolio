'use client'

import { useId } from 'react'

import { createEmailSubscription } from '@/lib/email-subscriptions/actions'
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
          action={createEmailSubscription}
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
            name='contact_preference'
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
