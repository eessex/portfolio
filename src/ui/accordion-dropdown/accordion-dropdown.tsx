'use client'

import type { Badge } from '@/lib/types'
import styles from '@/ui/accordion-dropdown/accordion-dropdown.module.scss'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useEffect, useId, useState } from 'react'

export function AccordionDropdown ({
  badges,
  children,
  isExpanded,
  title
}: {
  badges?: Badge[],
  children: React.ReactNode
  isExpanded?: boolean
  title: string
}) {
  const triggerId = useId()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(isExpanded || false)

  useEffect(() => {
    setIsOpen(isExpanded || false)
  }, [isExpanded])

  return (
    <section className={styles['accordion-dropdown']}>
      <h2>
        <button
          aria-expanded={isOpen}
          className={styles['accordion-trigger']}
          aria-controls={panelId}
          id={triggerId}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className='accordion-title'>
            {title}
            {badges && badges.map((badge, index) => (
              <mark
                key={index}
                className={`badge badge-${badge.color || 'green'}`}
              >
                {badge.text}
              </mark>
            ))}
          </span>

          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </h2>

      <div
        id={panelId}
        role='region'
        aria-labelledby={triggerId}
        className={styles['accordion-panel']}
        hidden={!isOpen}
      >
        {children}
      </div>
    </section>
  )
}
