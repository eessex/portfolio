'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { useRef, useState } from 'react'

import { type Contact, contactSchema } from '@/lib/schemas/fields'
import { normalizeFormData } from '@/lib/util'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import { ItemResultLabel } from '@/ui/item-result-label'
import selectedResultStyles from '@/ui/selected-results/selected-results.module.scss'

type FieldErrors = Record<string, string[] | undefined>

interface ContactRow {
  key: string
  kind: 'editing' | 'saved'
  contact?: Contact
}

/**
 * Repeatable editor for a project's `contactInfo`, laid out like
 * `ItemPicker`: a saved row renders as a compact `ItemResultLabel` chip
 * (title/subtitle + round remove button, `selected-result` card
 * styling) via the same components/classes `ItemPicker` uses for its
 * existing items; an unsaved row renders as an open fieldset (mirrors
 * `ItemPicker`'s new-slot fieldset) with a `Save` action, since —
 * unlike an `ItemPicker` item — a contact has no id or its own create
 * endpoint to commit it. `Cancel` joins `Save` once the row has
 * content to discard (`filledRowKeys`); an untouched row has nothing
 * to cancel.
 *
 * `contactInfo[i].title` / `contactInfo[i].contact` inputs (hidden once
 * saved, visible while editing) are what the server reconstructs via
 * `extractIndexedGroups(data, 'contactInfo')`; a bare `contactInfo[]`
 * marker is always present so an emptied list is submitted (and
 * cleared) rather than omitted. Rows are keyed by a stable id, so
 * removing one preserves the others' values even as their bracket
 * indices shift.
 *
 * `Save` is a client-only convenience that collapses a row once it's
 * valid — the whole project form's own submit still includes an
 * open row's current values either way (nothing is lost by skipping
 * it), and the server drops a row with no `contact` regardless. Like
 * `ItemPicker`, adding another row is blocked while an open one is
 * still incomplete or invalid (see `focusInvalidRow`).
 *
 * "Add contact" only appears once a saved row exists — before that,
 * the open row is itself the add flow. `removeRow` keeps this from
 * dead-ending: emptying the list (cancelling the only open row, or
 * removing the only saved one) reseeds a fresh open row rather than
 * leaving both the button and every row absent.
 */
