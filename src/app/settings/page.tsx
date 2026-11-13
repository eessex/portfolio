import type { Metadata } from 'next'
import { Suspense } from 'react'

import styles from '@/app/settings/settings.module.scss'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { navPaths } from '@/lib/site-settings/nav-paths'
import { EditSettings } from '@/ui/form/edit-settings'
import { FormPageLayout } from '@/ui/form/form-page-layout'
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
  // a draft counts: it exists, so there's no About form to go to
  const isAboutCreated =
    navStatuses.about === 'published' ||
    navStatuses.about === 'drafts'

  return (
    <FormPageLayout title={title}>
      {/* One block, so the welcome heading tops the form column,
          level with the title */}
      <div>
        <Suspense fallback={<Loading />}>
          {settings ? (
            <EditSettings
              settings={settings}
              navStatuses={navStatuses}
              isAboutCreated={isAboutCreated}
            />
          ) : (
            <>
              <h2 className={styles.welcome}>
                Welcome! Let&apos;s set up your site:
              </h2>
              <EditSettings isAboutCreated={isAboutCreated} />
            </>
          )}
        </Suspense>
      </div>
    </FormPageLayout>
  )
}

async function fetchNavStatuses(): Promise<NavItemStatuses> {
  const statuses = await Promise.all(navPaths.map(fetchNavItemStatus))
  return Object.fromEntries(
    navPaths.map((path, i) => [path, statuses[i]])
  ) as NavItemStatuses
}
