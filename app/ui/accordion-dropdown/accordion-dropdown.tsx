'use client'

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useEffect, useId, useState } from 'react'
import styles from '@/ui/accordion-dropdown/accordion-dropdown.module.scss'

export function AccordionDropdown ({
  title,
  children,
  isExpanded
}: {
  title: string,
  children: React.ReactNode,
  isExpanded?: boolean
}) {
  const triggerId = useId()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(isExpanded || false)

  useEffect(() => {
    setIsOpen(isExpanded || false)
  }, [isExpanded])

  return (
    <section className={styles['accordion-dropdown']}>
      <h3>
        <button
          aria-expanded={isOpen}
          className={styles['accordion-trigger']}
          aria-controls={panelId}
          id={triggerId}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className='accordion-title'>
            {title}
          </span>

          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
      </h3>

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
