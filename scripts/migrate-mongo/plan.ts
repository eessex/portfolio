/**
 * The plan phase of scripts/migrate-mongo.ts: what Postgres holds
 * (the snapshot), the report, and the planner that resolves each draft
 * to create, reuse or skip. Reads nothing but the snapshot and the
 * old images, so it's tested without a database.
 */
import { randomUUID } from 'node:crypto'

import type { NeonQueryFunction } from '@neondatabase/serverless'
import sharp from 'sharp'
import type { z } from 'zod'

import { createEmbedCodeSchema } from '@/lib/embed-codes/schemas/db'
import { createEventSchema } from '@/lib/events/schemas'
import { createImageSchema } from '@/lib/images/schemas/db'
import { MIN_SHORT_EDGE, rasterUploadFormat } from '@/lib/images/util'
import {
  createLinkSchema,
  createSocialLinkSchema,
  LinkTypes
} from '@/lib/links/schemas/db'
import { projectSchema } from '@/lib/projects/schemas'
import { createPublishedEditionSchema } from '@/lib/published-editions/schemas/db'
import { createReleaseSchema } from '@/lib/releases/schemas'
import { PagePaths } from '@/lib/schemas'
import {
  createSiteSettingsSchema,
  MAX_SOCIAL_LINKS
} from '@/lib/site-settings/schemas'
import { imageKey, publicUrl } from '@/lib/storage/keys'
import { createVenueSchema } from '@/lib/venues/schemas/db'

import {
  type ContentDraft,
  type EmbedRef,
  encodeImageUrl,
  type EventDraft,
  type ImageRef,
  type Issue,
  type LinkRef,
  normalizeAddress,
  normalizeKey,
  oldImageFilename,
  type ProjectDraft,
  type ReleaseDraft,
  type SettingsDraft,
  type VenueDraft
} from './transforms'

export type Sql = NeonQueryFunction<false, false>

// stands in for an id not issued yet while a draft is validated
export const PLACEHOLDER_ID = '00000000-0000-4000-8000-000000000000'

// ------------------------------------------------------------ snapshot

export interface VenueRow {
  id: string
  name?: string
  city: string
  address?: string
  primaryVenueId?: string
  nameKey: string
  cityKey: string
  addressKey: string
}

export interface ProjectRow {
  id: string
  title: string
  slug: string
  isDefaultProject: boolean
}

/** What Postgres holds when the run starts, read once. */
export interface Snapshot {
  isEmpty: boolean
  legacy: Map<string, string>
  imagesByUrl: Map<string, string>
  venues: VenueRow[]
  linksByUrl: Map<string, string>
  /** the footer's: the app looks these up by url and type social */
  socialLinksByUrl: Map<string, string>
  embedsByKey: Map<string, string>
  publishersByName: Map<string, string>
  builtInPublisherId?: string
  projects: ProjectRow[]
  slugs: Record<
    'events' | 'releases' | 'projects',
    Map<string, string>
  >
  eventsByMongoId: Map<string, string>
  siteSettings?: {
    id: string
    title?: string
    description?: string
    coverImageId?: string
    socialLinkIds: string[]
  }
}

export const legacyKey = (source: string, mongoId: string) =>
  `${source}\u0000${mongoId}`
export const embedKey = (embed: { type: string; src: string }) =>
  `${embed.type}|${embed.src}`

export function toVenueRow(
  row: Record<string, string | null>
): VenueRow {
  return {
    id: row.id!,
    name: row.name ?? undefined,
    city: row.city!,
    address: row.address ?? undefined,
    primaryVenueId: row.primary_venue_id ?? undefined,
    nameKey: normalizeKey(row.name),
    cityKey: normalizeKey(row.city),
    addressKey: normalizeAddress(row.address)
  }
}

export function emptySnapshot(): Snapshot {
  return {
    isEmpty: true,
    legacy: new Map(),
    imagesByUrl: new Map(),
    venues: [],
    linksByUrl: new Map(),
    socialLinksByUrl: new Map(),
    embedsByKey: new Map(),
    publishersByName: new Map(),
    projects: [],
    slugs: {
      events: new Map(),
      releases: new Map(),
      projects: new Map()
    },
    eventsByMongoId: new Map()
  }
}

