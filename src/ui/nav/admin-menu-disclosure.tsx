'use client'

import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Cog6ToothIcon as FilledCog6ToothIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'

import styles from '@/ui/nav/admin-menu.module.scss'
import { OnPathnameChange } from '@/ui/nav/pathname-change'
import { useMenubarDisclosure } from '@/ui/nav/use-menubar-disclosure'

/** A disclosure, not role='menu': its links are plain tab stops */
export function AdminMenuDisclosure({
  children
}: {
  children: React.ReactNode
}) {
  const { isOpen, close, containerProps, buttonProps, panelProps } =
    useMenubarDisclosure()

  return (
    <div {...containerProps} className={styles['admin-menu']}>
      <OnPathnameChange onChange={close} />
      <button
        {...buttonProps}
        className={styles['toggle']}
        aria-label='Admin menu'
      >
        {/* filled while open, like Menu's X */}
        {isOpen ? <FilledCog6ToothIcon /> : <Cog6ToothIcon />} Admin
      </button>

      {/* a class, not hidden: phones always show it, in the Menu sheet */}
      <div
        {...panelProps}
        className={clsx(styles['panel'], isOpen && styles['open'])}
      >
        {children}
      </div>
    </div>
  )
}
