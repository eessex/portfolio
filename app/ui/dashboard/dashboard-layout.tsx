'use client'

import type { EmbeddedItemKey } from '@/lib/actions'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { PlusIcon } from '@heroicons/react/24/outline'

export type OpenNewItemFormDetail = { itemType: EmbeddedItemKey }

interface DashboardLayoutProps {
  children: React.ReactNode
  itemType?: EmbeddedItemKey
  title: string
}

export function DashboardLayout ({ children, itemType, title }: DashboardLayoutProps) {
  function onclick () {
    if (!itemType) return
    const event = new CustomEvent<OpenNewItemFormDetail>('openNewItemForm', { detail: { itemType } })
    document.dispatchEvent(event)
  }

  return (
    <div className={styles['dashboard-layout']}>
      <header>
        <h1>
          {title}
        </h1>

        {itemType && (
          <button className={`button sm ${styles['dashboard-new-item']}`} onClick={onclick}>
            <PlusIcon /> Add {itemType}
          </button>
        )}
      </header>

      <div>
        {children}
      </div>
    </div>
  )
}
