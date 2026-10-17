'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

import {
  type EmbeddedItemType,
  embeddedItemTypes,
  itemTypeToLabel,
  type PagePath,
  pagePaths
} from '@/lib/schemas'
import { camelToSnake, snakeToCamel } from '@/lib/strings'

export function CreateItemButton({
  className,
  itemType,
  onClick,
  href,
  ref
}: {
  className?: string
  itemType: EmbeddedItemType | PagePath
  onClick: () => void
  href?: string
  ref?: React.Ref<HTMLButtonElement>
}) {
  const formattedItemType = itemTypeToLabel(itemType, true, true)

  if (href) {
    return (
      <a
        className={className}
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        <PlusIcon /> New {formattedItemType}
      </a>
    )
  } else {
    return (
      <button
        type='button'
        className={className}
        onClick={onClick}
        ref={ref}
      >
        <PlusIcon /> New {formattedItemType}
      </button>
    )
  }
}

export type CreateItemDetail = {
  itemType: EmbeddedItemType | PagePath
}

/**
 * Derives the creatable item type (and its "New" href) from the
 * current pathname: `/dashboard/{embeddedType}` for embedded items
 * (e.g. images, venues), or a page type's own public list page
 * (`/{pagePath}`, e.g. `/projects`) for page items — `about` is
 * excluded since it's a singleton with no create flow.
 */
function itemTypeFromPathname(
  pathnameParts: string[]
):
  | { itemType: EmbeddedItemType | PagePath; href: string }
  | undefined {
  if (pathnameParts[1] === 'dashboard') {
    const itemPart = pathnameParts[2]
      ? (snakeToCamel(pathnameParts[2]) as EmbeddedItemType)
      : undefined
    const itemType = embeddedItemTypes.find(
      (type) => type === itemPart
    )
    return (
      itemType && {
        itemType,
        href: `/dashboard/${camelToSnake(itemType)}/new`
      }
    )
  }

  if (
    pathnameParts.length === 2 &&
    pagePaths.includes(pathnameParts[1] as PagePath)
  ) {
    const itemType = pathnameParts[1] as PagePath
    return { itemType, href: `/${itemType}/new` }
  }

  return undefined
}

export function CreateItemFromPathnameButton() {
  const pathname = usePathname()
  const found = itemTypeFromPathname(pathname.split('/'))

  if (!found) return null
  const { itemType, href } = found

  function onClick() {
    const event = new CustomEvent<CreateItemDetail>(
      'openNewItemForm',
      {
        detail: { itemType }
      }
    )
    document.dispatchEvent(event)
  }

  return (
    <CreateItemButton
      className='button-primary'
      itemType={itemType}
      onClick={onClick}
      href={href}
    />
  )
}
