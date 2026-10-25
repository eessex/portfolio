/**
 * Migrates the old site's Mongo data into Postgres (see the "Mongo →
 * Postgres Migration Plan" doc).
 *
 *   pnpm run migrate-mongo --input <dir> --dry-run
 *   pnpm run migrate-mongo --input <dir> [--only events] [--ids <id,id>]
 *   pnpm run migrate-mongo --input <dir> --seed-legacy-ids [--dry-run]
 *   pnpm run migrate-mongo --input <dir> --report-orphans --bucket <name>
 *
 * <dir> holds one `mongoexport --jsonArray` file per collection
 * (events.json, projects.json, publications.json, pages.json,
 * settings.json; missing ones are skipped), plus optional JSON
 * files the dry runs settle:
 *   venue-aliases.json    { "old spelling": "Canonical Name" }
 *   venue-locations.json  { "Canonical Name": { "address", "city",
 *                         "state", "country" } }, one place for
 *                         every location of that name
 *   skip-ids.json         { "<mongo id>": "why it's left out" }
 * The
 * script never connects to Mongo, and writes a report into
 * <dir>/reports on every run.
 *
 * Phases: transform each document to row drafts, plan each against
 * legacy_ids and the find-or-create keys (create, reuse or skip),
 * report, then apply. Embedded items go in first (venues, publishers,
 * images, embed codes, links) so no parent ever lists a row that
 * failed, then projects → releases + editions → events → site
 * settings. Each row goes in one transaction with its legacy_ids row,
 * after its files are uploaded, so a re-run is a no-op.
 *
 * Like copy-storage: direct SQL, no server actions, safe to stop and
 * re-run, never deletes or overwrites anything. It can't invalidate
 * cache tags: redeploy afterwards. A --dry-run without DATABASE_URL
 * plans against an empty database.
 */
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { neon } from '@neondatabase/serverless'

import { fetchEmbedCodeMetadata } from '@/lib/embed-codes/cover-image'
import { imageAspect } from '@/lib/images/util'
import { storageAdapter } from '@/lib/storage'
import { IMAGE_PATH_PREFIX, publicUrl } from '@/lib/storage/keys'

import {
  embedKey,
  emptySnapshot,
  hasLegacyIdsTable,
  itemLabel,
  legacyKey,
  type LegacyRecord,
  linkSource,
  loadSnapshot,
  type Plan,
  planEvents,
  Planner,
  planProjects,
  planReleases,
  planSettings,
  Report,
  reportSharedImageUrls,
  type Sql
} from './migrate-mongo/plan'
import {
  clean,
  type Collection,
  collections,
  defaultVenueAliases,
  type MongoDoc,
  normalizeAliases,
  normalizeVenueLocations,
  oldImageKey,
  parseMongoExport,
  toDefaultProject,
  toEvent,
  toProject,
  toRelease,
  toSettings,
  type VenueLocation
} from './migrate-mongo/transforms'

const onlyTypes = [
  'events',
  'releases',
  'projects',
  'settings'
] as const
type OnlyType = (typeof onlyTypes)[number]

// ---------------------------------------------------------------- args

interface Args {
  input: string
  isDryRun: boolean
  only?: OnlyType
  ids?: Set<string>
  isSeed: boolean
  isOrphans: boolean
  bucket?: string
  region: string
}

function usage(message?: string): never {
  if (message) console.error(message)
  console.error(
    'Usage: pnpm run migrate-mongo --input <dir> [--dry-run] [--only events|releases|projects|settings] [--ids <id,id>]\n' +
      '       pnpm run migrate-mongo --input <dir> --seed-legacy-ids [--dry-run]\n' +
      '       pnpm run migrate-mongo --input <dir> --report-orphans --bucket <name> [--region us-east-1]'
  )
  process.exit(1)
}

