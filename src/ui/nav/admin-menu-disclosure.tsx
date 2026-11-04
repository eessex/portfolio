'use client'

import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

import styles from '@/ui/nav/admin-menu.module.scss'
import { useWindowScrollPosition } from '@/ui/nav/scroll-position'

/** A disclosure, not role='menu': its links are plain tab stops */
export function AdminMenuDisclosure({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)
  const { isAtContentTop, isScrollingDown } =
    useWindowScrollPosition()
  // same condition that slides the menubar away
  const isMenubarHidden = isScrollingDown && !isAtContentTop
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsOpen(false)
  } else if (isOpen && isMenubarHidden) {
    setIsOpen(false)
  }
  const panelId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node))
        setIsOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      // leave Escape to whatever else has focus
      const { activeElement } = document
      if (
        activeElement !== document.body &&
        !containerRef.current?.contains(activeElement)
      )
        return
      setIsOpen(false)
      buttonRef.current?.focus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className={styles['admin-menu']}
      onBlur={(event) => {
        // tabbing out closes it; null = focus left the page
        const next = event.relatedTarget as Node | null
        if (next && !containerRef.current?.contains(next))
          setIsOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type='button'
        className='button-icon'
        aria-label='Admin menu'
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Cog6ToothIcon />
      </button>

      <div
        id={panelId}
        className={styles['panel']}
        hidden={!isOpen}
        onClick={(event) => {
          // a link to the current page doesn't change the pathname
          if ((event.target as Element).closest('a')) setIsOpen(false)
        }}
      >
        {children}
      </div>
    </div>
  )
}
