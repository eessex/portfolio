'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

import { embeddedItemTypes } from '@/lib/schemas'
import type { EmbeddedItemType } from '@/lib/types'
import {
  itemTypeToLabel,
  snakeToCamel
} from '@/ui/util'

export function CreateItemButton ({
  className,
  itemType,
  onClick
}: {
  className?: string
  itemType: EmbeddedItemType
  onClick: () => void
}) {
  const formattedItemType = itemTypeToLabel(itemType, true, true)

  return (
    <button
      type='button'
      className={className}
      onClick={onClick}
    >
      <PlusIcon /> Create new {formattedItemType}
    </button>
  )
}

export type CreateItemDetail = { itemType: EmbeddedItemType }

export function CreateItemFromPathnameButton () {
  const pathname = usePathname()
  const pathnameParts = pathname.split('/')
  const itemPart = pathnameParts[2] ? snakeToCamel(pathnameParts[2]) as EmbeddedItemType : undefined // after /dashboard/
  const itemType = embeddedItemTypes.find(type => type === itemPart)

  if (!itemType) return null

  function onClick () {
    if (!itemType) return
    const event = new CustomEvent<CreateItemDetail>('openNewItemForm', { detail: { itemType } })
    document.dispatchEvent(event)
  }

  return (
    <CreateItemButton
      className='button-primary'
      itemType={itemType}
      onClick={onClick}
    />
  )
}
