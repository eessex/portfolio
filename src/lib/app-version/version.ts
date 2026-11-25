export const MAJOR_LABEL = 'release-major'
export const MINOR_LABEL = 'release-minor'

type Bump = 'major' | 'minor' | 'patch'

// Highest label among the PRs wins; unlabelled PRs are fixes
export function bumpFromLabels(labels: string[]): Bump {
  if (labels.includes(MAJOR_LABEL)) return 'major'
  if (labels.includes(MINOR_LABEL)) return 'minor'
  return 'patch'
}

const VERSION_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/

// The one definition of an accepted tag (`v` optional), shared by the
// release script and the settings notice so they can't disagree
export const isVersionTag = (tag: string) => VERSION_TAG.test(tag)

export function parseVersion(tag: string): [number, number, number] {
  const match = VERSION_TAG.exec(tag)
  if (!match) throw new Error(`Not a version tag: ${tag}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

// `latestTag` + every merged PR's labels → the next version (no `v`)
export function nextVersion(
  latestTag: string,
  labels: string[]
): string {
  const [major, minor, patch] = parseVersion(latestTag)
  switch (bumpFromLabels(labels)) {
    case 'major':
      return `${major + 1}.0.0`
    case 'minor':
      return `${major}.${minor + 1}.0`
    default:
      return `${major}.${minor}.${patch + 1}`
  }
}

// Negative when `a` is older than `b`, positive when newer
export function compareVersions(a: string, b: string): number {
  const x = parseVersion(a)
  const y = parseVersion(b)
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] - y[i]
  }
  return 0
}

// The release workflow's commits are authored and committed by this
// identity (its `git config`). Checking the committer too rules out a
// merged PR: GitHub commits squash and rebase merges itself, so only a
// direct push (the release App, past the ruleset) carries it. Mirrored
// in `.github/workflows/release.yml` and
// `scripts/vercel-ignore-build.sh`, which can't import this.
export const RELEASE_BOT_EMAIL =
  '41898282+github-actions[bot]@users.noreply.github.com'

export const isReleaseCommit = ({
  subject,
  authorEmail,
  committerEmail
}: {
  subject: string
  authorEmail: string
  committerEmail: string
}) =>
  authorEmail === RELEASE_BOT_EMAIL &&
  committerEmail === RELEASE_BOT_EMAIL &&
  /^chore\(release\): v\d+\.\d+\.\d+$/.test(subject)
