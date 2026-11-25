import { cacheLife } from 'next/cache'

import pkg from '../../../package.json'
import { parseReleaseActionNeeded } from './action-needed'
import { compareVersions, isVersionTag } from './version'

const UPSTREAM_REPO = 'eessex/portfolio'
const RELEASES_URL = `https://api.github.com/repos/${UPSTREAM_REPO}/releases`
const PAGE_SIZE = 100
// Every merge to main is a release, so a fork can be many pages behind;
// this bounds the requests one cache fill can cost
const MAX_PAGES = 10

export type VersionStatus = {
  current: string
  latest?: string
  url?: string
  // "Action needed" notes of every release since the installed one
  actionNeeded?: string
  isUpdateAvailable: boolean
  // The installed version is further behind than the pages read, so
  // notes of older releases may be missing
  isHistoryTruncated?: boolean
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

// Unauthenticated, GitHub allows 60 requests an hour per IP, and
// serverless functions share their egress IPs with other tenants, so
// that budget is often gone. An optional GITHUB_TOKEN (any token; it
// needs no scopes, since the repo is public) raises it to 5000 an hour
// for this instance alone.
function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// Releases newer than `current`, following the API's pages (newest
// first) until one reaches the installed version. Reports when the
// page bound is hit first, since the releases it left out may hold
// required steps.
async function fetchNewerReleases(current: string) {
  const newer: (GithubRelease & { version: string })[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(
      `${RELEASES_URL}?per_page=${PAGE_SIZE}&page=${page}`,
      { headers: githubHeaders() }
    )
    if (!res.ok) throw new Error(`GitHub responded ${res.status}`)
    const releases = (await res.json()) as GithubRelease[]
    const versions = releases
      .filter((r) => !r.draft && !r.prerelease)
      .map((r) => ({ ...r, version: r.tag_name.replace(/^v/, '') }))
      .filter((r) => isVersionTag(r.version))
    newer.push(...versions.filter((r) => isNewer(r.version, current)))
    const isCaughtUp = versions.some(
      (r) => !isNewer(r.version, current)
    )
    if (isCaughtUp || releases.length < PAGE_SIZE)
      return { newer: sortOldest(newer), isTruncated: false }
  }
  return { newer: sortOldest(newer), isTruncated: true }
}

function sortOldest<T extends { version: string }>(newer: T[]) {
  return newer.sort((a, b) => compareVersions(a.version, b.version))
}

// Cached for hours. A failure (a rate limit, a 5xx, no network) is
// cached too, but only for minutes: uncached, every settings view would
// retry, spending more of a rate limit that's likely already used up.
// Reads every release newer than the installed one, so a later patch
// can't hide an earlier release's required steps.
async function fetchCachedVersionStatus(): Promise<VersionStatus> {
  'use cache'

  const current = currentVersion()
  let releases: Awaited<ReturnType<typeof fetchNewerReleases>>
  try {
    releases = await fetchNewerReleases(current)
  } catch {
    cacheLife('minutes')
    return { current, isUpdateAvailable: false }
  }
  cacheLife('hours')
  const { newer, isTruncated } = releases
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
    isHistoryTruncated: isTruncated,
    actionNeeded: notes.length ? notes.join('\n\n') : undefined
  }
}

// Fails to "no latest known" rather than breaking the page (the cached
// read already does for GitHub errors; this covers the cache itself)
export async function fetchVersionStatus(): Promise<VersionStatus> {
  try {
    return await fetchCachedVersionStatus()
  } catch {
    return { current: currentVersion(), isUpdateAvailable: false }
  }
}
