'use client'

import { useId, useState } from 'react'

import {
  DEFAULT_NAV_ITEMS,
  type NavItemSetting,
  type NavPath,
  navPaths
} from '@/lib/site-settings/nav-paths'
import { DraftBadge } from '@/ui/badges/draft-badge'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import { Checkbox } from '@/ui/form/checkbox'
import { FieldErrorList } from '@/ui/form/field-error-list'
import { InputLabel } from '@/ui/form/input-label'
import {
  defaultNavLabel,
  type NavItemStatus
} from '@/ui/nav/nav-items'
import styles from '@/ui/nav/nav-items-fields.module.scss'

export type NavItemStatuses = Record<
  NavPath,
  NavItemStatus | undefined
>

interface Row {
  id: NavPath
  label?: string
  isVisible: boolean
}

/** Shown items in their saved order, then the hidden ones */
function initialRows(saved = DEFAULT_NAV_ITEMS): Row[] {
  const hidden = navPaths.filter(
    (path) => !saved.some((item) => item.path === path)
  )
  return [
    ...saved.map(({ path, label }) => ({
      id: path,
      label,
      isVisible: true
    })),
    ...hidden.map((path) => ({ id: path, isVisible: false }))
  ]
}

export function NavItemsFields({
  navItems,
  statuses,
  errors
}: {
  navItems?: NavItemSetting[]
  statuses?: NavItemStatuses
  errors?: string[]
}) {
  const [rows, setRows] = useState(() => initialRows(navItems))
  const descriptionId = useId()

  function setVisible(id: NavPath, isVisible: boolean) {
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, isVisible } : row
      )
    )
  }

  return (
    <fieldset
      aria-describedby={descriptionId}
      className={styles['nav-item-picker']}
    >
      <InputLabel
        as='legend'
        label='Menu items'
        isRequired
        description='Choose and order the items in the menubar. Menu items with no published content are hidden from visitors.'
        descriptionId={descriptionId}
      />
      <SortableList
        items={rows}
        onReorder={setRows}
        className={styles['rows']}
        renderItem={(row, index, dragHandle) => {
          const prefix = `navItems[${index}].`
          const defaultLabel = defaultNavLabel(row.id)
          // a shown item visitors don't see: drafts only, nothing
          // yet, or not creatable yet
          const isUnpublished =
            row.isVisible &&
            !!statuses &&
            statuses[row.id] !== 'published'
          return (
            <div className={styles['row']}>
              {dragHandle}
              <input
                type='hidden'
                name={`${prefix}path`}
                value={row.id}
              />
              <Checkbox
                attributes={{ name: `${prefix}isVisible` }}
                isDefaultChecked={row.isVisible}
                label={defaultLabel}
                onChange={(event) =>
                  setVisible(row.id, event.target.checked)
                }
              />
              {isUnpublished && <DraftBadge />}
            </div>
          )
        }}
      />
      <FieldErrorList errors={errors} />
    </fieldset>
  )
}