export async function hasLegacyIdsTable(sql: Sql) {
  const [row] = await sql`SELECT to_regclass('legacy_ids') AS t`
  return !!row?.t
}

export async function loadSnapshot(sql: Sql): Promise<Snapshot> {
  const snapshot = emptySnapshot()
  snapshot.isEmpty = false
  type Rows = Record<string, string | null>[]
  if (await hasLegacyIdsTable(sql)) {
    for (const r of (await sql`
      SELECT source, mongo_id, row_id FROM legacy_ids
    `) as Rows) {
      snapshot.legacy.set(
        legacyKey(r.source!, r.mongo_id!),
        r.row_id!
      )
    }
  }
  for (const r of (await sql`SELECT id, url FROM images`) as Rows) {
    snapshot.imagesByUrl.set(r.url!, r.id!)
  }
  snapshot.venues = (
    (await sql`
      SELECT id, name, city, address, primary_venue_id
      FROM venues ORDER BY created_at, id
    `) as Rows
  ).map(toVenueRow)
  for (const r of (await sql`
    SELECT id, url, type FROM links ORDER BY created_at
  `) as Rows) {
    const byUrl =
      r.type === LinkTypes.social
        ? snapshot.socialLinksByUrl
        : snapshot.linksByUrl
    if (!byUrl.has(r.url!)) byUrl.set(r.url!, r.id!)
  }
  for (const r of (await sql`
    SELECT id, src, type FROM embed_codes
  `) as Rows) {
    snapshot.embedsByKey.set(
      embedKey({ type: r.type!, src: r.src! }),
      r.id!
    )
  }
  for (const r of (await sql`
    SELECT id, name, is_built_in FROM publishers
  `) as (Rows[number] & { is_built_in: boolean })[]) {
    snapshot.publishersByName.set(r.name!.toLowerCase(), r.id!)
    if (r.is_built_in) snapshot.builtInPublisherId = r.id!
  }
  snapshot.projects = (
    (await sql`
      SELECT id, title, slug, is_default_project FROM projects
    `) as (Rows[number] & { is_default_project: boolean })[]
  ).map((r) => ({
    id: r.id!,
    title: r.title!,
    slug: r.slug!,
    isDefaultProject: r.is_default_project
  }))
  for (const p of snapshot.projects)
    snapshot.slugs.projects.set(p.slug, p.id)
  for (const r of (await sql`SELECT id, slug FROM releases`) as Rows) {
    snapshot.slugs.releases.set(r.slug!, r.id!)
  }
  for (const r of (await sql`SELECT id, slug, _id FROM events`) as Rows) {
    snapshot.slugs.events.set(r.slug!, r.id!)
    if (r._id) snapshot.eventsByMongoId.set(r._id, r.id!)
  }
  const [settings] = (await sql`
    SELECT id, title, description, cover_image_id, social_link_ids
    FROM site_settings ORDER BY created_at LIMIT 1
  `) as (Rows[number] & { social_link_ids: string[] | null })[]
  if (settings) {
    snapshot.siteSettings = {
      id: settings.id!,
      title: settings.title ?? undefined,
      description: settings.description ?? undefined,
      coverImageId: settings.cover_image_id ?? undefined,
      socialLinkIds: settings.social_link_ids ?? []
    }
  }
  return snapshot
}

// -------------------------------------------------------------- report

export const sections = [
  'Failed',
  'Skipped',
  'Warnings',
  'Lossy conversions',
  'Venues to create',
  'New locations for existing venue names',
  'Publishers to create',
  'Images: small or unsupported',
  'Image URLs used by more than one parent',
  'Tagged links',
  'Seeded legacy ids',
  'Not matched by --seed-legacy-ids',
  'Orphans: referenced by nothing',
  'Copied: a Postgres row has its own copy',
  'Still needed: referenced, not yet copied'
] as const
export type Section = (typeof sections)[number]

