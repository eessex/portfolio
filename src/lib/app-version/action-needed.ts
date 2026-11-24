// Dependency-free: shared by the release scripts (which read PR
// bodies) and the settings notice (which reads release notes), so the
// two can't drift apart.

export type ReleasePr = {
  number: number
  title: string
  body: string | null
  labels: string[]
}

// Up to 3 spaces of indent (more is an indented code block)
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/
const HEADING = /^(#{1,6})\s/

// Per line: whether it is part of a fenced code block, fence lines
// included. A fence closes only with the same character, at least as
// long and nothing after it, so a ``` example inside a ```` block stays
// inside it. A backtick fence's info string has no backticks (else
// it's an inline span such as ```code``` text).
function codeLines(lines: string[]): boolean[] {
  let open: { char: string; length: number } | undefined
  return lines.map((line) => {
    const [, marker, rest] = FENCE.exec(line) ?? []
    if (!marker) return !!open
    if (open) {
      const isClosing =
        marker[0] === open.char &&
        marker.length >= open.length &&
        !rest.trim()
      if (isClosing) open = undefined
    } else if (marker[0] !== '`' || !rest.includes('`')) {
      open = { char: marker[0], length: marker.length }
    } else {
      return false
    }
    return true
  })
}

// The lines after `startIndex`, up to the next heading of `stopLevel`
// or higher (a lower number). Deeper headings stay part of the
// section, and `#` lines inside a code fence are never headings.
function collectSection(
  lines: string[],
  isCode: boolean[],
  startIndex: number,
  stopLevel: number
): string[] {
  const out: string[] = []
  for (let i = startIndex + 1; i < lines.length; i++) {
    const level = !isCode[i] && HEADING.exec(lines[i])?.[1].length
    if (level && level <= stopLevel) break
    out.push(lines[i])
  }
  return out
}

// Index of the first line outside a code fence that `isStart` accepts
function findStart(
  lines: string[],
  isCode: boolean[],
  isStart: (line: string) => boolean
): number {
  return lines.findIndex((line, i) => !isCode[i] && isStart(line))
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
  const isCode = codeLines(lines)
  const start = findStart(lines, isCode, (line) =>
    PR_MARKER.test(line)
  )
  if (start === -1) return undefined
  const rest = lines[start].replace(PR_MARKER, '')
  return clean([rest, ...collectSection(lines, isCode, start, 2)])
}

// The "## Action needed" (or `###`) section of a release's notes, up
// to the next heading of its own level or higher
export function parseReleaseActionNeeded(
  body: string | null
): string | undefined {
  const lines = toLines(body ?? '')
  const isCode = codeLines(lines)
  const start = findStart(lines, isCode, (line) =>
    /^#{2,3}\s*Action needed\s*$/i.test(line)
  )
  if (start === -1) return undefined
  const level = HEADING.exec(lines[start])![1].length
  return clean(collectSection(lines, isCode, start, level))
}

// Backslash-escapes the characters that would turn plain text (a PR
// title) into Markdown: emphasis, code, links, HTML, strikethrough,
// table cells. A title is one line, so line-start syntax can't apply.
export const escapeMarkdown = (text: string) =>
  text.replace(/[\\`*_[\]<>~|&]/g, '\\$&')

// One "## Action needed" section for the `release-major` PRs, or ''
export function actionNeededSection(
  prs: ReleasePr[],
  majorLabel: string
): string {
  const items = prs
    .filter((pr) => pr.labels.includes(majorLabel))
    .map((pr) => {
      const text = parseActionNeeded(pr.body)
      return text
        ? `**${escapeMarkdown(pr.title)}** (#${pr.number})\n\n${text}`
        : ''
    })
    .filter(Boolean)
  return items.length
    ? `## Action needed\n\n${items.join('\n\n')}\n`
    : ''
}
