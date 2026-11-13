import type { Metadata } from 'next'
import { Suspense } from 'react'

import styles from '@/app/settings/settings.module.scss'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { siteIdentity } from '@/lib/projects/site-identity'
import type { SiteKind } from '@/lib/projects/site-profile'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { siteNavPaths } from '@/lib/site-settings/nav-paths'
import { EditSettings } from '@/ui/form/edit-settings'
import { FormPageLayout } from '@/ui/form/form-page-layout'
import { Loading } from '@/ui/loading'
import type { NavItemStatuses } from '@/ui/nav/nav-items-fields'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

const title = 'Site settings'
export const metadata: Metadata = { title }

export default async function SettingsPage() {
  const { kind } = await siteIdentity()
  const [settings, navStatuses] = await Promise.all([
    fetchCachedSiteSettings(),
    fetchNavStatuses(kind)
  ])
  // a draft counts: it exists, so there's no About form to go to
  const isAboutCreated =
    navStatuses.about === 'published' ||
    navStatuses.about === 'drafts'
  // first run: the site title starts from the About page's, which
  // setup has just created
  const defaultTitle = settings
    ? undefined
    : (await fetchCachedDefaultProject(true))?.title

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
              siteKind={kind}
              isAboutCreated={isAboutCreated}
            />
          ) : (
            <>
              <h2 className={styles.welcome}>
                {isAboutCreated
                  ? 'Next, set up your site:'
                  : 'Welcome! Let’s set up your site:'}
              </h2>
              <EditSettings
                siteKind={kind}
                isAboutCreated={isAboutCreated}
                defaultTitle={defaultTitle}
              />
            </>
          )}
        </Suspense>
      </div>
    </FormPageLayout>
  )
}

async function fetchNavStatuses(
  kind: SiteKind
): Promise<NavItemStatuses> {
  const paths = siteNavPaths(kind)
  const statuses = await Promise.all(paths.map(fetchNavItemStatus))
  return Object.fromEntries(
    paths.map((path, i) => [path, statuses[i]])
  ) as NavItemStatuses
}
