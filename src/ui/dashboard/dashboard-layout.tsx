import type { EmbeddedItemType } from '@/lib/schemas'
import { CreateItemButton } from '@/ui/buttons/create-item-button'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { dashboardUrl, newUrl } from '@/ui/routes'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  /** Offers "New {type}" in the header */
  itemType?: EmbeddedItemType
  /** The page's own header buttons */
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  itemType,
  actions
}: Omit<DashboardLayoutProps, 'children'>) {
  return (
    <header className={styles['dashboard-header']}>
      <h1>{title}</h1>
      {itemType && (
        <CreateItemButton
          className='button-outline'
          itemType={itemType}
          href={newUrl(dashboardUrl(itemType))}
        />
      )}
      {actions && (
        <div className={styles['dashboard-actions']}>{actions}</div>
      )}
    </header>
  )
}

export function DashboardLayout({
  children,
  title,
  itemType,
  actions
}: DashboardLayoutProps) {
  return (
    <div className={styles['dashboard-layout']}>
      <DashboardHeader
        title={title}
        itemType={itemType}
        actions={actions}
      />
      {children}
    </div>
  )
}
