'use client'

import clsx from 'clsx'
import NextLink from 'next/link'

import style from '@/ui/nav/nav.module.scss'
import { NavItemLink } from '@/ui/nav/nav-item-link'
import type { NavItem } from '@/ui/nav/nav-items'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import { useIsAdmin, useSyncedIsAdmin } from '@/ui/use-is-admin'

export function NavClient({
  title,
  items,
  adminMenu
}: {
  title?: string
  items: NavItem[]
  /** Server-rendered; renders nothing visible for visitors */
  adminMenu?: React.ReactNode
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

        <div className={style['end']}>
          {visibleItems.length > 0 && (
            <nav aria-label='Main navigation'>
              <ul>
                {visibleItems.map((item) => (
                  <li key={item.navPath}>
                    <NavItemLink
                      item={item}
                      createClassName={style['create']}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {adminMenu}
        </div>
      </div>
    </header>
  )
}
