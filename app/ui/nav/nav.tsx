'use client'

import style from '@/ui/nav/nav.module.scss'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import clsx from 'clsx'
import NextLink from 'next/link'

export function Nav ({ title }: { title?: string }) {
  const {
    isAtContentTop,
    isScrollingDown
  } = useWindowScrollPosition()

  return (
    <header
      className={clsx(`
        ${style['menubar']} menubar
        ${(isScrollingDown && !isAtContentTop) && style['hide'] + ' hide'}
      `)}
      role='banner'
    >
      <div>
        <NextLink href='/'>
          <span>{title || 'Site Title'}</span>
        </NextLink>

        <nav aria-label='Main navigation'>
          <ul>
            <li>
              <NextLink href='/events'>Events</NextLink>
            </li>
            <li>
              <NextLink href='/releases'>Releases</NextLink>
            </li>
            <li>
              <NextLink href='/about'>About</NextLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
