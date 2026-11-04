import { Suspense } from 'react'

import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { AdminMenu } from '@/ui/nav/admin-menu'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItemsFromSettings,
  navPaths
} from '@/ui/nav/nav-items'
import { fetchNavItemStatus } from '@/ui/nav/nav-status'

export async function Nav() {
  const siteSettings = await fetchCachedSiteSettings().catch(
    (error) => {
      console.error('Failed to fetch site settings for nav:', error)
      return undefined
    }
  )
  const shownItems = navItemsFromSettings(siteSettings?.navItems)
  const statuses = await Promise.all(
    shownItems.map(({ navPath }) => fetchNavItemStatus(navPath))
  )

  const items: NavItem[] = shownItems.flatMap((item, i) => {
    const status = statuses[i]
    return status ? [{ ...item, status }] : []
  })

  const hiddenNavPaths = navPaths.filter(
    (navPath) => !shownItems.some((item) => item.navPath === navPath)
  )

  return (
    <NavClient
      title={siteSettings?.title}
      items={items}
      adminMenu={
        <Suspense fallback={null}>
          <AdminMenu hiddenNavPaths={hiddenNavPaths} />
        </Suspense>
      }
    />
  )
}
