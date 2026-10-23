'use client'

import clsx from 'clsx'
import NextLink from 'next/link'

import style from '@/ui/nav/nav.module.scss'
import type { NavItem } from '@/ui/nav/nav-items'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import { useIsAdmin } from '@/ui/useIsAdmin'

export function NavClient({
  title,
  items
}: {
  title?: string
  items: NavItem[]
}) {
  const { isAtContentTop, isScrollingDown } =
    useWindowScrollPosition()
  // session is only checked when a draft-only section exists
  const isAdmin = useIsAdmin(
    items.some((item) => !item.hasPublishedItems)
  )
  const visibleItems = items.filter(
    (item) => item.hasPublishedItems || isAdmin
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
              {visibleItems.map(({ navPath, href, label }) => (
                <li key={navPath}>
                  <NextLink href={href}>{label}</NextLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
