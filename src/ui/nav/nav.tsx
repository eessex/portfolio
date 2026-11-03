import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItemsFromSettings
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

  return <NavClient title={siteSettings?.title} items={items} />
}
