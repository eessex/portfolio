'use client'

import style from '@/ui/nav/nav.module.scss'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import clsx from 'clsx'
import Link from 'next/link'

export function Nav ({ title }: { title?: string }) {
  const {
    isAtContentTop,
    isScrollingDown
  } = useWindowScrollPosition()

  return (
    <header className={clsx(`
      ${style['menubar']} menubar
      ${(isScrollingDown && !isAtContentTop) && style['hide'] + ' hide'}
    `)}
    >

      <nav>
        <h1>
          <Link href='/'>
            {title || 'Site Title'}
          </Link>
        </h1>

        <ul className='flex flex-row space-x-4 font-bold'>
          <li>
            <Link href='/events'>
              Events
            </Link>
          </li>
          <li>
            <Link href='/releases'>
              Releases
            </Link>
          </li>
          <li>
            <Link href='/about'>
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
