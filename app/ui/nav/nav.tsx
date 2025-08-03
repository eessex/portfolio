'use client'
import Link from 'next/link'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'
import clsx from 'clsx'
import style from './nav.module.scss'

export function Nav ({ title }: { title?: string }) {
  const {
    isAtContentTop,
    isScrollingDown
  } = useWindowScrollPosition()

  return (
    <header className={clsx(`
      ${style['menubar']} 
      ${!isAtContentTop && style['sticky']} 
      ${(isScrollingDown && !isAtContentTop) && style['hide'] + ' hide'}
    `)}
    >

      <nav>
        <h1 className='md:space-x-2 flex-1'>
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
