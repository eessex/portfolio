'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import {
  emptyListFieldName,
  indexedItemFieldPrefix
} from '@/lib/item-fields'
import { type Contact, contactSchema } from '@/lib/schemas/fields'
import { normalizeFormData } from '@/lib/util'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import itemPickerStyles from '@/ui/item-picker/item-picker.module.scss'
import { ItemResultLabel } from '@/ui/item-result-label'
import contactStyles from '@/ui/projects/contact-info-fields.module.scss'
import selectedResultStyles from '@/ui/selected-results/selected-results.module.scss'

type FieldErrors = Record<string, string[] | undefined>

const name = 'contactInfo'

interface ContactRow {
  key: string
  kind: 'editing' | 'saved'
  contact?: Contact
}

/**
 * Repeatable editor for a project's `contactInfo`, laid out like a
 * multi `ItemPicker`: the open row sits directly under the header, and
 * saved rows collapse into `ItemResultLabel` chips in the picker's
 * `item-list` below it. Unlike a picker item, a contact has no id or
 * create endpoint of its own, so `Save` only collapses a valid row —
 * the project form's submit includes an open row's values either way,
 * and the server drops a row with no `contact`.
 *
 * At most one row is open at a time: "Add contact" is hidden while
 * one is, so there's a single entry point. `Save`/`Cancel` (and the
 * picker's expanded-draft box) appear once the open row has content
 * (`filledRowKeys`); an untouched row has nothing to save or discard.
 * With nothing saved, the open row is itself the add flow — emptying
 * the list reseeds a blank one (see `removeRow`).
 *
 * Inputs are named `contactInfo[i].title` / `contactInfo[i].contact`
 * (hidden once saved), which the server reads back via
 * `extractIndexedGroups(data, 'contactInfo')`, plus an always-present
 * `contactInfo[]` marker so an emptied list is submitted (and cleared)
 * rather than omitted. The open row renders first but keeps its
 * position in `rows` for its index, so it submits after the saved
 * rows it was added after.
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
  const addButtonRef = useRef<HTMLButtonElement>(null)
  // Where to move focus once the next `rows` change commits — the
  // button that triggered it (Add, Save) is unmounted by that change.
  const pendingFocus = useRef<'add' | { rowKey: string } | null>(null)

  useEffect(() => {
    const target = pendingFocus.current
    pendingFocus.current = null
    if (target === 'add') {
      addButtonRef.current?.focus()
    } else if (target) {
      rowFieldsets.current
        .get(target.rowKey)
        ?.querySelector<HTMLInputElement>('input')
        ?.focus()
    }
  }, [rows])

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
   * first invalid field — used when trying to save the row.
   */
  function validateRow(
    index: number,
    row: ContactRow,
    options: { focus?: boolean } = {}
  ): Contact | undefined {
    const fieldset = rowFieldsets.current.get(row.key)
    if (!fieldset) return row.contact

    const prefix = indexedItemFieldPrefix(name, index)
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

  function addRow() {
    const key = `contact-${nextKey.current++}`
    pendingFocus.current = { rowKey: key }
    setRows((current) => [...current, { key, kind: 'editing' }])
  }

  /** Commits an editing row, collapsing it into the compact saved view. */
  function saveRow(index: number, row: ContactRow) {
    const parsed = validateRow(index, row, { focus: true })
    if (!parsed) return
    pendingFocus.current = 'add'
    setRows((current) =>
      current.map((r) =>
        r.key === row.key
          ? { ...r, kind: 'saved', contact: parsed }
          : r
      )
    )
  }

  function removeRow(key: string) {
    const next = rows.filter((row) => row.key !== key)
    if (next.length) {
      pendingFocus.current = 'add'
      setRows(next)
    } else {
      // With nothing saved, the open row is the add flow — reseed a
      // blank one rather than leave the section empty.
      const reseedKey = `contact-${nextKey.current++}`
      pendingFocus.current = { rowKey: reseedKey }
      setRows([{ key: reseedKey, kind: 'editing' }])
    }
    setRowErrors(({ [key]: _, ...rest }) => rest)
    setFilledRowKeys((current) => {
      if (!current.has(key)) return current
      const next = new Set(current)
      next.delete(key)
      return next
    })
  }

  const isRowOpen = rows.some((row) => row.kind === 'editing')

  function renderOpenRow(row: ContactRow, index: number) {
    const prefix = indexedItemFieldPrefix(name, index)
    const errors = rowErrors[row.key]
    const isFilled = filledRowKeys.has(row.key)

    return (
      <fieldset
        key={row.key}
        ref={(el) => setRowFieldsetRef(row.key, el)}
        className={clsx(
          contactStyles['open-row'],
          isFilled && contactStyles['open-row-filled']
        )}
      >
        <legend className='visually-hidden'>New contact</legend>
        <div className={styles['input-group']}>
          <Input
            attributes={{
              maxLength: 255,
              name: `${prefix}title`,
              placeholder: 'Bookings'
            }}
            defaultValue={row.contact?.title}
            errors={errors?.title}
            label='Label'
            onChange={() => updateFilledState(row.key)}
          />
          {/* `required` only once the row is started — an untouched
              row must stay optional (the section itself is), but a
              started one has to be finished or cancelled. */}
          <Input
            attributes={{
              maxLength: 255,
              name: `${prefix}contact`,
              placeholder: 'bookings@example.com',
              required: isFilled
            }}
            defaultValue={row.contact?.contact}
            errors={errors?.contact}
            label='Contact'
            onChange={() => updateFilledState(row.key)}
          />
        </div>
        {isFilled && (
          <div
            className={clsx(
              itemPickerStyles['create-form-actions'],
              itemPickerStyles['create-form-actions-visible']
            )}
          >
            <button
              type='button'
              className={`button-primary ${itemPickerStyles['save-button']}`}
              onClick={() => saveRow(index, row)}
            >
              Save contact
            </button>
            <button
              type='button'
              className='button-sm'
              onClick={() => removeRow(row.key)}
            >
              Cancel
            </button>
          </div>
        )}
      </fieldset>
    )
  }

  function renderSavedRow(
    row: ContactRow,
    contact: Contact,
    index: number
  ) {
    const prefix = indexedItemFieldPrefix(name, index)
    return (
      <div
        key={row.key}
        className={selectedResultStyles['selected-result']}
      >
        <div className={selectedResultStyles['content']}>
          <ItemResultLabel
            title={contact.title || contact.contact}
            subtitle={contact.title && contact.contact}
            onRemove={() => removeRow(row.key)}
            removeLabel='Remove contact'
          />
        </div>
        <input
          type='hidden'
          name={`${prefix}title`}
          value={contact.title ?? ''}
          readOnly
        />
        <input
          type='hidden'
          name={`${prefix}contact`}
          value={contact.contact}
          readOnly
        />
      </div>
    )
  }

  const savedRows = rows.flatMap((row, index) =>
    row.kind === 'saved' && row.contact
      ? [renderSavedRow(row, row.contact, index)]
      : []
  )

  return (
    <fieldset className={contactStyles['contact-info']}>
      <legend className={contactStyles['header']}>
        <span>
          Contact info{' '}
          <span className={styles['optional-label']}>optional</span>
        </span>
        {/* One entry point at a time: hidden while a row is open. */}
        {!isRowOpen && (
          <button
            type='button'
            className='button-sm'
            ref={addButtonRef}
            onClick={addRow}
          >
            <PlusIcon /> Add contact
          </button>
        )}
      </legend>

      <input
        name={emptyListFieldName(name)}
        type='hidden'
        value=''
        readOnly
      />

      {rows.map((row, index) =>
        row.kind === 'editing' ? renderOpenRow(row, index) : null
      )}

      {savedRows.length > 0 && (
        <div className={itemPickerStyles['item-list']}>
          {savedRows}
        </div>
      )}
    </fieldset>
  )
}
