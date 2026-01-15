'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState
} from 'react'

import type { FormResponse } from '@/lib/types'
import styles from '@/ui/form/form.module.scss'
import { useToast } from '@/ui/toast/toast-context'

export function Form<T> ({
  action,
  children,
  className,
  onSuccess,
  submitButtonText
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  children: React.ReactNode
  className?: string
  onSuccess?: () => void
  submitButtonText?: string
}) {
  const [initialState, setInitialState] = useState<FormData | null>(null)
  const formRef = useRef(null)
  const {
    addErrorMessage,
    addSuccessMessage
  } = useToast()

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
    if (isPending) return

    const isDirty = isFormDirty(formData, initialState)

    if (!isDirty) {
      if (onSuccess) {
        onSuccess()
      } else {
        addSuccessMessage('Changes saved.')
        console.info('No changes made.')
      }
      return
    }

    try {
      await action(formData)
      if (onSuccess) {
        onSuccess()
      } else {
        addSuccessMessage('Changes saved.')
      }
      setInitialState(formData)
    } catch (error) {
      addErrorMessage((error as Error)?.message || 'An error occurred, please try again.')
      console.debug(error)
    }
  }

  return (
    <form
      className={`${className || styles.form}`}
      action={formAction}
      ref={formRef}
    >
      {children}

      <button
        className='button'
        type='submit'
      >
        {isPending ? 'Loading...' : submitButtonText || 'Save'}
      </button>
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
