import {
  actionNeededSection,
  parseActionNeeded,
  parseReleaseActionNeeded
} from './action-needed'

const body = `## Release

<!-- hint -->

**Action needed:**
Set FOO.

## Checklist
- [ ] x`

describe('parseActionNeeded', () => {
  it('reads the text under the marker', () => {
    expect(parseActionNeeded(body)).toBe('Set FOO.')
  })

  it('is undefined when empty or missing', () => {
    expect(
      parseActionNeeded('**Action needed:**\n<!-- x -->\n## Next')
    ).toBeUndefined()
    expect(parseActionNeeded(null)).toBeUndefined()
  })
})

describe('parseActionNeeded nesting and line endings', () => {
  it('keeps subheadings and stops at the next section', () => {
    const text =
      '**Action needed:**\nPrepare the DB.\n\n### Steps\n\n1. Run it\n\n## Checklist\n- x'
    expect(parseActionNeeded(text)).toBe(
      'Prepare the DB.\n\n### Steps\n\n1. Run it'
    )
  })

  it('keeps a block that starts with a subheading', () => {
    expect(
      parseActionNeeded('**Action needed:**\n### Steps\nGo.\n## End')
    ).toBe('### Steps\nGo.')
  })

  it('ignores # lines inside code fences', () => {
    const text =
      '**Action needed:**\n```sh\n# comment\n## also\npnpm x\n```\n## End'
    expect(parseActionNeeded(text)).toBe(
      '```sh\n# comment\n## also\npnpm x\n```'
    )
  })

  it('reads CRLF bodies', () => {
    expect(
      parseActionNeeded(
        '**Action needed:**\r\nSet FOO.\r\n\r\n## Checklist\r\n'
      )
    ).toBe('Set FOO.')
  })
})

describe('code fence lengths', () => {
  const inner = '```sh\npnpm migrate\n```'

  it('keeps a ``` example inside a ```` block', () => {
    const text = `**Action needed:**\n\n\`\`\`\`md\n${inner}\n## not a heading\n\`\`\`\`\n\nDone.\n\n## Next`
    expect(parseActionNeeded(text)).toContain('## not a heading')
    expect(parseActionNeeded(text)).toContain('Done.')
    expect(parseActionNeeded(text)).not.toContain('Next')
  })

  it('closes only with the same character', () => {
    const text =
      '**Action needed:**\n\n```\n~~~\n## still code\n```\n\n## Next'
    expect(parseActionNeeded(text)).toContain('## still code')
    expect(parseActionNeeded(text)).not.toContain('Next')
  })

  it('does not find a marker inside a longer fence', () => {
    const text = `\`\`\`\`md\n${inner}\n## Action needed\nfake\n\`\`\`\`\n\n## Action needed\nreal`
    expect(parseReleaseActionNeeded(text)).toBe('real')
  })
})

describe('parseReleaseActionNeeded', () => {
  it('keeps nested headings and stops at a peer', () => {
    expect(
      parseReleaseActionNeeded(
        '## Action needed\n\nIntro\n\n### Migration steps\nRun.\n\n## Other\nx'
      )
    ).toBe('Intro\n\n### Migration steps\nRun.')
  })

  it('is undefined without the section', () => {
    expect(parseReleaseActionNeeded('## Other\n- a')).toBeUndefined()
  })
})

describe('actionNeededSection', () => {
  it('collects only release-major PRs', () => {
    const section = actionNeededSection(
      [
        { number: 1, title: 'A', body, labels: ['release-major'] },
        { number: 2, title: 'B', body, labels: [] }
      ],
      'release-major'
    )
    expect(section).toBe(
      '## Action needed\n\n**A** (#1)\n\nSet FOO.\n'
    )
  })

  it('is empty without any', () => {
    expect(actionNeededSection([], 'release-major')).toBe('')
  })

  it('escapes Markdown in PR titles', () => {
    const section = actionNeededSection(
      [
        {
          number: 3,
          title: 'Drop *_legacy columns and `**` handling',
          body,
          labels: ['release-major']
        }
      ],
      'release-major'
    )
    expect(section).toContain(
      '**Drop \\*\\_legacy columns and \\`\\*\\*\\` handling** (#3)'
    )
  })
})

describe('fence detection', () => {
  it('ignores an inline span starting with backticks', () => {
    expect(
      parseReleaseActionNeeded(
        '## Action needed\n```pnpm migrate``` first\n## Next\nx'
      )
    ).toBe('```pnpm migrate``` first')
  })

  it('ignores a 4-space indented fence', () => {
    expect(
      parseReleaseActionNeeded(
        '## Action needed\n    ```\nstep\n## Next\nx'
      )
    ).toBe('```\nstep')
  })
})
