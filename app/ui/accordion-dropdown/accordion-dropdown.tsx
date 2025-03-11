'use client'

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useId, useState } from 'react'
import styles from '@/ui/accordion-dropdown/accordion-dropdown.module.scss'

export default function AccordionDropdown ({ title, children }: { title: string, children: React.ReactNode }) {
  const triggerId = useId()
  const panelId = useId()
  const [isOpen, setIsOpen] = useState(false)

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