function parseArgs(argv = process.argv.slice(2)): Args {
  const value = (flag: string) => {
    const i = argv.indexOf(flag)
    if (i === -1) return
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) usage(`${flag} needs a value`)
    return next
  }
  const input = value('--input')
  if (!input) usage('Missing --input')
  const only = value('--only')
  if (only && !onlyTypes.includes(only as OnlyType)) {
    usage(`Unknown --only ${only}`)
  }
  // ids: comma-separated, or space-separated up to the next flag
  let ids: Set<string> | undefined
  const idsAt = argv.indexOf('--ids')
  if (idsAt !== -1) {
    const values: string[] = []
    for (const arg of argv.slice(idsAt + 1)) {
      if (arg.startsWith('--')) break
      values.push(...arg.split(',').filter(Boolean))
    }
    if (!values.length) usage('--ids needs at least one id')
    ids = new Set(values)
  }
  const isSeed = argv.includes('--seed-legacy-ids')
  const isOrphans = argv.includes('--report-orphans')
  if (isSeed && isOrphans) {
    usage('Use --seed-legacy-ids and --report-orphans separately')
  }
  const bucket = value('--bucket')
  if (isOrphans && !bucket) usage('--report-orphans needs --bucket')
  return {
    input: path.resolve(input),
    isDryRun: argv.includes('--dry-run'),
    only: only as OnlyType | undefined,
    ids,
    isSeed,
    isOrphans,
    bucket,
    region: value('--region') ?? 'us-east-1'
  }
}

// --------------------------------------------------------------- input

type Export = Record<Collection, MongoDoc[]>

async function loadExport(dir: string): Promise<Export> {
  const data = {} as Export
  for (const collection of collections) {
    const file = path.join(dir, `${collection}.json`)
    try {
      data[collection] = parseMongoExport(
        await readFile(file, 'utf8')
      )
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
      data[collection] = []
    }
  }
  return data
}

/** An optional JSON file in the export folder, or its fallback. */
async function loadConfig<T>(dir: string, file: string, fallback: T) {
  try {
    return JSON.parse(
      await readFile(path.join(dir, file), 'utf8')
    ) as T
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    return fallback
  }
}

async function loadVenueConfig(dir: string) {
  return {
    aliases: normalizeAliases({
      ...defaultVenueAliases,
      ...(await loadConfig<Record<string, string>>(
        dir,
        'venue-aliases.json',
        {}
      ))
    }),
    locations: normalizeVenueLocations(
      await loadConfig<Record<string, VenueLocation>>(
        dir,
        'venue-locations.json',
        {}
      )
    )
  }
}

async function writeReport(
  args: Args,
  report: Report,
  title: string
) {
  const text = report.toString(title)
  console.info(text)
  const dir = path.join(args.input, 'reports')
  await mkdir(dir, { recursive: true })
  const file = path.join(
    dir,
    `migrate-mongo-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`
  )
  await writeFile(file, text)
  console.info(`Report written to ${file}`)
}

// --------------------------------------------------------------- apply

function recordQuery(sql: Sql, r: LegacyRecord) {
  return sql`
    INSERT INTO legacy_ids (source, mongo_id, table_name, row_id)
    VALUES (${r.source}, ${r.mongoId}, ${r.table}, ${r.rowId})
    ON CONFLICT (source, mongo_id) DO NOTHING
  `
}