export type CountKind =
  | 'create'
  | 'exists'
  | 'reuse'
  | 'skip'
  | 'fail'

export class Report {
  lines = new Map<Section, string[]>()
  counts = new Map<string, Record<CountKind, number>>()
  failures = 0

  add(section: Section, line: string) {
    if (!this.lines.has(section)) this.lines.set(section, [])
    this.lines.get(section)!.push(line)
    if (section === 'Failed') this.failures++
  }

  count(table: string, kind: CountKind) {
    if (!this.counts.has(table)) {
      this.counts.set(table, {
        create: 0,
        exists: 0,
        reuse: 0,
        skip: 0,
        fail: 0
      })
    }
    this.counts.get(table)![kind]++
  }

  issues(label: string, issues: Issue[], lossy: string[] = []) {
    const section: Record<Issue['level'], Section> = {
      fail: 'Failed',
      skip: 'Skipped',
      warn: 'Warnings'
    }
    for (const issue of issues) {
      this.add(section[issue.level], `${label}: ${issue.message}`)
    }
    for (const line of lossy)
      this.add('Lossy conversions', `${label}: ${line}`)
  }

  toString(title: string) {
    const out = [title, '']
    if (this.counts.size) {
      out.push(
        'Counts (create / already migrated / reuse / skip / fail)'
      )
      for (const [table, c] of this.counts) {
        out.push(
          `  ${table.padEnd(20)} ${c.create} / ${c.exists} / ${c.reuse} / ${c.skip} / ${c.fail}`
        )
      }
      out.push('')
    }
    for (const section of sections) {
      const lines = this.lines.get(section)
      if (!lines?.length) continue
      out.push(`${section} (${lines.length})`)
      for (const line of lines) {
        out.push(`  - ${line.replace(/\n/g, '\n    ')}`)
      }
      out.push('')
    }
    return out.join('\n')
  }
}

// ---------------------------------------------------------------- plan

export interface NewImage {
  id: string
  oldUrl: string
  key: string
  contentType: string
  bytes: Buffer
  row: z.infer<typeof createImageSchema>
}
export interface NewVenue {
  id: string
  key: string
  row: z.infer<typeof createVenueSchema>
}
export interface NewPublisher {
  id: string
  name: string
}
export interface NewEmbed {
  id: string
  embed: EmbedRef
}
export interface NewLink {
  id: string
  row: z.infer<typeof createLinkSchema>
}
export interface PageRelations {
  imageIds: string[]
  embedCodeIds: string[]
  linkIds: string[]
}
export interface NewProject extends PageRelations {
  id: string
  draft: ProjectDraft
  source: 'projects' | 'pages'
}
export interface NewRelease extends PageRelations {
  id: string
  draft: ReleaseDraft
  projectId: string
  artist: string
  editions: {
    id: string
    publisherId: string
    format: string
    publishDate: string
  }[]
}
export interface NewEvent extends PageRelations {
  id: string
  draft: EventDraft
  projectId?: string
  venueId: string
}
export interface SettingsWrite {
  draft: SettingsDraft
  existingId?: string
  coverImageId?: string
  socialLinkIds: string[]
}
export interface LegacyRecord {
  source: string
  mongoId: string
  table: string
  rowId: string
}

export interface Plan {
  images: NewImage[]
  venues: NewVenue[]
  publishers: NewPublisher[]
  embeds: NewEmbed[]
  links: NewLink[]
  projects: NewProject[]
  releases: NewRelease[]
  events: NewEvent[]
  settings?: SettingsWrite
  records: LegacyRecord[]
}

/** legacy_ids source: social links are keyed apart from the rest. */
export function linkSource(type?: string) {
  return type === LinkTypes.social ? 'social_link' : 'link'
}

export function zodMessage(error: z.ZodError) {
  return error.issues
    .map((i) => `${i.path.join('.') || '(row)'} ${i.message}`)
    .join('; ')
}

