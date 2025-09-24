'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState
} from 'react'

import type { FormResponse } from '@/lib/types'
import styles from '@/ui/form/form.module.scss'
import { Toast } from '@/ui/toast/toast'

export function Form<T> ({
  action,
  children
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  children: React.ReactNode
}) {
  const [error, setError] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [initialState, setInitialState] = useState<FormData | null>(null)
  const formRef = useRef(null)

  useEffect(() => {
    if (formRef.current && !initialState) {
      const formData = new FormData(formRef.current)
      setInitialState(formData)
    }
  }, [formRef, initialState])

  const [_state, formAction, isPending] = useActionState(
    onSubmit,
    null
  )

  async function onSubmit (_state: void | null, formData: FormData) {
    const current = Object.fromEntries(formData.entries())
    const initial = Object.fromEntries(initialState?.entries() || [])
    const isDirty = JSON.stringify(current) !== JSON.stringify(initial)
    setError(false)

    if (!isDirty) {
      setSuccess(true)
      console.info('No changes made.')
      return
    }

    try {
      await action(formData)
      setSuccess(true)
      setInitialState(formData)
      console.info('Changes saved.')
    } catch (error) {
      setError(true)
      console.error(error)
    }
  }

  return (
    <form
      className={styles.form}
      action={formAction}
      ref={formRef}
    >
      {children}

      <button
        className='button'
        type='submit'
        disabled={isPending}
      >
        {isPending ? 'Loading...' : 'Save'}
      </button>

      {error && !isPending && (
        <Toast
          type='error'
          onHide={() => setError(false)}
        />
      )}

      {success && !isPending && (
        <Toast
          type='success'
          onHide={() => setSuccess(false)}
        >
          Changes saved.
        </Toast>
      )}
    </form>
  )
}
