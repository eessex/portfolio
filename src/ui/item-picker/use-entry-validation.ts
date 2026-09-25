import { useCallback, useRef, useState } from 'react'
import type { z } from 'zod'

import { normalizeFormData } from '@/lib/util'
import {
  isEntryExpanded,
  type ItemPickerEntry
} from '@/ui/item-picker/item-picker-entry'

export type FieldErrors = Record<string, string[] | undefined>

interface UseEntryValidationOptions {
  schema?: z.ZodTypeAny
  /**
   * The prefix an entry's fields are rendered with at `submitIndex`,
   * stripped when reading them back.
   */
  fieldPrefix: (submitIndex: number) => string
}

function isValidatable(
  el: Element
): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return 'willValidate' in el && 'checkValidity' in el
}

/** The first natively-invalid element in a fieldset, if any. */
function firstInvalidElement(fieldset: HTMLFieldSetElement) {
  return Array.from(fieldset.elements)
    .filter(isValidatable)
    .find((el) => el.willValidate && !el.checkValidity())
}

/** A fieldset's values keyed by field name, `prefix` stripped. */
export function collectEntryData(
  fieldset: HTMLFieldSetElement,
  prefix: string
): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  Array.from(fieldset.elements)
    .filter(isValidatable)
    .forEach((el) => {
      if (!el.name.startsWith(prefix)) return
      const field = el.name.slice(prefix.length)
      data[field] =
        el instanceof HTMLInputElement && el.type === 'checkbox'
          ? el.checked
          : el instanceof HTMLInputElement && el.type === 'file'
            ? el.files?.[0]
            : el.value
    })
  return data
}

export function findFileInput(
  fieldset: HTMLFieldSetElement
): HTMLInputElement | undefined {
  return Array.from(fieldset.elements).find(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type === 'file'
  )
}

/**
 * An expanded entry's schema + native-constraint validation, plus the
 * fieldset-ref map it reads from and the per-entry errors it produces.
 */
export function useEntryValidation({
  schema,
  fieldPrefix
}: UseEntryValidationOptions) {
  const [newEntryErrors, setNewEntryErrors] = useState<
    Record<string, FieldErrors>
  >({})
  const fieldsets = useRef(new Map<string, HTMLFieldSetElement>())

  function setFieldsetRef(
    tempId: string,
    el: HTMLFieldSetElement | null
  ) {
    if (el) fieldsets.current.set(tempId, el)
    else fieldsets.current.delete(tempId)
  }

  const getFieldset = useCallback(
    (tempId: string) => fieldsets.current.get(tempId),
    []
  )

  function clearErrors(...tempIds: string[]) {
    if (tempIds.length === 0) return
    setNewEntryErrors((current) => {
      const next = { ...current }
      tempIds.forEach((id) => delete next[id])
      return next
    })
  }

  /**
   * Validates an expanded entry, updating `newEntryErrors` with Zod
   * errors. Always valid (a no-op) for item types (e.g. `images`) whose
   * schema needs data not yet available client-side.
   * Moves focus to the first invalid field when blocking progress
   * (adding another entry). Omitted for the quieter blur-triggered
   * check, which shouldn't fight the user's own tab navigation.
   */
  function validateNewEntry<TEmbeddedItem, TPage>(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number,
    options: { focus?: boolean } = {}
  ): boolean {
    if (!isEntryExpanded(entry) || !schema) return true
    const fieldset = fieldsets.current.get(entry.tempId)
    if (!fieldset) return true

    const prefix = fieldPrefix(submitIndex)
    const parsed = schema.safeParse(
      normalizeFormData(collectEntryData(fieldset, prefix))
    )

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as FieldErrors
      setNewEntryErrors((current) => ({
        ...current,
        [entry.tempId]: fieldErrors
      }))
      if (options.focus) {
        const firstField = Object.keys(fieldErrors)[0]
        const invalidEl = firstField
          ? fieldset.elements.namedItem(`${prefix}${firstField}`)
          : null
        if (invalidEl instanceof HTMLElement) invalidEl.focus()
      }
      return false
    }

    if (entry.tempId in newEntryErrors) clearErrors(entry.tempId)
    return true
  }

  /**
   * Runs native `required`/`type` constraints (the only signal for
   * fields a schema can't see yet, e.g. embed codes' `iframe`
   * textarea, which isn't itself a schema field — only the
   * `host`/`src`/`type` parsed from it are) then `validateNewEntry` —
   * the full validate-and-focus sequence shared by collapsing open
   * entries on adding another (`saveOpenNewEntries`) and an explicit
   * Save.
   */
  function validateEntryStrict<TEmbeddedItem, TPage>(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isEntryExpanded(entry)) return true
    const fieldset = fieldsets.current.get(entry.tempId)
    if (!fieldset) return true

    const invalid = firstInvalidElement(fieldset)
    if (invalid) {
      invalid.reportValidity()
      return false
    }

    return validateNewEntry(entry, submitIndex, { focus: true })
  }

  /**
   * Whether an expanded entry passes native + schema validation
   * *without* reporting or focusing — used to decide collapse-vs-discard
   * when the user toggles back to search (a mode switch shouldn't nag
   * with validation bubbles the way an explicit Save does).
   */
  function isEntryComplete<TEmbeddedItem, TPage>(
    entry: ItemPickerEntry<TEmbeddedItem, TPage>,
    submitIndex: number
  ): boolean {
    if (!isEntryExpanded(entry)) return true
    const fieldset = fieldsets.current.get(entry.tempId)
    if (!fieldset) return false
    if (firstInvalidElement(fieldset)) return false
    return validateNewEntry(entry, submitIndex)
  }

  return {
    newEntryErrors,
    clearErrors,
    validateNewEntry,
    validateEntryStrict,
    isEntryComplete,
    setFieldsetRef,
    getFieldset
  }
}
