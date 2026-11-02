import {
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
}

const musicProfile: SiteProfile = {
  projectPickerLabel: 'Project',
  artistFieldLabel: 'Artist name'
}

const siteProfiles: Record<SiteKind, SiteProfile> = {
  label: {
    projectPickerLabel: 'Roster artist',
    artistFieldLabel: 'Credited as'
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
