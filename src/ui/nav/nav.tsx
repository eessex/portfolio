import { fetchSiteSettings } from '@/lib/site-settings/data'
import { NavClient } from '@/ui/nav/nav-client'

export async function Nav() {
  const siteSettings = await fetchSiteSettings()

  return <NavClient title={siteSettings?.title} />
}
