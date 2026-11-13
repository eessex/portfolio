import { itemTypeToLabel, PagePaths } from '@/lib/schemas'

/** What a project is called, wherever a label shows one */
export const PROJECT_LABEL = itemTypeToLabel(PagePaths.projects, true)
export const PROJECTS_LABEL = itemTypeToLabel(PagePaths.projects)

/** A label site's roster projects (`artistProjectTypes`) */
export const ARTIST_LABEL = 'Artist'
export const ARTISTS_LABEL = 'Artists'
