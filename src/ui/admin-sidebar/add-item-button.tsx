'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

import { embeddedItemTypes } from '@/lib/schemas'
import type { EmbeddedItemType } from '@/lib/types'
import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import { camelToSentence, snakeToCamel } from '@/ui/util'

export type OpenNewItemFormDetail = { itemType: EmbeddedItemType }

export function AddItemButton () {
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const itemPart = pathnameParts[2] ? snakeToCamel(pathnameParts[2]) as EmbeddedItemType : undefined // after /dashboard/
  const itemType = embeddedItemTypes.find(type => type === itemPart)

  if (!itemType) return null

  function onClick () {
    if (!itemType) return
    const event = new CustomEvent<OpenNewItemFormDetail>('openNewItemForm', { detail: { itemType } })
    document.dispatchEvent(event)
  }

  return (
    <li>
      <button
        className={`button ${styles['admin-sidebar-new-item']}`}
        onClick={onClick}
      >
        <PlusIcon /> Add {camelToSentence(itemType).replace(/s$/, '')}
      </button>
    </li>
  )
}
