import type { Metadata } from 'next'
import { Suspense } from 'react'

import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { navPaths } from '@/lib/site-settings/nav-paths'
import styles from '@/ui/dashboard/dashboard.module.scss'
import { DashboardLayout } from '@/ui/dashboard/dashboard-layout'
import { EditSettings } from '@/ui/form/edit-settings'
import { Loading } from '@/ui/loading'
import type { NavItemStatuses } from '@/ui/nav/nav-items-fields'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

const title = 'Site settings'
export const metadata: Metadata = { title }

export default async function SettingsPage() {
  const [settings, navStatuses] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchNavStatuses()
  ])

  return (
    <DashboardLayout title={title}>
      <Suspense fallback={<Loading />}>
        <section className={styles['dashboard-inner']}>
          {settings ? (
            <EditSettings
              settings={settings}
              navStatuses={navStatuses}
            />
          ) : (
            <>
              <h2>Welcome! Let&apos;s set up your site:</h2>
              <EditSettings />
            </>
          )}
        </section>
      </Suspense>
    </DashboardLayout>
  )
}

async function fetchNavStatuses(): Promise<NavItemStatuses> {
  const statuses = await Promise.all(navPaths.map(fetchNavItemStatus))
  return Object.fromEntries(
    navPaths.map((path, i) => [path, statuses[i]])
  ) as NavItemStatuses
}
