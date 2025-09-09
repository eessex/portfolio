'use client'

import { useActionState } from 'react'
import { authenticate } from '@/lib/users/actions'
import { TextBanner } from '@/ui/text-banner/text-banner'
import styles from '@/ui/form/form.module.scss'

export default function LoginForm () {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  )

  function SubmitButton () {
    return (
      <button className='button' type='submit' disabled={isPending}>
        {isPending ? 'Loading...' : 'Log in'}
      </button>
    )
  }

  return (
    <form action={formAction} className={styles.form}>
      <div>
        <label htmlFor='email'>
          Email
        </label>
        <input
          id='email'
          type='email'
          name='email'
          required
        />
      </div>

      <div>
        <label htmlFor='password'>
          Password
        </label>
        <input
          id='password'
          type='password'
          name='password'
          required
        />
      </div>

      <input type='hidden' name='redirectTo' value='/' />

      <SubmitButton />

      {errorMessage && !isPending && (
        <TextBanner type='error' />
      )}
    </form>
  )
}
