import { useCallback, useRef, useState } from 'react'
import type { z } from 'zod'

import { normalizeFormData } from '@/lib/util'

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
function collectEntryData(
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

function findFileInput(
  fieldset: HTMLFieldSetElement
): HTMLInputElement | undefined {
  return Array.from(fieldset.elements).find(
    (el): el is HTMLInputElement =>
      el instanceof HTMLInputElement && el.type === 'file'
  )
}

/**
 * A draft's schema + native-constraint validation, plus the
 * fieldset-ref map it reads from and the per-entry errors it produces.
 */
export function useEntryValidation({
  schema,
  fieldPrefix
}: UseEntryValidationOptions) {
  const [draftErrors, setDraftErrors] = useState<
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
    setDraftErrors((current) => {
      const next = { ...current }
      tempIds.forEach((id) => delete next[id])
      return next
    })
  }

  /**
   * Parses a draft's fieldset against `schema` without
   * touching state. `undefined` when there's nothing to parse: no
   * schema (e.g. `images`, whose schema needs data not yet available
   * client-side) or no mounted fieldset.
   */
  function parseEntry(tempId: string, submitIndex: number) {
    if (!schema) return undefined

    const fieldset = fieldsets.current.get(tempId)
    if (!fieldset) return undefined

    const prefix = fieldPrefix(submitIndex)
    const parsed = schema.safeParse(
      normalizeFormData(collectEntryData(fieldset, prefix))
    )
    return { parsed, fieldset, prefix }
  }

  /**
   * Validates a draft, updating `draftErrors` with Zod
   * errors. Always valid when `parseEntry` has nothing to parse.
   * Moves focus to the first invalid field when blocking progress
   * (adding another entry). Omitted for the quieter blur-triggered
   * check, which shouldn't fight the user's own tab navigation.
   */
  function validateDraft(
    tempId: string,
    submitIndex: number,
    options: { focus?: boolean } = {}
  ): boolean {
    const result = parseEntry(tempId, submitIndex)
    if (!result) return true

    const { parsed, fieldset, prefix } = result

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as FieldErrors
      setDraftErrors((current) => ({
        ...current,
        [tempId]: fieldErrors
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

    if (tempId in draftErrors) clearErrors(tempId)
    return true
  }

  /**
   * Runs native `required`/`type` constraints (the only signal for
   * fields a schema can't see yet, e.g. embed codes' `iframe`
   * textarea, which isn't itself a schema field — only the
   * `host`/`src`/`type` parsed from it are) then `validateDraft` —
   * the full validate-and-focus sequence shared by collapsing open
   * entries on opening another (`closeOpenDrafts`) and an explicit
   * Save.
   */
  function validateEntryStrict(
    tempId: string,
    submitIndex: number
  ): boolean {
    const fieldset = fieldsets.current.get(tempId)
    if (!fieldset) return true

    const invalid = firstInvalidElement(fieldset)
    if (invalid) {
      invalid.reportValidity()
      return false
    }

    return validateDraft(tempId, submitIndex, { focus: true })
  }

  /**
   * Whether the user has entered anything: a picked file or non-blank
   * text. Read from the DOM rather than `isTouched`, which misses
   * values seeded without a change event (e.g. a search query).
   * Selects/checkboxes/hidden inputs are skipped — they carry defaults.
   */
  function hasEntryContent(tempId: string): boolean {
    const fieldset = fieldsets.current.get(tempId)
    if (!fieldset) return false
    return Array.from(fieldset.elements).some((el) => {
      if (el instanceof HTMLTextAreaElement) return !!el.value.trim()
      if (!(el instanceof HTMLInputElement)) return false
      if (el.type === 'file') return !!el.files?.length
      if (['hidden', 'checkbox', 'radio'].includes(el.type))
        return false
      return !!el.value.trim()
    })
  }

  /**
   * An entry's current fieldset values (collected + normalized, the
   * same way validation reads them) and picked file, for its saved chip
   * to render from.
   */
  function readEntryValues(tempId: string, submitIndex: number) {
    const fieldset = fieldsets.current.get(tempId)
    if (!fieldset) return { summaryData: {} }
    return {
      summaryData: normalizeFormData(
        collectEntryData(fieldset, fieldPrefix(submitIndex))
      ),
      file: findFileInput(fieldset)?.files?.[0]
    }
  }

  return {
    draftErrors,
    clearErrors,
    validateDraft,
    validateEntryStrict,
    readEntryValues,
    hasEntryContent,
    setFieldsetRef,
    getFieldset
  }
}