export function ContactInfoFields({
  contactInfo
}: {
  contactInfo?: Contact[]
}) {
  // Seeded past the initial rows so keys minted by `addRow` never collide.
  const nextKey = useRef(Math.max(1, (contactInfo ?? []).length))
  const [rows, setRows] = useState<ContactRow[]>(() =>
    contactInfo?.length
      ? contactInfo.map((contact, index) => ({
          key: `contact-${index}`,
          kind: 'saved' as const,
          contact
        }))
      : // Nothing saved yet — show the form itself rather than
        // making the user click "Add contact" first.
        [{ key: 'contact-0', kind: 'editing' as const }]
  )
  const [rowErrors, setRowErrors] = useState<
    Record<string, FieldErrors>
  >({})
  // Editing rows with a title or contact typed in — `contact` is only
  // HTML `required` once there's something to lose, so an untouched
  // placeholder row doesn't block saving the rest of the (optional)
  // section.
  const [filledRowKeys, setFilledRowKeys] = useState<Set<string>>(
    new Set()
  )
  const rowFieldsets = useRef(new Map<string, HTMLFieldSetElement>())

  function setRowFieldsetRef(
    key: string,
    el: HTMLFieldSetElement | null
  ) {
    if (el) rowFieldsets.current.set(key, el)
    else rowFieldsets.current.delete(key)
  }

  function isValidatable(
    el: Element
  ): el is HTMLInputElement | HTMLTextAreaElement {
    return 'willValidate' in el && 'checkValidity' in el
  }

  function updateFilledState(key: string) {
    const fieldset = rowFieldsets.current.get(key)
    if (!fieldset) return
    const hasContent = Array.from(fieldset.elements)
      .filter(isValidatable)
      .some((el) => el.value.trim() !== '')

    setFilledRowKeys((current) => {
      if (current.has(key) === hasContent) return current
      const next = new Set(current)
      if (hasContent) next.add(key)
      else next.delete(key)
      return next
    })
  }

  /**
   * Reads a row's inputs back into the flat `{title, contact}` shape its
   * schema expects, stripping the `contactInfo[${index}].` bracket prefix
   * they're rendered with (mirrors `extractIndexedGroups`, which strips
   * the same prefix server-side).
   */
  function collectRowData(
    fieldset: HTMLFieldSetElement,
    prefix: string
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    Array.from(fieldset.elements)
      .filter(isValidatable)
      .forEach((el) => {
        if (!el.name.startsWith(prefix)) return
        data[el.name.slice(prefix.length)] = el.value
      })
    return data
  }

  /**
   * Runs `contactSchema` against an editing row's current values,
   * updating `rowErrors` with real Zod messages and returning the
   * parsed `Contact` on success (used by `saveRow` to commit it) or
   * `undefined` on failure. `focus` additionally moves focus to the
   * first invalid field — used when blocking progress (adding another
   * row, or trying to save this one).
   */
  function validateRow(
    index: number,
    row: ContactRow,
    options: { focus?: boolean } = {}
  ): Contact | undefined {
    const fieldset = rowFieldsets.current.get(row.key)
    if (!fieldset) return row.contact

    const prefix = `contactInfo[${index}].`
    const parsed = contactSchema.safeParse(
      normalizeFormData(collectRowData(fieldset, prefix))
    )

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten()
        .fieldErrors as FieldErrors
      setRowErrors((current) => ({
        ...current,
        [row.key]: fieldErrors
      }))
      if (options.focus) {
        const firstField = Object.keys(fieldErrors)[0]
        const invalidEl = firstField
          ? fieldset.elements.namedItem(`${prefix}${firstField}`)
          : null
        if (invalidEl instanceof HTMLElement) invalidEl.focus()
      }
      return undefined
    }

    if (row.key in rowErrors) {
      setRowErrors(({ [row.key]: _, ...rest }) => rest)
    }
    return parsed.data
  }

  /**
   * Blocks adding another row while an open one is still incomplete or
   * invalid, surfacing why instead of letting bad data reach the
   * server. Native `maxlength`/`required` constraints run first
   * (`Contact` is only `required` once the row has been started — see
   * the note on that field below), then `validateRow` re-checks with
   * `contactSchema` for real Zod messages, which also catches a
   * still-untouched blank row (its `required` is off, but the schema
   * still needs `contact`). Mirrors `ItemPicker`'s
   * `focusInvalidNewSlot`.
   */
  function focusInvalidRow(): boolean {
    for (const [index, row] of rows.entries()) {
      if (row.kind !== 'editing') continue
      const fieldset = rowFieldsets.current.get(row.key)
      if (!fieldset) continue

      const invalid = Array.from(fieldset.elements)
        .filter(isValidatable)
        .find((el) => el.willValidate && !el.checkValidity())
      if (invalid) {
        invalid.reportValidity()
        return true
      }

      if (!validateRow(index, row, { focus: true })) return true
    }
    return false
  }

  function addRow() {
    if (focusInvalidRow()) return
    setRows((current) => [
      ...current,
      { key: `contact-${nextKey.current++}`, kind: 'editing' }
    ])
  }

  /** Commits an editing row, collapsing it into the compact saved view. */
  function saveRow(index: number, row: ContactRow) {
    const parsed = validateRow(index, row, { focus: true })
    if (!parsed) return
    setRows((current) =>
      current.map((r) =>
        r.key === row.key
          ? { ...r, kind: 'saved', contact: parsed }
          : r
      )
    )
  }

  function removeRow(key: string) {
    setRows((current) => {
      const next = current.filter((row) => row.key !== key)
      // Never leave the section with no rows at all — with "Add
      // contact" hidden until something's saved, that would leave no
      // way back in.
      return next.length
        ? next
        : [{ key: `contact-${nextKey.current++}`, kind: 'editing' }]
    })
    setRowErrors(({ [key]: _, ...rest }) => rest)
    setFilledRowKeys((current) => {
      if (!current.has(key)) return current
      const next = new Set(current)
      next.delete(key)
      return next
    })
  }

  return (
    <fieldset className={styles['bare']}>
      <legend className={styles['with-action']}>
        <span>
          Contact info{' '}
          <span className={styles['optional-label']}>optional</span>
        </span>
        {/* Hidden until there's at least one saved contact — before
            that, the open "New contact" row below is already the add
            flow, so a second entry point would be redundant. */}
        {rows.some((row) => row.kind === 'saved') && (
          <button
            type='button'
            className='button-sm'
            onClick={addRow}
          >
            <PlusIcon /> Add contact
          </button>
        )}
      </legend>

      <input name='contactInfo[]' type='hidden' value='' readOnly />

      {rows.map((row, index) => {
        const prefix = `contactInfo[${index}].`
        const errors = rowErrors[row.key]

        if (row.kind === 'saved' && row.contact) {
          return (
            <div
              key={row.key}
              className={selectedResultStyles['selected-result']}
            >
              <div className={selectedResultStyles['content']}>
                <ItemResultLabel
                  title={row.contact.title || row.contact.contact}
                  subtitle={row.contact.title && row.contact.contact}
                  onRemove={() => removeRow(row.key)}
                  removeLabel='Remove contact'
                />
              </div>
              <input
                type='hidden'
                name={`${prefix}title`}
                value={row.contact.title ?? ''}
                readOnly
              />
              <input
                type='hidden'
                name={`${prefix}contact`}
                value={row.contact.contact}
                readOnly
              />
            </div>
          )
        }

        return (
          <fieldset
            key={row.key}
            ref={(el) => setRowFieldsetRef(row.key, el)}
          >
            <div className={styles['input-group']}>
              <Input
                attributes={{
                  maxLength: 255,
                  name: `${prefix}title`,
                  placeholder: 'e.g. Bookings'
                }}
                defaultValue={row.contact?.title}
                errors={errors?.title}
                label='Label'
                onChange={() => updateFilledState(row.key)}
              />
              {/* `required` only once the row is in `filledRowKeys` —
                  an untouched placeholder row must stay optional (the
                  section itself is optional), but once the user starts
                  a row they have to finish or cancel it. */}
              <Input
                attributes={{
                  maxLength: 255,
                  name: `${prefix}contact`,
                  placeholder: 'e.g. bookings@example.com',
                  required: filledRowKeys.has(row.key)
                }}
                defaultValue={row.contact?.contact}
                errors={errors?.contact}
                label='Contact'
                onChange={() => updateFilledState(row.key)}
              />
            </div>
            <div className={styles['row-actions']}>
              <button
                type='button'
                className='button-sm button-primary'
                onClick={() => saveRow(index, row)}
              >
                Save
              </button>
              {/* Only shown once there's something to discard — a
                  still-blank row is dropped server-side on save
                  anyway, so there's nothing for Cancel to do yet. */}
              {filledRowKeys.has(row.key) && (
                <button
                  type='button'
                  className='button-sm'
                  onClick={() => removeRow(row.key)}
                >
                  Cancel
                </button>
              )}
            </div>
          </fieldset>
        )
      })}
    </fieldset>
  )
}
