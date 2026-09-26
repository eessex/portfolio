'use client'

import {
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useEffect, useId, useState } from 'react'

import type { Badge } from '@/lib/types'
import styles from '@/ui/accordion-dropdown/accordion-dropdown.module.scss'
import { Badges } from '@/ui/badges/badges'

export function AccordionDropdown({
  badges,
  children,
  isExpanded,
  isFullWidth,
  title,
  buttonClassname,
  panelClassname
}: {
  badges?: Badge[]
  children: React.ReactNode
  isExpanded?: boolean
  isFullWidth?: boolean
  title: string
  buttonClassname?: string
  panelClassname?: string
}) {
  const triggerId = useId()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(isExpanded || false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(isExpanded || false)
  }, [isExpanded])

  return (
    <section className={styles['accordion-dropdown']}>
      <h2>
        <button
          aria-expanded={isOpen}
          className={clsx(
            styles['accordion-trigger'],
            isFullWidth && styles['full-width'],
            buttonClassname
          )}
          aria-controls={panelId}
          id={triggerId}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className='accordion-title'>
            {title}
            {badges && <Badges badges={badges} />}
          </span>

          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </h2>

      <div
        id={panelId}
        role='region'
        aria-labelledby={triggerId}
        className={clsx(styles['accordion-panel'], panelClassname)}
        hidden={!isOpen}
      >
        {children}
      </div>
    </section>
  )
}