async function apply(sql: Sql, plan: Plan, report: Report) {
  const failed = new Set<string>()

  async function attempt(
    id: string,
    label: string,
    run: () => Promise<void>
  ) {
    try {
      await run()
      return true
    } catch (err) {
      failed.add(id)
      report.add('Failed', `${label}: ${(err as Error).message}`)
      return false
    }
  }

  /** Drops ids whose row failed, so a parent never lists a missing row. */
  function kept(ids: string[], label: string) {
    const ok = ids.filter((id) => !failed.has(id))
    if (ok.length < ids.length) {
      report.add(
        'Warnings',
        `${label}: saved without ${ids.length - ok.length} embedded item(s) that failed`
      )
    }
    return ok
  }

  for (const r of plan.records) {
    await attempt(
      r.rowId,
      `legacy id ${r.source} ${r.mongoId}`,
      async () => {
        await recordQuery(sql, r)
      }
    )
  }

  for (const image of plan.images) {
    await attempt(image.id, `image ${image.oldUrl}`, async () => {
      await storageAdapter().put(
        image.key,
        image.bytes,
        image.contentType
      )
      const { row } = image
      await sql.transaction([
        sql`
          INSERT INTO images (
            id, url, aspect, caption, type, format, width, height,
            original_filename
          ) VALUES (
            ${image.id}, ${row.url}, ${Number(imageAspect(row).toFixed(4))},
            ${row.caption ?? null}, ${row.type ?? null}, ${row.format!},
            ${row.width!}, ${row.height!}, ${row.originalFilename ?? null}
          )
        `,
        recordQuery(sql, {
          source: 'image',
          mongoId: image.oldUrl,
          table: 'images',
          rowId: image.id
        })
      ])
      console.info(`  image ${image.oldUrl} → ${image.key}`)
    })
  }

  for (const venue of plan.venues) {
    const { row } = venue
    await attempt(
      venue.id,
      `venue ${row.name ?? row.city}`,
      async () => {
        if (row.primaryVenueId && failed.has(row.primaryVenueId)) {
          throw new Error('its primary location failed')
        }
        await sql.transaction([
          sql`
          INSERT INTO venues (
            id, name, address, city, state, country, timezone,
            primary_venue_id
          ) VALUES (
            ${venue.id}, ${row.name ?? null}, ${row.address ?? null},
            ${row.city}, ${row.state ?? null}, ${row.country ?? null},
            ${row.timezone}, ${row.primaryVenueId ?? null}
          )
        `,
          recordQuery(sql, {
            source: 'venue',
            mongoId: venue.key,
            table: 'venues',
            rowId: venue.id
          })
        ])
      }
    )
  }

  for (const publisher of plan.publishers) {
    await attempt(
      publisher.id,
      `publisher ${publisher.name}`,
      async () => {
        await sql.transaction([
          sql`
          INSERT INTO publishers (id, name)
          VALUES (${publisher.id}, ${publisher.name})
        `,
          recordQuery(sql, {
            source: 'publisher',
            mongoId: publisher.name.toLowerCase(),
            table: 'publishers',
            rowId: publisher.id
          })
        ])
      }
    )
  }

  for (const { id, embed } of plan.embeds) {
    await attempt(id, `embed code ${embed.src}`, async () => {
      // uploads its cover to the active storage; never throws
      const { coverImageId, title } = await fetchEmbedCodeMetadata(
        embed.host,
        embed.src
      )
      if (!coverImageId) {
        report.add(
          'Warnings',
          `embed code ${embed.src}: no cover image (oEmbed failed or unsupported host)`
        )
      }
      await sql.transaction([
        sql`
          INSERT INTO embed_codes (id, src, type, host, title, cover_image_id)
          VALUES (
            ${id}, ${embed.src}, ${embed.type}, ${embed.host},
            ${title?.slice(0, 255) ?? null}, ${coverImageId ?? null}
          )
        `,
        recordQuery(sql, {
          source: 'embed_code',
          mongoId: embedKey(embed),
          table: 'embed_codes',
          rowId: id
        })
      ])
    })
  }

  for (const { id, row } of plan.links) {
    await attempt(id, `link ${row.url}`, async () => {
      await sql.transaction([
        sql`
          INSERT INTO links (id, url, title, type)
          VALUES (${id}, ${row.url}, ${row.title ?? null}, ${row.type ?? null})
        `,
        recordQuery(sql, {
          source: linkSource(row.type),
          mongoId: row.url,
          table: 'links',
          rowId: id
        })
      ])
    })
  }

  for (const project of plan.projects) {
    const { draft } = project
    const label = itemLabel(project.source, draft)
    await attempt(project.id, label, async () => {
      await sql.transaction([
        sql`
          INSERT INTO projects (
            id, title, slug, description, short_description,
            is_published, start_date, end_date, image_ids,
            embed_code_ids, link_ids, is_default_project,
            created_at, updated_at
          ) VALUES (
            ${project.id}, ${draft.title}, ${draft.slug},
            ${draft.description ?? null}, ${draft.shortDescription ?? null},
            ${draft.isPublished}, ${draft.startDate ?? null},
            ${draft.endDate ?? null}, ${kept(project.imageIds, label)},
            ${kept(project.embedCodeIds, label)},
            ${kept(project.linkIds, label)}, ${draft.isDefaultProject},
            ${draft.createdAt ?? new Date()},
            ${draft.updatedAt ?? draft.createdAt ?? new Date()}
          )
        `,
        recordQuery(sql, {
          source: project.source,
          mongoId: draft.mongoId,
          table: 'projects',
          rowId: project.id
        })
      ])
    })
  }

  for (const release of plan.releases) {
    const { draft } = release
    const label = itemLabel('publications', draft)
    await attempt(release.id, label, async () => {
      if (failed.has(release.projectId))
        throw new Error('its project failed')
      const publisherFailed = release.editions.find((e) =>
        failed.has(e.publisherId)
      )
      if (publisherFailed)
        throw new Error("an edition's publisher failed")
      await sql.transaction([
        sql`
          INSERT INTO releases (
            id, project_id, title, slug, description, short_description,
            release_date, artist, type, is_published, image_ids,
            embed_code_ids, link_ids, created_at, updated_at
          ) VALUES (
            ${release.id}, ${release.projectId}, ${draft.title},
            ${draft.slug}, ${draft.description ?? null},
            ${draft.shortDescription ?? null}, ${draft.releaseDate!},
            ${release.artist}, ${draft.type}, ${draft.isPublished},
            ${kept(release.imageIds, label)},
            ${kept(release.embedCodeIds, label)},
            ${kept(release.linkIds, label)},
            ${draft.createdAt ?? new Date()},
            ${draft.updatedAt ?? draft.createdAt ?? new Date()}
          )
        `,
        ...release.editions.map(
          (edition) => sql`
            INSERT INTO published_editions (
              id, release_id, publisher_id, format, publish_date
            ) VALUES (
              ${edition.id}, ${release.id}, ${edition.publisherId},
              ${edition.format}, ${edition.publishDate}
            )
          `
        ),
        recordQuery(sql, {
          source: 'publications',
          mongoId: draft.mongoId,
          table: 'releases',
          rowId: release.id
        })
      ])
    })
  }

  for (const event of plan.events) {
    const { draft } = event
    const label = itemLabel('events', draft)
    await attempt(event.id, label, async () => {
      if (failed.has(event.venueId))
        throw new Error('its venue failed')
      if (event.projectId && failed.has(event.projectId)) {
        throw new Error('its project failed')
      }
      await sql.transaction([
        sql`
          INSERT INTO events (
            id, _id, project_id, venue_id, title, slug, description,
            short_description, start_time, end_time, is_published,
            image_ids, embed_code_ids, link_ids, created_at, updated_at
          ) VALUES (
            ${event.id}, ${draft.mongoId}, ${event.projectId ?? null},
            ${event.venueId}, ${draft.title}, ${draft.slug},
            ${draft.description ?? null}, ${draft.shortDescription ?? null},
            ${draft.startTime!}, ${draft.endTime ?? null},
            ${draft.isPublished}, ${kept(event.imageIds, label)},
            ${kept(event.embedCodeIds, label)},
            ${kept(event.linkIds, label)},
            ${draft.createdAt ?? new Date()},
            ${draft.updatedAt ?? draft.createdAt ?? new Date()}
          )
        `,
        recordQuery(sql, {
          source: 'events',
          mongoId: draft.mongoId,
          table: 'events',
          rowId: event.id
        })
      ])
    })
  }

  const { settings } = plan
  if (settings) {
    const { draft } = settings
    const label = itemLabel('settings', draft)
    const coverImageId =
      settings.coverImageId && !failed.has(settings.coverImageId)
        ? settings.coverImageId
        : null
    const socialLinkIds = kept(settings.socialLinkIds, label)
    const id = settings.existingId ?? randomUUID()
    await attempt(id, label, async () => {
      // fills only what's blank: setup may have saved a title already
      const write = settings.existingId
        ? sql`
            UPDATE site_settings SET
              title = COALESCE(NULLIF(title, ''), ${draft.title ?? null}),
              description = COALESCE(NULLIF(description, ''), ${draft.description ?? null}),
              cover_image_id = COALESCE(cover_image_id, ${coverImageId}),
              social_link_ids = CASE
                WHEN cardinality(social_link_ids) = 0 THEN ${socialLinkIds}::uuid[]
                ELSE social_link_ids
              END,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
          `
        : sql`
            INSERT INTO site_settings (
              id, title, description, cover_image_id, social_link_ids
            ) VALUES (
              ${id}, ${draft.title ?? null}, ${draft.description ?? null},
              ${coverImageId}, ${socialLinkIds}
            )
          `
      await sql.transaction([
        write,
        recordQuery(sql, {
          source: 'settings',
          mongoId: draft.mongoId,
          table: 'site_settings',
          rowId: id
        })
      ])
    })
  }
}

