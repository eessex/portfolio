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

import { DashboardErrrorMessages } from '../dashboard/dashboard-items'

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
    const isDirty = isFormDirty(formData, initialState)
    setError(false)

    if (!isDirty) {
      setSuccess(true)
      console.info('No changes made.')
      return
    }

    try {
      const res = await action(formData)
      if (!res || !res.ok) {
        if (res?.message === DashboardErrrorMessages.OperationCancelled) {
          console.info(DashboardErrrorMessages.OperationCancelled)
          return
        }
        const message = res?.message || DashboardErrrorMessages.FailedToSave
        throw new Error(`Save failed: ${message}`)
      }
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

function isFormDirty (current: FormData, initial?: FormData | null): boolean {
  if (!initial) return true

  const currentObj = Object.fromEntries(current.entries())
  const initialObj = Object.fromEntries(initial.entries())

  const nonFileDiff =
    JSON.stringify({
      ...currentObj, file: undefined
    }) !==
    JSON.stringify({
      ...initialObj, file: undefined
    })

  if (nonFileDiff) return true

  // File comparison
  const currentFile = current.get('file') as File | null
  const initialFile = initial.get('file') as File | null

  if (
    (currentFile && !initialFile) ||
    (!currentFile && initialFile) ||
    (currentFile && initialFile && currentFile.name !== initialFile.name)
  ) {
    return true
  }

  return false
}
