'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'

import {
  dashboardItemTypes,
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath,
  pagePaths
} from '@/lib/schemas'
import { snakeToCamel } from '@/lib/strings'
import { dashboardUrl, newUrl } from '@/ui/util'

export function CreateItemButton({
  className,
  itemType,
  onClick,
  href,
  label,
  ref
}: {
  className?: string
  itemType: EmbeddedItemType | PagePath
  onClick?: () => void
  href?: string
  /** Replaces the default "New {item}" text. */
  label?: string
  ref?: React.Ref<HTMLButtonElement>
}) {
  const text = label ?? `New ${itemTypeToLabel(itemType, true, true)}`

  if (href) {
    return (
      <a
        className={className}
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        <PlusIcon /> {text}
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
        <PlusIcon /> {text}
      </button>
    )
  }
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
    const itemType = dashboardItemTypes.find(
      (type) => type === itemPart
    )
    return (
      itemType && {
        itemType,
        href: newUrl(dashboardUrl(itemType))
      }
    )
  }

  if (
    pathnameParts.length === 2 &&
    pagePaths.includes(pathnameParts[1] as PagePath)
  ) {
    const itemType = pathnameParts[1] as PagePath
    return { itemType, href: newUrl(`/${itemType}`) }
  }

  return undefined
}

export function CreateItemFromPathnameButton() {
  const pathname = usePathname()
  const found = itemTypeFromPathname(pathname.split('/'))

  if (!found) return null
  const { itemType, href } = found

  return (
    <CreateItemButton
      className='button-primary'
      itemType={itemType}
      href={href}
    />
  )
}
