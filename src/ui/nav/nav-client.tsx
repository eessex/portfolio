'use client'

import clsx from 'clsx'
import NextLink from 'next/link'

import { CreateItemButton } from '@/ui/buttons/create-item-button'
import style from '@/ui/nav/nav.module.scss'
import {
  type NavItem,
  navItemCreateHref,
  navItemCreateLabel
} from '@/ui/nav/nav-items'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import { useIsAdmin, useSyncedIsAdmin } from '@/ui/use-is-admin'

export function NavClient({
  title,
  items
}: {
  title?: string
  items: NavItem[]
}) {
  const { isAtContentTop, isScrollingDown } =
    useWindowScrollPosition()
  // session is only fetched when a draft-only section exists: an
  // empty one can stay empty for good, and only adds a ghost link
  const isFetchedAdmin = useIsAdmin(
    items.some((item) => item.status === 'drafts')
  )
  const isSyncedAdmin = useSyncedIsAdmin()
  const isAdmin = isFetchedAdmin || isSyncedAdmin
  const visibleItems = items.filter(
    (item) => item.status === 'published' || isAdmin
  )

  return (
    <header
      className={clsx(`
        ${style['menubar']} menubar
        ${isScrollingDown && !isAtContentTop && style['hide'] + ' hide'}
      `)}
      role='banner'
    >
      <div>
        <NextLink href='/'>
          <span>{title || 'Site Title'}</span>
        </NextLink>

        {visibleItems.length > 0 && (
          <nav aria-label='Main navigation'>
            <ul>
              {visibleItems.map(
                ({ navPath, href, label, status }) => (
                  <li key={navPath}>
                    {status === 'empty' ? (
                      <CreateItemButton
                        className={style['create']}
                        href={navItemCreateHref(navPath)}
                        label={label}
                        ariaLabel={navItemCreateLabel({
                          navPath,
                          label
                        })}
                      />
                    ) : (
                      <NextLink href={href}>{label}</NextLink>
                    )}
                  </li>
                )
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
