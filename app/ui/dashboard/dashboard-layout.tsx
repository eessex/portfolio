import styles from '@/ui/dashboard/dashboard.module.scss'

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout ({ children, title }: DashboardLayoutProps) {
  return (
    <div className={styles['dashboard-layout']}>
      <header>
        <h1>
          {title}
        </h1>
      </header>

      {children}
    </div>
  )
}
