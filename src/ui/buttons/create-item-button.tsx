'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import {
  dashboardItemTypes,
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath
} from '@/lib/schemas'
import { snakeToCamel } from '@/lib/strings'
import { dashboardUrl, newUrl } from '@/ui/routes'

export function CreateItemButton({
  className,
  itemType,
  onClick,
  href,
  label,
  ariaLabel,
  ref
}: {
  className?: string
  onClick?: () => void
  href?: string
  /** For when the text alone doesn't say what's created */
  ariaLabel?: string
  ref?: React.Ref<HTMLButtonElement>
} & (
  | {
      itemType: EmbeddedItemType | PagePath
      /** Replaces the default "New {item}" text. */
      label?: string
    }
  | { itemType?: never; label: string }
)) {
  const text =
    label ??
    (itemType && `New ${itemTypeToLabel(itemType, true, true)}`)

  if (href) {
    return (
      <NextLink
        className={className}
        href={href}
        aria-label={ariaLabel}
        ref={ref as React.Ref<HTMLAnchorElement>}
      >
        <PlusIcon /> {text}
      </NextLink>
    )
  } else {
    return (
      <button
        type='button'
        className={className}
        onClick={onClick}
        aria-label={ariaLabel}
        ref={ref}
      >
        <PlusIcon /> {text}
      </button>
    )
  }
}

/**
 * Derives the creatable embedded item type (and its "New" href) from
 * a `/dashboard/{embeddedType}` pathname (e.g. images, venues). Page
 * types get theirs from their index header (`CreateItemHeader`).
 */
function itemTypeFromPathname(
  pathnameParts: string[]
): { itemType: EmbeddedItemType; href: string } | undefined {
  if (pathnameParts[1] !== 'dashboard') return undefined

  const itemPart = pathnameParts[2]
    ? (snakeToCamel(pathnameParts[2]) as EmbeddedItemType)
    : undefined
  const itemType = dashboardItemTypes.find(
    (type) => type === itemPart
  )
  return (
    itemType && { itemType, href: newUrl(dashboardUrl(itemType)) }
  )
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