// ------------------------------------------------------- seed + orphans

/** Records the rows the first migration made, which kept no mapping. */
async function seedLegacyIds(
  sql: Sql,
  data: Export,
  report: Report,
  isDryRun: boolean
) {
  const records: LegacyRecord[] = []
  const snapshot = await loadSnapshot(sql)
  const seen = (source: string, mongoId: string) =>
    snapshot.legacy.has(legacyKey(source, mongoId))

  for (const [mongoId, rowId] of snapshot.eventsByMongoId) {
    if (!seen('events', mongoId)) {
      records.push({
        source: 'events',
        mongoId,
        table: 'events',
        rowId
      })
    }
  }

  const releaseRows = (await sql`
    SELECT id, slug, title FROM releases
  `) as { id: string; slug: string; title: string }[]
  const byTitle = <T extends { title: string }>(
    rows: T[],
    title: string
  ) => {
    const matches = rows.filter(
      (r) =>
        r.title.trim().toLowerCase() === title.trim().toLowerCase()
    )
    return matches.length === 1 ? matches[0] : undefined
  }
  for (const [source, table, rows] of [
    ['projects', 'projects', snapshot.projects],
    ['publications', 'releases', releaseRows]
  ] as const) {
    for (const doc of data[source]) {
      const mongoId = clean(doc._id)
      if (!mongoId || seen(source, mongoId)) continue
      const slug = clean(doc.slug)
      const title = clean(doc.title) ?? ''
      const row =
        (slug &&
          (
            rows as { id: string; slug: string; title: string }[]
          ).find((r) => r.slug === slug)) ||
        byTitle(
          rows as { id: string; slug: string; title: string }[],
          title
        )
      if (row) {
        records.push({ source, mongoId, table, rowId: row.id })
      } else {
        report.add(
          'Not matched by --seed-legacy-ids',
          `${source} ${mongoId} "${title}" (slug ${slug ?? 'none'})`
        )
      }
    }
  }

  const imageUrls = new Set<string>()
  for (const collection of collections) {
    for (const doc of data[collection]) {
      for (const image of Array.isArray(doc.images)
        ? doc.images
        : []) {
        const url = clean((image as { url?: unknown }).url)
        if (url) imageUrls.add(url)
      }
      const metaImage = clean(
        (doc.meta as { image?: unknown })?.image
      )
      if (metaImage) imageUrls.add(metaImage)
    }
  }
  for (const url of imageUrls) {
    if (seen('image', url)) continue
    const rowId = snapshot.imagesByUrl.get(url)
    if (rowId) {
      records.push({
        source: 'image',
        mongoId: url,
        table: 'images',
        rowId
      })
    } else {
      report.add('Not matched by --seed-legacy-ids', `image ${url}`)
    }
  }

  for (const r of records) {
    report.add(
      'Seeded legacy ids',
      `${r.source} ${r.mongoId} → ${r.table} ${r.rowId}`
    )
    report.count(`legacy_ids ${r.source}`, 'create')
  }
  if (!isDryRun) {
    // one statement per row: Neon's HTTP transaction caps its size
    for (const r of records) await recordQuery(sql, r)
  }
}

