'use client'

import styles from '@/ui/admin-sidebar/admin-sidebar.module.scss'
import type { EmbeddedItemKey } from '@/ui/dashboard/dashboard-items'
import { camelToSentence, snakeToCamel } from '@/ui/util'
import { PlusIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

export type OpenNewItemFormDetail = { itemType: EmbeddedItemKey }

export function AddItemButton () {
  const allowedItemTypes: EmbeddedItemKey[] = ['embedCodes', 'images', 'links', 'venues']
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const itemPart = pathnameParts[2] ? snakeToCamel(pathnameParts[2]) as EmbeddedItemKey : undefined // after /dashboard/
  const itemType = allowedItemTypes.find(type => type === itemPart)

  if (!itemType) return null

  function onClick () {
    if (!itemType) return
    const event = new CustomEvent<OpenNewItemFormDetail>('openNewItemForm', { detail: { itemType } })
    document.dispatchEvent(event)
  }

  return (
    <li>
      <button className={`button ${styles['admin-sidebar-new-item']}`} onClick={onClick}>
        <PlusIcon /> Add {camelToSentence(itemType).replace(/s$/, '')}
      </button>
    </li>
  )
}
