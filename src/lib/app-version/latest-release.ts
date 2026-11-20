import { cacheLife } from 'next/cache'

import pkg from '../../../package.json'
import { parseReleaseActionNeeded } from './action-needed'
import { compareVersions } from './version'

const UPSTREAM_REPO = 'eessex/portfolio'
const RELEASES_URL = `https://api.github.com/repos/${UPSTREAM_REPO}/releases`
const PAGE_SIZE = 100
// Every merge to main is a release, so a fork can be many pages behind;
// this bounds the requests (60 an hour unauthenticated) it can cost
const MAX_PAGES = 10

export type VersionStatus = {
  current: string
  latest?: string
  url?: string
  // "Action needed" notes of every release since the installed one
  actionNeeded?: string
  isUpdateAvailable: boolean
}

export const currentVersion = (): string => pkg.version

const isNewer = (latest: string, current: string) =>
  compareVersions(latest, current) > 0

type GithubRelease = {
  tag_name: string
  html_url: string
  body?: string | null
  // GitHub's API field names
  /* eslint-disable @typescript-eslint/naming-convention */
  draft?: boolean
  prerelease?: boolean
  /* eslint-enable @typescript-eslint/naming-convention */
}

const isVersion = (v: string) => /^\d+\.\d+\.\d+$/.test(v)

// Releases newer than `current`, following the API's pages (newest
// first) until one reaches the installed version
async function fetchNewerReleases(current: string) {
  const newer: (GithubRelease & { version: string })[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(
      `${RELEASES_URL}?per_page=${PAGE_SIZE}&page=${page}`,
      { headers: { Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
    const releases = (await res.json()) as GithubRelease[]
    const versions = releases
      .filter((r) => !r.draft && !r.prerelease)
      .map((r) => ({ ...r, version: r.tag_name.replace(/^v/, '') }))
      .filter((r) => isVersion(r.version))
    newer.push(...versions.filter((r) => isNewer(r.version, current)))
    const isCaughtUp = versions.some(
      (r) => !isNewer(r.version, current)
    )
    if (isCaughtUp || releases.length < PAGE_SIZE) break
  }
  return newer.sort((a, b) =>
    isNewer(a.version, b.version) ? 1 : -1
  )
}

// Throws on any failure, which `'use cache'` doesn't store, so a rate
// limit or 5xx isn't remembered for hours. Cached for hours otherwise:
// GitHub allows 60 unauthenticated requests an hour per IP. Reads every
// release newer than the installed one, so a later patch can't hide an
// earlier release's required steps.
async function fetchCachedVersionStatus(): Promise<VersionStatus> {
  'use cache'
  cacheLife('hours')

  const current = currentVersion()
  const newer = await fetchNewerReleases(current)
  const latest = newer.at(-1)
  if (!latest) {
    return { current, latest: current, isUpdateAvailable: false }
  }
  const notes = newer
    .map((r) => parseReleaseActionNeeded(r.body ?? ''))
    .filter(Boolean)
  return {
    current,
    latest: latest.version,
    url: latest.html_url,
    isUpdateAvailable: true,
    actionNeeded: notes.length ? notes.join('\n\n') : undefined
  }
}

// Fails to "no latest known" rather than breaking the page
export async function fetchVersionStatus(): Promise<VersionStatus> {
  try {
    return await fetchCachedVersionStatus()
  } catch {
    return { current: currentVersion(), isUpdateAvailable: false }
  }
}
