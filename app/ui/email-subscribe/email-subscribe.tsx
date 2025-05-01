'use client'

import { createEmailSubscription } from '@/lib/actions'
import styles from '@/ui/email-subscribe/email-subscribe.module.scss'
import { Toast } from '@/ui/toast/toast'
import Cookies from 'js-cookie'
import { useActionState, useEffect, useState } from 'react'

export default function EmailSubscribe () {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [errorMessage, formAction, isPending] = useActionState(onSubscribe, null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const cookie = Cookies.get('is_subscribed')
    setIsSubscribed(!!cookie)
  }, [])

  async function onSubscribe (_state: void | null, payload: FormData) {
    setError(false)
    try {
      await createEmailSubscription(payload.get('email') as string)
      setSuccess(true)
    } catch (error) {
      setError(true)
      console.info(error)
    }
  }

  function onHideSuccess () {
    setSuccess(false)
    Cookies.set('is_subscribed', '1', { expires: 1 })
    setIsSubscribed(true)
  }

  function SubmitButton () {
    return (
      <button type='submit' disabled={isPending}>
        {isPending ? 'Loading...' : 'Subscribe'}
      </button>
    )
  }

  if (!isSubscribed) {
    return (
      <>
        <form
          className={styles['email-subscribe']}
          aria-describedby='email-subscribe'
          action={formAction}
        >
          <p
            id='email-subscribe'
            className='visually-hidden'
          >
            Subscribe to irregular updates
          </p>
          <label
            htmlFor='email'
            className='visually-hidden'
          >
            Email address
          </label>
          <input
            id='email'
            type='email'
            name='email'
            placeholder='email'
            required
            disabled={isPending || success}
            aria-disabled={isPending || success}
          />
          <SubmitButton />
        </form>

        {(error || errorMessage) && (
          <Toast type='error' onHide={() => setError(false)} />
        )}
        {success && (
          <Toast type='success' onHide={onHideSuccess}>
            Thank you for subscribing!
          </Toast>
        )}
      </>
    )
  } else {
    return null
  }
}
