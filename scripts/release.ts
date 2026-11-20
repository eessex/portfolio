/**
 * Works out the next release version from the PRs merged since the
 * latest v<major>.<minor>.<patch> tag. Prints it, and writes
 * `version`/`previous_tag` to $GITHUB_OUTPUT when set, and the
 * `release-major` PRs' "Action needed" notes to the file named by
 * $ACTION_NEEDED_FILE. Prints nothing and exits 0 when only release
 * commits came since (nothing to release).
 *
 * With `--notes-for <tag>` it instead gathers the PRs between that
 * (already created) tag and the one before it, for finishing a release
 * whose GitHub Release was never published: it writes `previous_tag`
 * and the notes file, and no `version`.
 *
 *   pnpm release [--notes-for v1.2.3]
 *   (needs the gh CLI, GH_TOKEN and a full git clone with its tags)
 *
 * The first release needs a seed tag (`git tag v0.1.0 <commit> && git
 * push origin v0.1.0`), since the version is bumped from the last one.
 */
import { execFileSync } from 'node:child_process'
import { appendFileSync, writeFileSync } from 'node:fs'

import {
  actionNeededSection,
  type ReleasePr
} from '../src/lib/app-version/action-needed'
import {
  compareVersions,
  MAJOR_LABEL,
  nextVersion,
  parseVersion
} from '../src/lib/app-version/version'

const run = (cmd: string, args: string[]) =>
  execFileSync(cmd, args, { encoding: 'utf8' }).trim()

const RELEASE_PREFIX = 'chore(release):'

// Version tags only (`v1-beta` and the like are ignored), highest first
function versionTags(): string[] {
  return run('git', ['tag', '--list', 'v*'])
    .split('\n')
    .filter((tag) => {
      try {
        parseVersion(tag)
        return true
      } catch {
        return false
      }
    })
    .sort((a, b) => compareVersions(b, a))
}

// The PRs behind the non-release commits in `range`. Squash, merge and
// rebase merges all map commit → PR this way
function prsIn(range: string): ReleasePr[] | undefined {
  const commits = run('git', ['log', range, '--format=%H%x09%s'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t') as [string, string])
    .filter(([, subject]) => !subject.startsWith(RELEASE_PREFIX))
  if (!commits.length) return undefined

  const prsByNumber = new Map<number, ReleasePr>()
  for (const [sha] of commits) {
    const prs = JSON.parse(
      run('gh', [
        'api',
        `repos/{owner}/{repo}/commits/${sha}/pulls`,
        '--jq',
        '[.[] | {number, title, body, labels: [.labels[].name]}]'
      ])
    ) as ReleasePr[]
    prs.forEach((pr) => prsByNumber.set(pr.number, pr))
  }
  return [...prsByNumber.values()]
}

function writeOutputs(
  outputs: Record<string, string>,
  notes: string
) {
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(outputs)
        .map(([key, value]) => `${key}=${value}\n`)
        .join('')
    )
  }
  if (process.env.ACTION_NEEDED_FILE) {
    writeFileSync(process.env.ACTION_NEEDED_FILE, notes)
  }
}

function main() {
  const tags = versionTags()
  const notesFor =
    process.argv[2] === '--notes-for' && process.argv[3]

  if (notesFor) {
    const previousTag = tags.find(
      (tag) => compareVersions(tag, notesFor) < 0
    )
    if (!tags.includes(notesFor) || !previousTag) {
      throw new Error(`No earlier version tag before ${notesFor}`)
    }
    const prs = prsIn(`${previousTag}..${notesFor}`) ?? []
    writeOutputs(
      { previous_tag: previousTag },
      actionNeededSection(prs, MAJOR_LABEL)
    )
    return
  }

  const latestTag = tags[0]
  if (!latestTag) {
    throw new Error(
      'No v<major>.<minor>.<patch> tag found. Fetch the tags, or seed the first one: git tag v0.1.0 <commit> && git push origin v0.1.0'
    )
  }
  const prs = prsIn(`${latestTag}..HEAD`)
  if (!prs) {
    console.log(`Nothing to release since ${latestTag}`)
    return
  }

  const version = nextVersion(
    latestTag,
    prs.flatMap((pr) => pr.labels)
  )
  console.log(`${latestTag} → v${version}`)
  writeOutputs(
    { version, previous_tag: latestTag },
    actionNeededSection(prs, MAJOR_LABEL)
  )
}

main()
