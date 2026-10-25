import type { FocusEvent, ReactNode } from 'react'
import { useId, useLayoutEffect, useRef, useState } from 'react'

/**
 * Whether every control a user fills in is empty. Hidden inputs
 * (bookkeeping fields) and controls in a hidden part of the details
 * (e.g. a select that doesn't apply) don't count.
 */
function isDetailsEmpty(fieldset: HTMLFieldSetElement): boolean {
  const controls = fieldset.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >('input:not([type="hidden"]), select, textarea')
  for (const control of controls) {
    const hiddenAncestor = control.closest('[hidden]')
    if (
      hiddenAncestor &&
      hiddenAncestor !== fieldset &&
      fieldset.contains(hiddenAncestor)
    ) {
      continue
    }
    if (
      control instanceof HTMLInputElement &&
      control.type === 'checkbox'
    ) {
      if (control.checked) return false
    } else if (control.value.trim() !== '') {
      return false
    }
  }
  return true
}

export interface Disclosure {
  /** For the main field's `aria-controls`. */
  id: string
  /** For the main field's `aria-expanded`, `required`, etc. */
  isExpanded: boolean
  setFieldset: (fieldset: HTMLFieldSetElement | null) => void
  onBlur: (event: FocusEvent<HTMLFieldSetElement>) => void
}

/**
 * State for a progressive-disclosure form: the details open once the
 * main field resolves (`isRevealed`: a parsed file, iframe or url).
 * With `isKeptWithContent`, details that have content stay open after
 * the main field is cleared, until they're emptied and left.
 */
export function useDisclosureDetails({
  isRevealed,
  isKeptWithContent = false
}: {
  isRevealed: boolean
  isKeptWithContent?: boolean
}): Disclosure {
  const id = useId()
  const [fieldset, setFieldset] =
    useState<HTMLFieldSetElement | null>(null)
  const [isKept, setIsKept] = useState(false)
  const wasRevealed = useRef(isRevealed)

  // before paint, so details with content don't flash closed
  useLayoutEffect(() => {
    if (
      isKeptWithContent &&
      wasRevealed.current &&
      !isRevealed &&
      fieldset
    ) {
      setIsKept(!isDetailsEmpty(fieldset))
    }
    wasRevealed.current = isRevealed
  }, [isRevealed, isKeptWithContent, fieldset])

  function onBlur(event: FocusEvent<HTMLFieldSetElement>) {
    if (!isRevealed && isDetailsEmpty(event.currentTarget)) {
      setIsKept(false)
    }
  }

  return {
    id,
    isExpanded: isRevealed || isKept,
    setFieldset,
    onBlur
  }
}

/**
 * A progressive-disclosure form's secondary fields, hidden until its
 * main field resolves (see `useDisclosureDetails`). An item picker
 * boxes its draft while these show (`item-picker.module.scss`).
 */
export function DisclosureDetails({
  children,
  id,
  isExpanded,
  legend,
  onBlur,
  setFieldset
}: Disclosure & {
  children: ReactNode
  legend: string
}) {
  return (
    <fieldset
      ref={setFieldset}
      id={id}
      hidden={!isExpanded}
      className='disclosure-details'
      onBlur={onBlur}
    >
      <legend className='visually-hidden'>{legend}</legend>
      {children}
    </fieldset>
  )
}
