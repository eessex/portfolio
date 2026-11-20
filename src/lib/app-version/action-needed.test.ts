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
})