export async function downloadOldImage(url: string): Promise<Buffer> {
  const encoded = encodeImageUrl(url)
  let res = await fetch(encoded)
  if ((res.status === 403 || res.status === 404) && encoded !== url) {
    res = await fetch(url)
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

export class Planner {
  plan: Plan = {
    images: [],
    venues: [],
    publishers: [],
    embeds: [],
    links: [],
    projects: [],
    releases: [],
    events: [],
    records: []
  }
  // old url → row id, or null once it failed
  private imageIds = new Map<string, string | null>()
  private venueIds = new Map<string, string>()
  private venueRows: VenueRow[]
  private publisherIds = new Map<string, string>()
  private embedIds = new Map<string, string>()
  private linkIds = new Map<string, string>()
  projectIds = new Map<string, string>()
  private projectTitles = new Map<string, string>()
  defaultProjectId?: string

  constructor(
    private snapshot: Snapshot,
    private report: Report,
    private isDryRun: boolean
  ) {
    this.venueRows = [...snapshot.venues]
    for (const [name, id] of snapshot.publishersByName) {
      this.publisherIds.set(name, id)
    }
    for (const p of snapshot.projects) {
      this.projectTitles.set(p.id, p.title)
      if (p.isDefaultProject) this.defaultProjectId = p.id
    }
    for (const [key, rowId] of snapshot.legacy) {
      const [source, mongoId] = key.split('\u0000')
      if (source === 'projects') this.projectIds.set(mongoId, rowId)
    }
  }

  legacy(source: string, mongoId: string) {
    return this.snapshot.legacy.get(legacyKey(source, mongoId))
  }

  private storedUrl(key: string) {
    try {
      return publicUrl(key)
    } catch {
      // no storage env: fine for a dry run, and a real run stops
      // before apply when it has files to upload
      return `https://storage.invalid/${key}`
    }
  }

  async image(
    ref: ImageRef,
    label: string
  ): Promise<string | undefined> {
    const known = this.imageIds.get(ref.url)
    if (known !== undefined) return known ?? undefined
    const existing =
      this.legacy('image', ref.url) ??
      this.snapshot.imagesByUrl.get(ref.url)
    if (existing) {
      this.report.count('images', 'reuse')
      this.imageIds.set(ref.url, existing)
      return existing
    }
    try {
      const bytes = await downloadOldImage(ref.url)
      const metadata = await sharp(bytes).metadata()
      const format = metadata.format
      const upload = rasterUploadFormat(format)
      if (!format || !upload) {
        this.report.add(
          'Images: small or unsupported',
          `${ref.url}: unsupported format ${format ?? 'unknown'} (skipped, used by ${label})`
        )
        throw new Error(`unsupported format ${format ?? 'unknown'}`)
      }
      const width = metadata.width
      const height = metadata.pageHeight ?? metadata.height
      if (!width || !height) throw new Error('no dimensions')
      if (Math.min(width, height) < MIN_SHORT_EDGE) {
        this.report.add(
          'Images: small or unsupported',
          `${ref.url}: ${width}×${height}, short edge under ${MIN_SHORT_EDGE}px (kept)`
        )
      }
      const id = randomUUID()
      const key = imageKey(id, format)
      const parsed = createImageSchema.safeParse({
        id,
        url: this.storedUrl(key),
        aspect: width / height,
        caption: ref.caption,
        type: ref.type,
        format,
        width,
        height,
        originalFilename: oldImageFilename(ref.url)
      })
      if (!parsed.success) throw new Error(zodMessage(parsed.error))
      this.plan.images.push({
        id,
        oldUrl: ref.url,
        key,
        contentType: upload.contentType,
        bytes,
        row: parsed.data
      })
      this.report.count('images', 'create')
      this.imageIds.set(ref.url, id)
      return id
    } catch (err) {
      this.report.count('images', 'skip')
      this.report.add(
        'Skipped',
        `${label}: image ${ref.url}: ${(err as Error).message}`
      )
      this.imageIds.set(ref.url, null)
    }
  }

  venue(venue: VenueDraft, label: string): string | undefined {
    const known =
      this.venueIds.get(venue.key) ?? this.legacy('venue', venue.key)
    if (known) {
      this.venueIds.set(venue.key, known)
      return known
    }
    const [cityKey, addressKey] = venue.locationKey.split('|')
    // a name is what ties locations together: an unnamed venue
    // matches only the same place, and is no other's location
    const sameName = venue.nameKey
      ? this.venueRows.filter((r) => r.nameKey === venue.nameKey)
      : []
    const match = venue.nameKey
      ? sameName.find(
          (r) =>
            r.cityKey === cityKey &&
            (r.addressKey === addressKey ||
              !r.addressKey ||
              !addressKey)
        )
      : this.venueRows.find(
          (r) =>
            !r.nameKey &&
            r.cityKey === cityKey &&
            r.addressKey === addressKey
        )
    if (match) {
      this.report.count('venues', 'reuse')
      this.venueIds.set(venue.key, match.id)
      return match.id
    }
    const primary =
      sameName.find((r) => !r.primaryVenueId) ?? sameName[0]
    const id = randomUUID()
    const parsed = createVenueSchema.safeParse({
      // every location of one venue shares its first spelling
      name: primary?.name ?? venue.name,
      address: venue.address,
      city: venue.city,
      state: venue.state,
      country: venue.country,
      timezone: venue.timezone,
      primaryVenueId: primary
        ? (primary.primaryVenueId ?? primary.id)
        : undefined
    })
    if (!parsed.success) {
      this.report.count('venues', 'fail')
      this.report.add(
        'Failed',
        `${label}: venue ${venue.name ?? venue.city}: ${zodMessage(parsed.error)}`
      )
      return
    }
    const where = [
      venue.address,
      venue.city,
      venue.state,
      venue.country
    ]
      .filter(Boolean)
      .join(', ')
    if (primary) {
      this.report.add(
        'New locations for existing venue names',
        `${parsed.data.name}: ${where} (other locations: ${sameName.map((r) => [r.address, r.city].filter(Boolean).join(', ')).join('; ')})`
      )
    } else {
      this.report.add(
        'Venues to create',
        `${parsed.data.name ?? '(no name)'}: ${where} (${venue.timezone}${venue.isTimezoneGuessed ? ', guessed' : ''})`
      )
    }
    this.plan.venues.push({ id, key: venue.key, row: parsed.data })
    this.venueRows.push({
      id,
      name: parsed.data.name,
      city: venue.city,
      address: venue.address,
      primaryVenueId: parsed.data.primaryVenueId,
      nameKey: venue.nameKey,
      cityKey,
      addressKey
    })
    this.venueIds.set(venue.key, id)
    this.report.count('venues', 'create')
    return id
  }

  publisher(name: string | undefined): string | undefined {
    if (!name) {
      if (this.snapshot.builtInPublisherId) {
        return this.snapshot.builtInPublisherId
      }
      // planning against an empty database
      if (this.snapshot.isEmpty) return PLACEHOLDER_ID
      return
    }
    const lower = name.toLowerCase()
    const known = this.publisherIds.get(lower)
    if (known) return known
    const id = randomUUID()
    this.plan.publishers.push({ id, name })
    this.publisherIds.set(lower, id)
    this.report.add('Publishers to create', name)
    this.report.count('publishers', 'create')
    return id
  }

  embed(embed: EmbedRef, label: string): string | undefined {
    const key = embedKey(embed)
    const known =
      this.embedIds.get(key) ??
      this.snapshot.embedsByKey.get(key) ??
      this.legacy('embed_code', key)
    if (known) {
      this.embedIds.set(key, known)
      return known
    }
    const parsed = createEmbedCodeSchema.safeParse(embed)
    if (!parsed.success) {
      this.report.add(
        'Skipped',
        `${label}: embed code ${embed.src}: ${zodMessage(parsed.error)}`
      )
      return
    }
    const id = randomUUID()
    this.plan.embeds.push({ id, embed })
    this.embedIds.set(key, id)
    this.report.count('embed_codes', 'create')
    return id
  }

  link(link: LinkRef, label: string): string | undefined {
    // footer links stay apart: the app finds them by url and type
    const isSocial = link.type === LinkTypes.social
    const source = linkSource(link.type)
    const key = `${source}|${link.url}`
    const known =
      this.linkIds.get(key) ??
      (isSocial
        ? this.snapshot.socialLinksByUrl
        : this.snapshot.linksByUrl
      ).get(link.url) ??
      this.legacy(source, link.url)
    if (known) {
      this.linkIds.set(key, known)
      return known
    }
    const parsed = (
      isSocial ? createSocialLinkSchema : createLinkSchema
    ).safeParse({
      url: link.url,
      title: link.title,
      type: link.type
    })
    if (!parsed.success) {
      this.report.add(
        'Skipped',
        `${label}: link ${link.url}: ${zodMessage(parsed.error)}`
      )
      return
    }
    const id = randomUUID()
    if (link.type) {
      this.report.add(
        'Tagged links',
        `${link.type}: ${link.title ?? '(no title)'} ${link.url}${link.isFromDescription ? ' (from description)' : ''}`
      )
    }
    this.plan.links.push({ id, row: parsed.data })
    this.linkIds.set(key, id)
    this.report.count('links', 'create')
    return id
  }

  async relations(
    draft: Pick<ContentDraft, 'images' | 'embeds' | 'links'>,
    label: string
  ): Promise<PageRelations> {
    const imageIds: string[] = []
    for (const ref of draft.images) {
      const id = await this.image(ref, label)
      if (id && !imageIds.includes(id)) imageIds.push(id)
    }
    const ids = (values: (string | undefined)[]) => [
      ...new Set(values.filter((v): v is string => !!v))
    ]
    return {
      imageIds,
      embedCodeIds: ids(
        draft.embeds.map((e) => this.embed(e, label))
      ),
      linkIds: ids(draft.links.map((l) => this.link(l, label)))
    }
  }

  /** The first of an item's Mongo projects that maps to a row. */
  mappedProject(mongoIds: string[], label: string) {
    const id = mongoIds
      .map((m) => this.projectIds.get(m))
      .find(Boolean)
    if (!id && mongoIds.length) {
      this.report.add(
        'Warnings',
        `${label}: project ${mongoIds.join(', ')} isn't migrated (run --seed-legacy-ids, or migrate projects first)`
      )
    }
    return id
  }

  projectTitle(id: string) {
    return this.projectTitles.get(id)
  }

  addProject(id: string, title: string, isDefault: boolean) {
    this.projectTitles.set(id, title)
    if (isDefault) this.defaultProjectId = id
  }

  hasBuiltInPublisher() {
    return !!this.snapshot.builtInPublisherId || this.snapshot.isEmpty
  }

  /** An event the first migration made, which kept `_id` only. */
  firstMigrationEventId(mongoId: string) {
    return this.snapshot.eventsByMongoId.get(mongoId)
  }

  isSlugTaken(
    table: 'events' | 'releases' | 'projects',
    slug: string
  ) {
    return this.snapshot.slugs[table].has(slug)
  }
}

export function itemLabel(
  source: string,
  draft: { mongoId: string; title?: string }
) {
  return `${source} ${draft.mongoId}${draft.title ? ` "${draft.title}"` : ''}`
}

export function hasFailed(issues: Issue[]) {
  return issues.some((issue) => issue.level === 'fail')
}

export async function planProjects(
  planner: Planner,
  report: Report,
  drafts: { draft: ProjectDraft; source: 'projects' | 'pages' }[]
) {
  for (const { draft, source } of drafts) {
    const label = itemLabel(source, draft)
    report.issues(label, draft.issues, draft.lossy)
    if (hasFailed(draft.issues)) {
      report.count('projects', 'fail')
      continue
    }
    const migrated = planner.legacy(source, draft.mongoId)
    if (migrated) {
      if (source === 'projects')
        planner.projectIds.set(draft.mongoId, migrated)
      report.count('projects', 'exists')
      continue
    }
    if (draft.isDefaultProject && planner.defaultProjectId) {
      report.count('projects', 'skip')
      report.add(
        'Skipped',
        `${label}: a default project already exists`
      )
      continue
    }
    if (planner.isSlugTaken('projects', draft.slug)) {
      report.count('projects', 'skip')
      report.add(
        'Skipped',
        `${label}: slug "${draft.slug}" is taken; kept the existing row`
      )
      continue
    }
    const parsed = projectSchema
      .omit({ id: true, createdAt: true, updatedAt: true })
      .safeParse({
        title: draft.title,
        slug: draft.slug,
        description: draft.description,
        shortDescription: draft.shortDescription,
        isPublished: draft.isPublished,
        startDate: draft.startDate,
        endDate: draft.endDate,
        isDefaultProject: draft.isDefaultProject,
        path: PagePaths.projects
      })
    if (!parsed.success) {
      report.count('projects', 'fail')
      report.add('Failed', `${label}: ${zodMessage(parsed.error)}`)
      continue
    }
    const id = randomUUID()
    const relations = await planner.relations(draft, label)
    planner.plan.projects.push({ id, draft, source, ...relations })
    if (source === 'projects')
      planner.projectIds.set(draft.mongoId, id)
    planner.addProject(id, draft.title, draft.isDefaultProject)
    report.count('projects', 'create')
  }
}

export async function planReleases(
  planner: Planner,
  report: Report,
  drafts: ReleaseDraft[]
) {
  for (const draft of drafts) {
    const label = itemLabel('publications', draft)
    report.issues(label, draft.issues, draft.lossy)
    if (hasFailed(draft.issues)) {
      report.count('releases', 'fail')
      continue
    }
    if (planner.legacy('publications', draft.mongoId)) {
      report.count('releases', 'exists')
      continue
    }
    if (planner.isSlugTaken('releases', draft.slug)) {
      report.count('releases', 'skip')
      report.add(
        'Skipped',
        `${label}: slug "${draft.slug}" is taken; kept the existing row`
      )
      continue
    }
    const projectId =
      planner.mappedProject(draft.mongoProjectIds, label) ??
      planner.defaultProjectId
    if (!projectId) {
      report.count('releases', 'fail')
      report.add(
        'Failed',
        `${label}: no project, and no default project`
      )
      continue
    }
    if (
      draft.editions.some((e) => !e.publisherName) &&
      !planner.hasBuiltInPublisher()
    ) {
      report.count('releases', 'fail')
      report.add(
        'Failed',
        `${label}: no built-in Self-released publisher; run pnpm migrate`
      )
      continue
    }
    const artist =
      draft.artist ?? planner.projectTitle(projectId) ?? draft.title
    // validated before anything it embeds is planned
    const errors = [
      createReleaseSchema.safeParse({
        title: draft.title,
        slug: draft.slug,
        description: draft.description,
        shortDescription: draft.shortDescription,
        isPublished: draft.isPublished,
        artist,
        type: draft.type,
        projectId,
        releaseDate: draft.releaseDate,
        path: PagePaths.releases
      }),
      ...draft.editions.map((edition) =>
        createPublishedEditionSchema.safeParse({
          releaseId: PLACEHOLDER_ID,
          publisherId: PLACEHOLDER_ID,
          format: edition.format,
          publishDate: edition.publishDate
        })
      )
    ].flatMap((result) =>
      result.success ? [] : [zodMessage(result.error)]
    )
    if (errors.length) {
      report.count('releases', 'fail')
      for (const error of errors)
        report.add('Failed', `${label}: ${error}`)
      continue
    }
    const editions = draft.editions.map((edition) => ({
      ...edition,
      id: randomUUID(),
      publisherId: planner.publisher(edition.publisherName)!
    }))
    const relations = await planner.relations(draft, label)
    planner.plan.releases.push({
      id: randomUUID(),
      draft,
      projectId,
      artist,
      editions,
      ...relations
    })
    report.count('releases', 'create')
    for (const _edition of editions) {
      report.count('published_editions', 'create')
    }
  }
}

export async function planEvents(
  planner: Planner,
  report: Report,
  drafts: EventDraft[]
) {
  for (const draft of drafts) {
    const label = itemLabel('events', draft)
    report.issues(label, draft.issues, draft.lossy)
    if (hasFailed(draft.issues) || !draft.venue) {
      report.count('events', 'fail')
      continue
    }
    if (planner.legacy('events', draft.mongoId)) {
      report.count('events', 'exists')
      continue
    }
    const migrated = planner.firstMigrationEventId(draft.mongoId)
    if (migrated) {
      // from the first migration, which kept _id but no legacy row
      planner.plan.records.push({
        source: 'events',
        mongoId: draft.mongoId,
        table: 'events',
        rowId: migrated
      })
      report.count('events', 'exists')
      continue
    }
    if (planner.isSlugTaken('events', draft.slug)) {
      report.count('events', 'skip')
      report.add(
        'Skipped',
        `${label}: slug "${draft.slug}" is taken by an event with another _id; kept the existing row`
      )
      continue
    }
    const projectId = planner.mappedProject(
      draft.mongoProjectIds,
      label
    )
    const parsed = createEventSchema.safeParse({
      title: draft.title,
      slug: draft.slug,
      description: draft.description,
      shortDescription: draft.shortDescription,
      isPublished: draft.isPublished,
      startTime: draft.startTime,
      endTime: draft.endTime,
      projectId,
      venueId: PLACEHOLDER_ID,
      path: PagePaths.events
    })
    if (!parsed.success) {
      report.count('events', 'fail')
      report.add('Failed', `${label}: ${zodMessage(parsed.error)}`)
      continue
    }
    const venueId = planner.venue(draft.venue, label)
    if (!venueId) {
      report.count('events', 'fail')
      continue
    }
    const relations = await planner.relations(draft, label)
    planner.plan.events.push({
      id: randomUUID(),
      draft,
      projectId,
      venueId,
      ...relations
    })
    report.count('events', 'create')
  }
}

export async function planSettings(
  planner: Planner,
  report: Report,
  snapshot: Snapshot,
  draft: SettingsDraft
) {
  const label = itemLabel('settings', draft)
  report.issues(label, draft.issues)
  if (hasFailed(draft.issues)) {
    report.count('site_settings', 'fail')
    return
  }
  if (planner.legacy('settings', draft.mongoId)) {
    report.count('site_settings', 'exists')
    return
  }
  const coverImageId = draft.coverImage
    ? await planner.image(draft.coverImage, label)
    : undefined
  let socialLinkIds = [
    ...new Set(
      draft.socialLinks
        .map((link) => planner.link(link, label))
        .filter((id): id is string => !!id)
    )
  ]
  if (socialLinkIds.length > MAX_SOCIAL_LINKS) {
    report.add(
      'Warnings',
      `${label}: ${socialLinkIds.length} social links; the footer keeps the first ${MAX_SOCIAL_LINKS}`
    )
    socialLinkIds = socialLinkIds.slice(0, MAX_SOCIAL_LINKS)
  }
  const parsed = createSiteSettingsSchema.safeParse({
    title: draft.title,
    description: draft.description,
    coverImageId,
    socialLinkIds
  })
  if (!parsed.success) {
    report.count('site_settings', 'fail')
    report.add('Failed', `${label}: ${zodMessage(parsed.error)}`)
    return
  }
  planner.plan.settings = {
    draft,
    existingId: snapshot.siteSettings?.id,
    coverImageId,
    socialLinkIds
  }
  report.count(
    'site_settings',
    snapshot.siteSettings ? 'reuse' : 'create'
  )
}

export function reportSharedImageUrls(
  report: Report,
  parents: { label: string; images: ImageRef[] }[]
) {
  const users = new Map<string, string[]>()
  for (const { label, images } of parents) {
    for (const image of images) {
      users.set(image.url, [...(users.get(image.url) ?? []), label])
    }
  }
  for (const [url, labels] of users) {
    if (labels.length > 1) {
      report.add(
        'Image URLs used by more than one parent',
        `${url}: ${labels.join('; ')} (check by eye: a re-upload under the same name replaced the first file)`
      )
    }
  }
}