async function reportOrphans(
  sql: Sql | undefined,
  args: Args,
  data: Export,
  report: Report
) {
  const client = new S3Client({ region: args.region })
  const keys: string[] = []
  let token: string | undefined
  do {
    const page = await client.send(
      new ListObjectsV2Command({
        Bucket: args.bucket,
        ContinuationToken: token
      })
    )
    for (const object of page.Contents ?? []) {
      if (object.Key) keys.push(object.Key)
    }
    token = page.NextContinuationToken
  } while (token)

  const bucketHost = new RegExp(
    `^https?://${args.bucket!.replace(/\./g, '\\.')}\\.s3[.a-z0-9-]*\\.amazonaws\\.com/`,
    'i'
  )
  const keyOf = (url: string) =>
    bucketHost.test(url) ? oldImageKey(url) : undefined

  const mongoKeys = new Set<string>()
  for (const collection of collections) {
    for (const doc of data[collection]) {
      const urls = [
        ...(Array.isArray(doc.images) ? doc.images : []).map((i) =>
          clean((i as { url?: unknown }).url)
        ),
        clean((doc.meta as { image?: unknown })?.image)
      ]
      for (const url of urls) {
        const key = url && keyOf(url)
        if (key) mongoKeys.add(key)
      }
    }
  }

  // old key → whether a Postgres row has its own copy (a format)
  const postgres = new Map<string, boolean>()
  if (sql) {
    const rows = (await sql`
      SELECT i.url AS url, i.format IS NOT NULL AS is_copied
      FROM images i
      UNION ALL
      SELECT l.mongo_id AS url, i.format IS NOT NULL AS is_copied
      FROM legacy_ids l JOIN images i ON i.id = l.row_id
      WHERE l.source = 'image'
    `) as { url: string; is_copied: boolean }[]
    for (const { url, is_copied } of rows) {
      const key = keyOf(url)
      if (key)
        postgres.set(key, (postgres.get(key) ?? false) || is_copied)
    }
  }

  for (const key of keys.sort()) {
    if (postgres.get(key)) {
      report.add('Copied: a Postgres row has its own copy', key)
    } else if (mongoKeys.has(key) || postgres.has(key)) {
      report.add('Still needed: referenced, not yet copied', key)
    } else {
      report.add('Orphans: referenced by nothing', key)
    }
  }
  console.info(`${keys.length} keys in ${args.bucket}`)
}

