import type { EmbeddedItemType } from '@/lib/schemas'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { dashboardUrl, newUrl } from '@/ui/routes'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  /** Offers "New {type}" in the header */
  itemType?: EmbeddedItemType
}

export function DashboardHeader({
  title,
  itemType
}: Omit<DashboardLayoutProps, 'children'>) {
  return (
    <header className={styles['dashboard-header']}>
      <h1>{title}</h1>
      {itemType && (
        <CreateItemButton
          className='button-primary'
          itemType={itemType}
          href={newUrl(dashboardUrl(itemType))}
        />
      )}
    </header>
  )
}

export function DashboardLayout({
  children,
  title,
  itemType
}: DashboardLayoutProps) {
  return (
    <div className={styles['dashboard-layout']}>
      <DashboardHeader title={title} itemType={itemType} />
      {children}
    </div>
  )
}
