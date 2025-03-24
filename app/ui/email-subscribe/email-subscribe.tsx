'use client'

import { useActionState, useState } from 'react'
import { Toast } from '@/ui/toast/toast'
import { createEmailSubscription } from '@/lib/actions'
import styles from '@/ui/email-subscribe/email-subscribe.module.scss'

export default function EmailSubscribe () {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [errorMessage, formAction, isPending] = useActionState(
    onSubscribe,
    null
  )

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

  function SubmitButton () {
    return (
      <button type='submit' disabled={isPending}>
        {isPending ? 'Loading...' : 'Submit'}
      </button>
    )
  }

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
        />
        <SubmitButton />
      </form>

      {(error || errorMessage) && (
        <Toast type='error' onHide={() => setError(false)} />
      )}
      {success && (
        <Toast type='success' onHide={() => setSuccess(false)}>
          Thank you for subscribing!
        </Toast>
      )}
    </>
  )
}
