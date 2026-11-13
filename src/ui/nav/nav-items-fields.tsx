'use client'

import { useId, useState } from 'react'

import type { SiteKind } from '@/lib/projects/site-profile'
import {
  type NavItemSetting,
  type NavPath,
  siteNavItems,
  siteNavPaths
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

export type NavItemStatuses = Partial<Record<NavPath, NavItemStatus>>

interface Row {
  id: NavPath
  label?: string
  isVisible: boolean
}

/**
 * Shown items in their saved order, then the hidden ones, from the
 * items this kind of site offers
 */
function initialRows(
  kind: SiteKind,
  navItems?: NavItemSetting[]
): Row[] {
  const saved = siteNavItems(kind, navItems)
  const hidden = siteNavPaths(kind).filter(
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
  siteKind = 'music',
  statuses,
  errors
}: {
  navItems?: NavItemSetting[]
  /** which items are offered: Artists or Projects */
  siteKind?: SiteKind
  statuses?: NavItemStatuses
  errors?: string[]
}) {
  const [rows, setRows] = useState(() =>
    initialRows(siteKind, navItems)
  )
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
