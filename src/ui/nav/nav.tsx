import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
  type NavItemStatus,
  type NavPath
} from '@/ui/nav/nav-items'

// isAuthed is a cache key and filter here, not a session read
const hasContent: Record<
  NavPath,
  (isAuthed: boolean) => Promise<boolean>
> = {
  events: async (isAuthed) =>
    (await fetchCachedEventsFirstPage(isAuthed)).totalCount > 0,
  releases: async (isAuthed) =>
    (await fetchCachedReleasesFirstPage(isAuthed)).totalCount > 0,
  about: async (isAuthed) =>
    !!(await fetchCachedDefaultProject(isAuthed))
}

async function navItemVisibility(
  navPath: NavPath
): Promise<NavItemStatus> {
  try {
    if (await hasContent[navPath](false)) return 'published'
    if (await hasContent[navPath](true)) return 'drafts'
    return 'empty'
  } catch (error) {
    // fail open (show to everyone): a throw takes down every page
    console.error(`Failed to check nav item ${navPath}:`, error)
    return 'published'
  }
}

export async function Nav() {
  const [siteSettings, statuses] = await Promise.all([
    fetchCachedSiteSettings().catch((error) => {
      console.error('Failed to fetch site settings for nav:', error)
      return undefined
    }),
    Promise.all(
      navItems.map(({ navPath }) => navItemVisibility(navPath))
    )
  ])

  const items: NavItem[] = navItems.map((item, i) => ({
    ...item,
    status: statuses[i]
  }))

  return <NavClient title={siteSettings?.title} items={items} />
}
