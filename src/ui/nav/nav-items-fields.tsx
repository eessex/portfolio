'use client'

import { useId, useState } from 'react'

import { ABOUT_PATH } from '@/lib/schemas'
import {
  DEFAULT_NAV_ITEMS,
  MAX_NAV_LABEL_LENGTH,
  type NavItemSetting,
  type NavPath,
  navPaths
} from '@/lib/site-settings/nav-paths'
import { SortableList } from '@/ui/drag-and-drop/sortable-list'
import { Checkbox } from '@/ui/form/checkbox'
import { FieldErrorList } from '@/ui/form/field-error-list'
import { Input } from '@/ui/form/input'
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

/** Why a shown item may not be in the bar for everyone */
function statusHint(path: NavPath, status?: NavItemStatus) {
  if (status === 'published') return
  if (status === 'drafts') return 'Drafts only: admins see it.'
  if (status === 'empty') {
    return path === ABOUT_PATH
      ? 'Not created yet: admins see a link to create it.'
      : 'Nothing yet: admins see a link to create the first one.'
  }
  return 'Hidden until a project exists.'
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
    <fieldset aria-describedby={descriptionId}>
      <InputLabel
        as='legend'
        label='Menu'
        isRequired
        description='Choose, order and name the items in the menubar. A blank name uses the default.'
        descriptionId={descriptionId}
      />
      <SortableList
        items={rows}
        onReorder={setRows}
        className={styles['rows']}
        renderItem={(row, index, dragHandle) => {
          const prefix = `navItems[${index}].`
          const defaultLabel = defaultNavLabel(row.id)
          const hint =
            row.isVisible && statuses
              ? statusHint(row.id, statuses[row.id])
              : undefined
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
              <Input
                label={`${defaultLabel} menu name`}
                isLabelHidden
                isOptionalLabelHidden
                defaultValue={row.label}
                attributes={{
                  name: `${prefix}label`,
                  placeholder: defaultLabel,
                  maxLength: MAX_NAV_LABEL_LENGTH,
                  // a hidden item's name isn't kept
                  disabled: !row.isVisible
                }}
              />
              {hint && <p className={styles['hint']}>{hint}</p>}
            </div>
          )
        }}
      />
      <FieldErrorList errors={errors} />
    </fieldset>
  )
}