// ---------------------------------------------------------------- main

async function main() {
  const args = parseArgs()
  const data = await loadExport(args.input)
  const report = new Report()
  const databaseUrl = process.env.DATABASE_URL
  const sql = databaseUrl ? (neon(databaseUrl) as Sql) : undefined
  const dryRunNote = args.isDryRun
    ? ' (dry run, nothing is written)'
    : ''

  if (args.isOrphans) {
    await reportOrphans(sql, args, data, report)
    await writeReport(args, report, `Orphans in ${args.bucket}`)
    return
  }
  if (!sql) {
    if (!args.isDryRun || args.isSeed)
      throw new Error('Missing DATABASE_URL')
    console.warn(
      'No DATABASE_URL: planning against an empty database'
    )
  } else if (!(await hasLegacyIdsTable(sql)) && !args.isDryRun) {
    throw new Error('No legacy_ids table: run pnpm run setup first')
  }

  if (args.isSeed) {
    await seedLegacyIds(sql!, data, report, args.isDryRun)
    await writeReport(args, report, `Seed legacy ids${dryRunNote}`)
    return
  }

  const snapshot = sql ? await loadSnapshot(sql) : emptySnapshot()
  const planner = new Planner(snapshot, report, args.isDryRun)
  const { aliases, locations } = await loadVenueConfig(args.input)
  // documents left out on purpose: { "<mongo id>": "why" }
  const skipIds = await loadConfig<Record<string, string>>(
    args.input,
    'skip-ids.json',
    {}
  )
  const isPicked = (doc: MongoDoc) => {
    const id = clean(doc._id) ?? ''
    if (args.ids && !args.ids.has(id)) return false
    if (id in skipIds) {
      report.add(
        'Skipped',
        `${id} "${clean(doc.title) ?? ''}": ${skipIds[id]} (skip-ids.json)`
      )
      return false
    }
    return true
  }
  const isInScope = (type: OnlyType) =>
    !args.only || args.only === type

  const projects = isInScope('projects')
    ? [
        ...data.pages.filter(isPicked).flatMap((doc) => {
          const draft = toDefaultProject(doc)
          if (!draft) {
            report.add(
              'Skipped',
              `pages ${clean(doc._id)} "${clean(doc.title) ?? ''}": only the info page is migrated`
            )
            return []
          }
          return [{ draft, source: 'pages' as const }]
        }),
        ...data.projects.filter(isPicked).map((doc) => ({
          draft: toProject(doc),
          source: 'projects' as const
        }))
      ]
    : []
  const releases = isInScope('releases')
    ? data.publications.filter(isPicked).map(toRelease)
    : []
  const events = isInScope('events')
    ? data.events
        .filter(isPicked)
        .map((doc) => toEvent(doc, aliases, locations))
    : []
  const settings = isInScope('settings')
    ? data.settings.filter(isPicked).map(toSettings)
    : []
  if (settings.length > 1) {
    report.add(
      'Warnings',
      `${settings.length} settings documents; only the first is used`
    )
  }

  reportSharedImageUrls(report, [
    ...projects.map(({ draft, source }) => ({
      label: itemLabel(source, draft),
      images: draft.images
    })),
    ...releases.map((d) => ({
      label: itemLabel('publications', d),
      images: d.images
    })),
    ...events.map((d) => ({
      label: itemLabel('events', d),
      images: d.images
    })),
    ...settings.slice(0, 1).flatMap((d) =>
      d.coverImage
        ? [
            {
              label: itemLabel('settings', d),
              images: [d.coverImage]
            }
          ]
        : []
    )
  ])

  // dependency order: projects before the releases and events they own
  await planProjects(planner, report, projects)
  await planReleases(planner, report, releases)
  await planEvents(planner, report, events)
  if (settings[0])
    await planSettings(planner, report, snapshot, settings[0])

  const scope = [
    args.only ?? 'everything',
    args.ids && `${args.ids.size} id(s)`
  ]
    .filter(Boolean)
    .join(', ')
  if (args.isDryRun) {
    await writeReport(
      args,
      report,
      `Mongo migration plan: ${scope}${dryRunNote}`
    )
  } else {
    const { images, embeds } = planner.plan
    // only uploads need storage env; check it before writing anything
    if (images.length || embeds.length) {
      storageAdapter()
      publicUrl(IMAGE_PATH_PREFIX)
    }
    console.info(`Migrating ${scope}`)
    await apply(sql!, planner.plan, report)
    await writeReport(args, report, `Mongo migration: ${scope}`)
    if (report.failures === 0) {
      console.info(
        'Done. Redeploy (or visit each changed page signed in) so cached reads pick up the new rows.'
      )
    }
  }
  if (report.failures > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
