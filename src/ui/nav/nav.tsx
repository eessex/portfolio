import { fetchCachedEventsFirstPage } from '@/lib/events/cached'
import { fetchCachedDefaultProject } from '@/lib/projects/cached'
import { fetchCachedReleasesFirstPage } from '@/lib/releases/cached'
import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { NavClient } from '@/ui/nav/nav-client'
import {
  type NavItem,
  navItems,
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

async function navItemVisibility(navPath: NavPath) {
  try {
    if (await hasContent[navPath](false))
      return { hasPublishedItems: true }
    if (await hasContent[navPath](true))
      return { hasPublishedItems: false }
  } catch (error) {
    // fail open (show to everyone): a throw takes down every page
    console.error(`Failed to check nav item ${navPath}:`, error)
    return { hasPublishedItems: true }
  }
}

export async function Nav() {
  const [siteSettings, states] = await Promise.all([
    fetchCachedSiteSettings().catch((error) => {
      console.error('Failed to fetch site settings for nav:', error)
      return undefined
    }),
    Promise.all(
      navItems.map(({ navPath }) => navItemVisibility(navPath))
    )
  ])

  const items: NavItem[] = navItems.flatMap((item, i) => {
    const state = states[i]
    return state ? [{ ...item, ...state }] : []
  })

  return <NavClient title={siteSettings?.title} items={items} />
}
