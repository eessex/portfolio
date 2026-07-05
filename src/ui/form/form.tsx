'use client'

import {
  createContext,
  useActionState,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import type { FormResponse } from '@/lib/types'
import { DashboardErrrorMessages } from '@/ui/dashboard/dashboard-items'
import styles from '@/ui/form/form.module.scss'
import { useToast } from '@/ui/toast/toast-context'

type FormFieldErrors =
  | Record<string, string[] | undefined>
  | undefined

const FormErrorsContext = createContext<FormFieldErrors>(undefined)

export function useFormErrors() {
  return useContext(FormErrorsContext)
}

export function Form<T>({
  action,
  children,
  className,
  onSuccess,
  submitButtonText,
  submitButtonClassName
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  children: React.ReactNode
  className?: string
  onSuccess?: () => void
  submitButtonText?: string
  submitButtonClassName?: string
}) {
  const [initialState, setInitialState] = useState<FormData | null>(
    null
  )
  const formRef = useRef(null)
  const { addErrorMessage, addSuccessMessage } = useToast()

  useEffect(() => {
    if (formRef.current && !initialState) {
      const formData = new FormData(formRef.current)
      setInitialState(formData)
    }
  }, [formRef, initialState])

  const [state, formAction, isPending] = useActionState<
    FormResponse<T> | null,
    FormData
  >(onSubmit, null)

  async function onSubmit(
    prevState: FormResponse<T> | null,
    formData: FormData
  ) {
    if (isPending) return prevState

    const isDirty = isFormDirty(formData, initialState)

    if (!isDirty) {
      if (onSuccess) {
        onSuccess()
      } else {
        addSuccessMessage('Changes saved.')
        console.info('No changes made.')
      }
      return null
    }

    try {
      const res = await action(formData)
      if (!res || !res.ok) {
        if (
          res?.message === DashboardErrrorMessages.OperationCancelled
        ) {
          console.info(DashboardErrrorMessages.OperationCancelled)
          return prevState
        }
        if (!hasFieldErrors(res?.errors)) {
          const message =
            res?.message || DashboardErrrorMessages.FailedToSave
          addErrorMessage(message)
        }
        return res ?? null
      }
      if (onSuccess) {
        onSuccess()
      } else {
        addSuccessMessage('Changes saved.')
      }
      setInitialState(formData)
      return null
    } catch (error) {
      const message =
        (error as Error)?.message ||
        'An error occurred, please try again.'
      // Handle case where error is thrown to trigger redirect in Next.js action
      if (message === 'NEXT_REDIRECT') {
        addSuccessMessage('Success! Redirecting...')
      } else {
        addErrorMessage(message)
      }
      return null
    }
  }

  return (
    <form
      className={className || styles.form}
      action={formAction}
      ref={formRef}
    >
      <FormErrorsContext.Provider
        value={state?.errors as FormFieldErrors}
      >
        {children}
      </FormErrorsContext.Provider>

      <button
        className={submitButtonClassName || ''}
        type='submit'
        disabled={isPending}
      >
        {isPending ? 'Loading...' : submitButtonText || 'Save'}
      </button>
    </form>
  )
}

function hasFieldErrors(
  errors: Record<string, string[] | undefined> | string[] | undefined
): boolean {
  if (!errors) return false
  if (Array.isArray(errors)) return errors.length > 0
  return Object.values(errors).some(
    (fieldErrors) => fieldErrors?.length
  )
}

function isFormDirty(
  current: FormData,
  initial?: FormData | null
): boolean {
  if (!initial) return true

  const currentObj = Object.fromEntries(current.entries())
  const initialObj = Object.fromEntries(initial.entries())

  const nonFileDiff =
    JSON.stringify({
      ...currentObj,
      file: undefined
    }) !==
    JSON.stringify({
      ...initialObj,
      file: undefined
    })

  if (nonFileDiff) return true

  // File comparison
  const currentFile = current.get('file') as File | null
  const initialFile = initial.get('file') as File | null

  if (
    (currentFile && !initialFile) ||
    (!currentFile && initialFile) ||
    (currentFile &&
      initialFile &&
      currentFile.name !== initialFile.name)
  ) {
    return true
  }

  return false
}
