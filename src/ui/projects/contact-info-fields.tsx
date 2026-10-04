'use client'

import { XMarkIcon } from '@heroicons/react/16/solid'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react'

import {
  emptyListFieldName,
  indexedItemFieldPrefix
} from '@/lib/item-fields'
import { type Contact, contactSchema } from '@/lib/schemas/fields'
import styles from '@/ui/form/form.module.scss'
import { Input } from '@/ui/form/input'
import contactStyles from '@/ui/projects/contact-info-fields.module.scss'

const name = 'contactInfo'

interface ContactRow {
  key: string
  title: string
  contact: string
}

function isValidRow(row: ContactRow) {
  return contactSchema.safeParse({
    title: row.title.trim() || undefined,
    contact: row.contact.trim() || undefined
  }).success
}

/**
 * Repeatable editor for a project's `contactInfo`: every row stays an
 * editable Contact/Label pair, submitted as `contactInfo[i].title` /
 * `contactInfo[i].contact` and read back by the server via
 * `extractIndexedGroups(data, 'contactInfo')`. An always-present
 * `contactInfo[]` marker submits an emptied list (clearing it) rather
 * than omitting it.
 *
 * "Add contact" only appears once every row passes `contactSchema`
 * (whitespace-only values count as blank), so
 * blank rows can't pile up. A lone blank row is the empty state — it
 * stays optional (the server drops a row with no `contact`), and
 * removing the last row reseeds one. A row's `Contact` becomes
 * `required` once its label has text, and never accepts whitespace
 * alone, so a half-filled row blocks the project form's submit.
 */
export function ContactInfoFields({
  contactInfo
}: {
  contactInfo?: Contact[]
}) {
  // Seeded past the initial rows so keys minted later never collide.
  const nextKey = useRef(Math.max(1, (contactInfo ?? []).length))
  const [rows, setRows] = useState<ContactRow[]>(() =>
    contactInfo?.length
      ? contactInfo.map((contact, index) => ({
          key: `contact-${index}`,
          title: contact.title ?? '',
          contact: contact.contact
        }))
      : [{ key: 'contact-0', title: '', contact: '' }]
  )
  const rowElements = useRef(new Map<string, HTMLDivElement>())
  // Row whose first input takes focus once the next `rows` change
  // commits — the Add/remove button that triggered it may be gone.
  const pendingFocusKey = useRef<string | null>(null)

  useEffect(() => {
    const key = pendingFocusKey.current
    pendingFocusKey.current = null
    if (key) {
      rowElements.current.get(key)?.querySelector('input')?.focus()
    }
  }, [rows])

  function setRowRef(key: string, el: HTMLDivElement | null) {
    if (el) rowElements.current.set(key, el)
    else rowElements.current.delete(key)
  }

  function blankRow(): ContactRow {
    return {
      key: `contact-${nextKey.current++}`,
      title: '',
      contact: ''
    }
  }

  function addRow() {
    const row = blankRow()
    pendingFocusKey.current = row.key
    setRows((current) => [...current, row])
  }

  function updateRow(
    key: string,
    field: 'title' | 'contact',
    value: string
  ) {
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, [field]: value } : row
      )
    )
  }

  function removeRow(index: number) {
    const next = rows.filter((_, i) => i !== index)
    const remaining = next.length ? next : [blankRow()]
    pendingFocusKey.current = remaining[Math.max(0, index - 1)].key
    setRows(remaining)
  }

  const isAddAllowed = rows.every(isValidRow)
  const isOnlyBlankRow =
    rows.length === 1 && !rows[0].title && !rows[0].contact

  return (
    <fieldset className={contactStyles['contact-info']}>
      <legend className={contactStyles['header']}>
        <span>
          Contact info{' '}
          <span className={styles['optional-label']}>optional</span>
        </span>
        {isAddAllowed && (
          <button
            type='button'
            className='button-sm'
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

      {rows.map((row, index) => {
        const prefix = indexedItemFieldPrefix(name, index)
        // Column labels show once, on the first row; later rows keep
        // them for screen readers only.
        return (
          <div
            key={row.key}
            ref={(el) => setRowRef(row.key, el)}
            className={contactStyles['row']}
          >
            <div className={styles['input-group']}>
              <Input
                attributes={{
                  maxLength: 255,
                  name: `${prefix}contact`,
                  // Rejects whitespace-only values, which the
                  // server would otherwise treat as blank.
                  pattern: '.*\\S.*',
                  placeholder: 'bookings@example.com',
                  required: !!row.title.trim(),
                  title: 'Enter an email, phone, or link'
                }}
                value={row.contact}
                label='Email, phone, or link'
                isLabelHidden={index > 0}
                // Only optional until the row's label is filled in —
                // the section-level "optional" covers skipping it.
                isOptionalLabelHidden
                onChange={(e) =>
                  updateRow(row.key, 'contact', e.target.value)
                }
              />
              <Input
                attributes={{
                  maxLength: 255,
                  name: `${prefix}title`,
                  placeholder: 'Bookings'
                }}
                value={row.title}
                label='Label'
                isLabelHidden={index > 0}
                onChange={(e) =>
                  updateRow(row.key, 'title', e.target.value)
                }
              />
            </div>
            {!isOnlyBlankRow && (
              <button
                type='button'
                aria-label='Remove contact'
                className={`${contactStyles['remove']} button-icon`}
                onClick={() => removeRow(index)}
              >
                <XMarkIcon />
              </button>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}
