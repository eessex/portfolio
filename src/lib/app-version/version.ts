export const MAJOR_LABEL = 'release-major'
export const MINOR_LABEL = 'release-minor'

type Bump = 'major' | 'minor' | 'patch'

// Highest label among the PRs wins; unlabelled PRs are fixes
export function bumpFromLabels(labels: string[]): Bump {
  if (labels.includes(MAJOR_LABEL)) return 'major'
  if (labels.includes(MINOR_LABEL)) return 'minor'
  return 'patch'
}

export function parseVersion(tag: string): [number, number, number] {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tag)
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
