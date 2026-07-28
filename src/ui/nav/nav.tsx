import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { NavClient } from '@/ui/nav/nav-client'

export async function Nav() {
  const siteSettings = await fetchCachedSiteSettings()

  return <NavClient title={siteSettings?.title} />
}
