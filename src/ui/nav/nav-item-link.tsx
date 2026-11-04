import NextLink from 'next/link'

import { DraftBadge } from '@/ui/badges/draft-badge'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import {
  type NavItem,
  navItemCreateHref,
  navItemCreateLabel
} from '@/ui/nav/nav-items'

/** A nav item's link, or its ghost create link while empty */
export function NavItemLink({
  item: { navPath, href, label, status },
  className,
  createClassName
}: {
  item: NavItem
  className?: string
  createClassName?: string
}) {
  if (status === 'empty') {
    return (
      <CreateItemButton
        className={createClassName}
        href={navItemCreateHref(navPath)}
        label={label}
        ariaLabel={navItemCreateLabel({ navPath, label })}
      />
    )
  }
  return (
    <>
      <NextLink href={href} className={className}>
        {label}
      </NextLink>
      {status === 'drafts' && <DraftBadge label='Draft' />}
    </>
  )
}
