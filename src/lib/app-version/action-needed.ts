// Dependency-free: shared by the release scripts (which read PR
// bodies) and the settings notice (which reads release notes), so the
// two can't drift apart.

export type ReleasePr = {
  number: number
  title: string
  body: string | null
  labels: string[]
}

const FENCE = /^\s*(```|~~~)/
const HEADING = /^(#{1,6})\s/

// The lines after `startIndex`, up to the next heading of `stopLevel`
// or higher (a lower number). Deeper headings stay part of the
// section, and `#` lines inside a code fence are never headings.
function collectSection(
  lines: string[],
  startIndex: number,
  stopLevel: number
): string[] {
  const out: string[] = []
  let isFenced = false
  for (const line of lines.slice(startIndex + 1)) {
    if (FENCE.test(line)) isFenced = !isFenced
    const level = !isFenced && HEADING.exec(line)?.[1].length
    if (level && level <= stopLevel) break
    out.push(line)
  }
  return out
}

// Index of the first line outside a code fence that `isStart` accepts
function findStart(
  lines: string[],
  isStart: (line: string) => boolean
): number {
  let isFenced = false
  for (let i = 0; i < lines.length; i++) {
    if (FENCE.test(lines[i])) isFenced = !isFenced
    else if (!isFenced && isStart(lines[i])) return i
  }
  return -1
}

const toLines = (text: string) =>
  text.replace(/\r\n?/g, '\n').split('\n')

const clean = (lines: string[]) =>
  lines
    .join('\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim() || undefined

const PR_MARKER = /^\*\*Action needed:?\*\*:?[ \t]*/i

// The text under a PR template's "**Action needed:**" line, up to its
// next top-level (`#`/`##`) section, without the template's HTML
// comments. Subheadings and code inside it are kept.
export function parseActionNeeded(
  body: string | null
): string | undefined {
  const lines = toLines(body ?? '')
  const start = findStart(lines, (line) => PR_MARKER.test(line))
  if (start === -1) return undefined
  const rest = lines[start].replace(PR_MARKER, '')
  return clean([rest, ...collectSection(lines, start, 2)])
}

// The "## Action needed" (or `###`) section of a release's notes, up
// to the next heading of its own level or higher
export function parseReleaseActionNeeded(
  body: string | null
): string | undefined {
  const lines = toLines(body ?? '')
  const start = findStart(lines, (line) =>
    /^#{2,3}\s*Action needed\s*$/i.test(line)
  )
  if (start === -1) return undefined
  const level = HEADING.exec(lines[start])![1].length
  return clean(collectSection(lines, start, level))
}

// One "## Action needed" section for the `release-major` PRs, or ''
export function actionNeededSection(
  prs: ReleasePr[],
  majorLabel: string
): string {
  const items = prs
    .filter((pr) => pr.labels.includes(majorLabel))
    .map((pr) => {
      const text = parseActionNeeded(pr.body)
      return text ? `**${pr.title}** (#${pr.number})\n\n${text}` : ''
    })
    .filter(Boolean)
  return items.length
    ? `## Action needed\n\n${items.join('\n\n')}\n`
    : ''
}
