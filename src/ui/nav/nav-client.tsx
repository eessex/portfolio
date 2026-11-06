'use client'

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

import { useIsSubscribed } from '@/ui/email-subscribe/use-is-subscribed'
import style from '@/ui/nav/nav.module.scss'
import { NavItemLink } from '@/ui/nav/nav-item-link'
import type { NavItem } from '@/ui/nav/nav-items'
import { OnPathnameChange } from '@/ui/nav/pathname-change'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import { useMenubarDisclosure } from '@/ui/nav/use-menubar-disclosure'
import { useIsAdmin, useSyncedIsAdmin } from '@/ui/use-is-admin'

/** On the section's index or any page under it, e.g. an event */
function isInSection(pathname: string | null, href: string) {
  return pathname === href || !!pathname?.startsWith(`${href}/`)
}

/** Marked current while its section is being viewed */
function SectionNavItemLink(
  props: Omit<React.ComponentProps<typeof NavItemLink>, 'isCurrent'>
) {
  const pathname = usePathname()
  return (
    <NavItemLink
      {...props}
      isCurrent={isInSection(pathname, props.item.href)}
    />
  )
}

/**
 * Inline links and the admin menu; below mobile width, one Menu
 * button's sheet holding both (the gear hides, its panel inlines)
 */
function SiteMenu({
  items,
  adminMenu,
  trayFooter,
  isMenuButtonShown
}: {
  items: NavItem[]
  adminMenu?: React.ReactNode
  trayFooter?: React.ReactNode
  isMenuButtonShown: boolean
}) {
  const { isOpen, close, containerProps, buttonProps, panelProps } =
    useMenubarDisclosure()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) sheetRef.current?.querySelector('a')?.focus()
  }, [isOpen])

  return (
    <div {...containerProps} className={style['end']}>
      <OnPathnameChange onChange={close} />
      {isMenuButtonShown && (
        <button {...buttonProps} className={style['menu-button']}>
          {isOpen ? <XMarkIcon /> : <Bars3Icon />} Menu
        </button>
      )}
      <div
        {...panelProps}
        ref={sheetRef}
        // a sign-out can drop the button with the sheet still open
        className={clsx(
          style['sheet'],
          isOpen && isMenuButtonShown && style['open']
        )}
      >
        {items.length > 0 && (
          <nav
            aria-label='Main navigation'
            className={style['main-nav']}
          >
            <ul>
              {items.map((item) => (
                <li key={item.navPath}>
                  {/* prerenders unmarked; the pathname streams in */}
                  <Suspense
                    fallback={
                      <NavItemLink
                        item={item}
                        createClassName={style['create']}
                      />
                    }
                  >
                    <SectionNavItemLink
                      item={item}
                      createClassName={style['create']}
                    />
                  </Suspense>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {adminMenu}
        {trayFooter}
      </div>
    </div>
  )
}

export function NavClient({
  title,
  items,
  adminMenu,
  trayFooter,
  isTrayFooterSubscribeOnly = false
}: {
  title?: string
  items: NavItem[]
  /** Server-rendered; renders nothing visible for visitors */
  adminMenu?: React.ReactNode
  /** The footer's content, for visitors' mobile Menu tray */
  trayFooter?: React.ReactNode
  /** Just the subscribe form, so empty once subscribed */
  isTrayFooterSubscribeOnly?: boolean
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
  const isSubscribed = useIsSubscribed()
  const isTrayFooterShown =
    !!trayFooter && !(isTrayFooterSubscribeOnly && isSubscribed)

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

        <SiteMenu
          items={visibleItems}
          adminMenu={adminMenu}
          trayFooter={!isAdmin && isTrayFooterShown && trayFooter}
          isMenuButtonShown={
            visibleItems.length > 0 || isAdmin || isTrayFooterShown
          }
        />
      </div>
    </header>
  )
}
