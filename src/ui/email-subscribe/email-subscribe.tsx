'use client'

import Cookies from 'js-cookie'
import {
  useEffect,
  useState
} from 'react'

import { createEmailSubscription } from '@/lib/email-subscriptions/actions'
import styles from '@/ui/email-subscribe/email-subscribe.module.scss'
import { Form } from '@/ui/form/form'
import { useToast } from '@/ui/toast/toast-context'

export function EmailSubscribe () {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { addSuccessMessage } = useToast()

  useEffect(() => {
    const cookie = Cookies.get('is_subscribed')
    setIsSubscribed(!!cookie)
  }, [])

  function onSuccess () {
    addSuccessMessage('Thank you for subscribing!')
    Cookies.set('is_subscribed', '1', { expires: 1 })
    setIsSubscribed(true)
  }

  if (!isSubscribed) {
    return (
      <>
        <Form
          className={styles['email-subscribe']}
          aria-describedby='email-subscribe'
          action={createEmailSubscription}
          onSuccess={onSuccess}
          submitButtonText='Subscribe'
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
            placeholder='Email address'
            required
            disabled={isSubscribed}
            aria-disabled={isSubscribed}
          />
        </Form>
      </>
    )
  } else {
    return null
  }
}
