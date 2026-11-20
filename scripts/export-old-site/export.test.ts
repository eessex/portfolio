/**
 * @jest-environment node
 */
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

import {
  exportOldSite,
  imageUrls,
  mongoexportArgs,
  type RunCommand
} from './export'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'export-old-site-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

const events = [
  {
    _id: { $oid: '5a1' },
    title: 'Show',
    images: [{ url: 'https://old.example/a.jpg' }]
  }
]

/** Fakes mongoexport: writes each collection's docs to its --out file. */
function fakeMongoexport(
  docs: Record<string, unknown[]> = {},
  failOn?: string
): RunCommand {
  return jest.fn(async (_command, args) => {
    if (args[0] === '--version') return { code: 0, stderr: '' }
    const collection = args
      .find((a) => a.startsWith('--collection='))!
      .split('=')[1]
    if (collection === failOn)
      return { code: 1, stderr: 'auth failed' }
    const out = args.find((a) => a.startsWith('--out='))!.slice(6)
    await writeFile(out, JSON.stringify(docs[collection] ?? []))
    return { code: 0, stderr: '' }
  })
}

describe('#mongoexportArgs', () => {
  it('exports one collection as a JSON array', () => {
    expect(
      mongoexportArgs('mongodb://h/db', 'events', '/x/events.json')
    ).toEqual([
      '--uri=mongodb://h/db',
      '--collection=events',
      '--jsonArray',
      '--quiet',
      '--out=/x/events.json'
    ])
  })

  it('adds --db when given', () => {
    expect(
      mongoexportArgs('mongodb://h', 'pages', '/x/p.json', 'site')
    ).toContain('--db=site')
  })
})

describe('#imageUrls', () => {
  it('collects image and meta image urls once each', () => {
    expect(
      imageUrls([
        {
          images: [
            { url: 'https://a/1.jpg' },
            { url: 'https://a/2.jpg' }
          ]
        },
        { meta: { image: 'https://a/1.jpg' } },
        { images: 'not an array' }
      ])
    ).toEqual(['https://a/1.jpg', 'https://a/2.jpg'])
  })
})

describe('#exportOldSite', () => {
  it('exports every collection and counts what it wrote', async () => {
    const download = jest.fn().mockResolvedValue(Buffer.from(''))
    const summary = await exportOldSite({
      uri: 'mongodb://h/db',
      outDir: dir,
      run: fakeMongoexport({ events }),
      download
    })
    expect(summary.counts).toEqual({
      events: 1,
      projects: 0,
      publications: 0,
      pages: 0,
      settings: 0
    })
    expect(summary.imageCount).toBe(1)
    expect(summary.unreachableImages).toEqual([])
    expect(download).toHaveBeenCalledWith('https://old.example/a.jpg')
  })

  it('reports images it could not download', async () => {
    const summary = await exportOldSite({
      uri: 'mongodb://h/db',
      outDir: dir,
      run: fakeMongoexport({ events }),
      download: jest
        .fn()
        .mockRejectedValue(new Error('403 Forbidden'))
    })
    expect(summary.unreachableImages).toEqual([
      { url: 'https://old.example/a.jpg', reason: '403 Forbidden' }
    ])
  })

  it('names the collection mongoexport failed on', async () => {
    await expect(
      exportOldSite({
        uri: 'mongodb://h/db',
        outDir: dir,
        run: fakeMongoexport({}, 'projects'),
        download: jest.fn()
      })
    ).rejects.toThrow('mongoexport failed on projects: auth failed')
  })

  it('explains how to install mongoexport when it is missing', async () => {
    await expect(
      exportOldSite({
        uri: 'mongodb://h/db',
        outDir: dir,
        run: jest.fn().mockRejectedValue(new Error('ENOENT')),
        download: jest.fn()
      })
    ).rejects.toThrow('mongoexport not found')
  })
})
