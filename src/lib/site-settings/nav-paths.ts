import { ABOUT_PATH, PagePaths } from '@/lib/schemas'

/** The menubar's possible items, in default order. */
export const navPaths = [
  PagePaths.events,
  PagePaths.releases,
  PagePaths.projects,
  ABOUT_PATH
] as const
export type NavPath = (typeof navPaths)[number]

export const MAX_NAV_LABEL_LENGTH = 30

export interface NavItemSetting {
  path: NavPath
  /** blank shows the default, e.g. "Events" */
  label?: string
}

/** The menu of a site that never saved one. */
export const DEFAULT_NAV_ITEMS: NavItemSetting[] = [
  { path: PagePaths.events },
  { path: PagePaths.releases },
  { path: ABOUT_PATH }
]
