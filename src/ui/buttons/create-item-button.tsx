'use client'

import { PlusIcon } from '@heroicons/react/24/outline'
import NextLink from 'next/link'

import {
  type EmbeddedItemType,
  itemTypeToLabel,
  type PagePath
} from '@/lib/schemas'

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
