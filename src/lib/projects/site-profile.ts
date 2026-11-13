import { PROJECT_LABEL } from '@/lib/projects/labels'
import {
  artistProjectTypes,
  isArtistProjectType,
  type ProjectType,
  ProjectTypes
} from '@/lib/projects/schemas'

/**
 * Who the site is, derived from its default project's type (never
 * stored separately): `label` for a `recordLabel`, else `music`.
 * `visual` is reserved for visual artist support; nothing returns it
 * yet.
 */
export const siteKinds = ['label', 'music', 'visual'] as const
export type SiteKind = (typeof siteKinds)[number]

export function siteKindForType(type?: ProjectType): SiteKind {
  return type === ProjectTypes.recordLabel ? 'label' : 'music'
}

/**
 * What differs between site kinds, one record per kind, so a new kind
 * adds a record rather than a branch in each file.
 */
export interface SiteProfile {
  /** the release/event forms' project picker label */
  projectPickerLabel: string
  /** the release form's artist text field label */
  artistFieldLabel: string
  /**
   * Whether new editions start on the house publisher and release
   * lists leave its name out. Artist sites opt out, so their
   * Self-released editions keep showing as they always have.
   */
  isHousePublisherUsed: boolean
}

const musicProfile: SiteProfile = {
  projectPickerLabel: PROJECT_LABEL,
  artistFieldLabel: 'Artist name',
  isHousePublisherUsed: false
}

const siteProfiles: Record<SiteKind, SiteProfile> = {
  label: {
    projectPickerLabel: 'Roster artist',
    artistFieldLabel: 'Credited as',
    isHousePublisherUsed: true
  },
  music: musicProfile,
  // until visual artist support defines its own
  visual: musicProfile
}

export function siteProfile(kind: SiteKind): SiteProfile {
  return siteProfiles[kind]
}

/**
 * Whether a project's dates are shown (and its start date required on
 * save): a label site's roster artists have none, since a roster
 * artist's start or end date has no clear public meaning.
 */
export function isProjectDateShown(
  type: ProjectType | undefined,
  kind: SiteKind
) {
  return !(kind === 'label' && isArtistProjectType(type))
}

/**
 * The project types the `/about` carousel leaves out: a label's
 * roster is at `/artists`, so its carousel keeps to the rest
 * (imprints, event series, shows, and untyped projects). Undefined:
 * none left out.
 */
export function aboutExcludedProjectTypes(kind: SiteKind) {
  return kind === 'label' ? artistProjectTypes : undefined
}
