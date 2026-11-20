import { spawn } from 'node:child_process'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

import {
  clean,
  type Collection,
  collections,
  type MongoDoc,
  parseMongoExport
} from '../migrate-mongo/transforms'

export const DEFAULT_OUT_DIR = 'mongo-export'
// a few images prove the bucket is public; the dry run checks the rest
const IMAGE_PROBE_COUNT = 3

export type RunCommand = (
  command: string,
  args: string[]
) => Promise<{ code: number; stderr: string }>

export const runCommand: RunCommand = (command, args) =>
  new Promise((resolve, reject) => {
    // no shell, so the URI's password is never shell-parsed
    const child = spawn(command, args, {
      stdio: ['ignore', 'ignore', 'pipe']
    })
    let stderr = ''
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', reject)
    child.on('close', (code) => resolve({ code: code ?? 1, stderr }))
  })

export function mongoexportArgs(
  uri: string,
  collection: Collection,
  outFile: string,
  db?: string
) {
  return [
    `--uri=${uri}`,
    ...(db ? [`--db=${db}`] : []),
    `--collection=${collection}`,
    '--jsonArray',
    '--quiet',
    `--out=${outFile}`
  ]
}

/** Every old image URL the import will download. */
export function imageUrls(docs: MongoDoc[]) {
  const urls = new Set<string>()
  for (const doc of docs) {
    const images = Array.isArray(doc.images) ? doc.images : []
    for (const image of images) {
      const url = clean((image as { url?: unknown }).url)
      if (url) urls.add(url)
    }
    const metaImage = clean((doc.meta as { image?: unknown })?.image)
    if (metaImage) urls.add(metaImage)
  }
  return [...urls]
}

export interface ExportSummary {
  counts: Record<Collection, number>
  imageCount: number
  unreachableImages: { url: string; reason: string }[]
}

export async function exportOldSite({
  uri,
  db,
  outDir,
  run = runCommand,
  download
}: {
  uri: string
  db?: string
  outDir: string
  run?: RunCommand
  download: (url: string) => Promise<unknown>
}): Promise<ExportSummary> {
  try {
    await run('mongoexport', ['--version'])
  } catch {
    throw new Error(
      'mongoexport not found. Install the MongoDB Database Tools (macOS: brew install mongodb/brew/mongodb-database-tools) and try again.'
    )
  }
  await mkdir(outDir, { recursive: true })

  const counts = {} as Record<Collection, number>
  const docs: MongoDoc[] = []
  for (const collection of collections) {
    const outFile = path.join(outDir, `${collection}.json`)
    const { code, stderr } = await run(
      'mongoexport',
      mongoexportArgs(uri, collection, outFile, db)
    )
    if (code !== 0) {
      throw new Error(
        `mongoexport failed on ${collection}: ${stderr.trim() || `exit ${code}`}`
      )
    }
    // parsing proves the file is what the import reads
    const parsed = parseMongoExport(await readFile(outFile, 'utf8'))
    counts[collection] = parsed.length
    docs.push(...parsed)
  }

  const urls = imageUrls(docs)
  const unreachableImages: ExportSummary['unreachableImages'] = []
  for (const url of urls.slice(0, IMAGE_PROBE_COUNT)) {
    try {
      await download(url)
    } catch (err) {
      unreachableImages.push({ url, reason: (err as Error).message })
    }
  }
  return { counts, imageCount: urls.length, unreachableImages }
}
