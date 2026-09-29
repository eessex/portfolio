'use client'

import { useRouter } from 'next/navigation'
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import type { FormResponse } from '@/lib/types'
import { Dialog } from '@/ui/dialog/dialog'
import styles from '@/ui/form/form.module.scss'
import { useToast } from '@/ui/toast/toast-context'

type FormFieldErrors =
  | Record<string, string[] | undefined>
  | undefined

const OPERATION_CANCELLED_MESSAGE =
  'Operation was cancelled by the user.'

const FormErrorsContext = createContext<FormFieldErrors>(undefined)

export function useFormErrors() {
  return useContext(FormErrorsContext)
}

export function Form<T>({
  action,
  children,
  className,
  confirmUnsavedChanges = true,
  onSuccess,
  submitButtonText,
  submitButtonClassName
}: {
  action: (formData: FormData) => Promise<FormResponse<T>>
  children: React.ReactNode
  className?: string
  /**
   * Warn before in-app navigation when the form has unsaved changes.
   * Disable for forms where losing in-progress input isn't costly
   * enough to be worth interrupting navigation (e.g. login, email
   * subscribe).
   */
  confirmUnsavedChanges?: boolean
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

  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!confirmUnsavedChanges) return

    function handleClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }

      const anchor = (event.target as HTMLElement)?.closest?.(
        'a[href]'
      ) as HTMLAnchorElement | null
      if (!anchor || anchor.target === '_blank') return

      const url = new URL(anchor.href, window.location.href)
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      ) {
        return
      }

      if (!formRef.current || !initialState) return
      const current = new FormData(formRef.current)
      if (!isFormDirty(current, initialState)) return

      event.preventDefault()
      event.stopPropagation()
      setPendingHref(anchor.href)
    }

    document.addEventListener('click', handleClick, true)
    return () =>
      document.removeEventListener('click', handleClick, true)
  }, [confirmUnsavedChanges, initialState])

  useEffect(() => {
    if (!confirmUnsavedChanges) return

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!formRef.current || !initialState) return
      const current = new FormData(formRef.current)
      if (!isFormDirty(current, initialState)) return

      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () =>
      window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [confirmUnsavedChanges, initialState])

  const [state, formAction, isPending] = useActionState<
    FormResponse<T> | null,
    FormData
  >(onSubmit, null)

  // prevent reload
  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    startTransition(() => formAction(formData))
  }

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
        if (res?.message === OPERATION_CANCELLED_MESSAGE) {
          console.info(OPERATION_CANCELLED_MESSAGE)
          return prevState
        }
        if (!hasFieldErrors(res?.errors)) {
          const message =
            res?.message || 'Failed to save changes, try again.'
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
    <>
      <form
        className={className || styles.form}
        onSubmit={handleSubmit}
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

      {pendingHref && (
        <Dialog
          title='Discard unsaved changes?'
          cancelButtonText='Stay on this page'
          confirmButtonText='Leave without saving'
          onConfirm={() => {
            const href = pendingHref
            setPendingHref(null)
            router.push(href)
          }}
          onClose={() => setPendingHref(null)}
        >
          <p>You have unsaved changes, leaving will discard them.</p>
        </Dialog>
      )}
    </>
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
