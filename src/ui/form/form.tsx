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

import {
  formatMegabytes,
  MAX_UPLOAD_REQUEST_SIZE,
  newFilesSize
} from '@/lib/images/util'
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
  isUnsavedChangesConfirmed = true,
  isSubmittedUnchanged = false,
  onSuccess,
  submitButtonText,
  submitButtonClassName = 'button-lg button-primary'
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
  isUnsavedChangesConfirmed?: boolean
  /** Submit even when unchanged, for actions that return new data */
  isSubmittedUnchanged?: boolean
  /** Receives the action's `res` (none when nothing changed) */
  onSuccess?: (res?: T) => void
  submitButtonText?: string
  /** Defaults to the large primary button; pass `''` for none. */
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
    if (!isUnsavedChangesConfirmed) return

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
      // Immediate: every Form listens on document, so with several
      // dirty forms on a page only the first opens a dialog
      event.stopImmediatePropagation()
      setPendingHref(anchor.href)
    }

    document.addEventListener('click', handleClick, true)
    return () =>
      document.removeEventListener('click', handleClick, true)
  }, [isUnsavedChangesConfirmed, initialState])

  useEffect(() => {
    if (!isUnsavedChangesConfirmed) return

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
  }, [isUnsavedChangesConfirmed, initialState])

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

    const filesSize = newFilesSize(formData)
    if (filesSize > MAX_UPLOAD_REQUEST_SIZE) {
      addErrorMessage(
        `New images in this form total ${formatMegabytes(filesSize)}, over the ${formatMegabytes(MAX_UPLOAD_REQUEST_SIZE)} one save can take. Save fewer at a time, then add the rest.`
      )
      return prevState
    }

    if (!isDirty && !isSubmittedUnchanged) {
      if (onSuccess) {
        onSuccess()
      } else {
        addSuccessMessage('No changes to save.')
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
        onSuccess(res.res)
      } else {
        addSuccessMessage('Changes saved.')
      }
      setInitialState(formData)
      return null
    } catch (error) {
      const message =
        (error as Error)?.message ||
        'An error occurred, please try again.'
      // A server action that redirects (e.g. a successful login)
      // rejects with Next's redirect error after navigating, so it's
      // a success here, not a failure to report
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
          className={submitButtonClassName || undefined}
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
  return serializeFormData(current) !== serializeFormData(initial)
}

// Every entry in order, so repeated names and namespaced file inputs
// (`iconImage.file`) count; JSON.stringify(File) is just `{}`
function serializeFormData(formData: FormData): string {
  return JSON.stringify(
    [...formData.entries()].map(([name, value]) => [
      name,
      typeof value === 'string'
        ? value
        : [value.name, value.size, value.lastModified]
    ])
  )
}
