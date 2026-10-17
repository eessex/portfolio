'use client'

import { type RefObject, useEffect, useRef } from 'react'

/**
 * Opens a `<dialog>` with `showModal()` for as long as it's mounted:
 * the browser makes the rest of the page inert (trapping focus) and
 * fires `cancel` on Esc, which calls `onClose`. Focuses
 * `initialFocusRef` (else the browser's first focusable), locks page
 * scroll, and returns focus to the opener on unmount.
 */
export function useModalDialog({
  onClose,
  initialFocusRef
}: {
  onClose: () => void
  initialFocusRef?: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDialogElement>(null)

  // latest onClose, without resubscribing
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const opener = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    // React's autoFocus runs before showModal, while it's unfocusable
    initialFocusRef?.current?.focus()

    // the parent owns open state, so Esc asks it to unmount us
    function handleCancel(event: Event) {
      event.preventDefault()
      onCloseRef.current()
    }
    dialog.addEventListener('cancel', handleCancel)

    return () => {
      dialog.removeEventListener('cancel', handleCancel)
      dialog.close()
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [initialFocusRef])

  return ref
}
