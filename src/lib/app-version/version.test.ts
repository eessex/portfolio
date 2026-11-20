import {
  bumpFromLabels,
  compareVersions,
  nextVersion,
  parseVersion
} from './version'

describe('bumpFromLabels', () => {
  it('takes the highest label', () => {
    expect(bumpFromLabels(['release-minor', 'release-major'])).toBe(
      'major'
    )
    expect(bumpFromLabels(['bug', 'release-minor'])).toBe('minor')
  })

  it('treats no release label as a patch', () => {
    expect(bumpFromLabels([])).toBe('patch')
    expect(bumpFromLabels(['bug'])).toBe('patch')
  })
})

describe('nextVersion', () => {
  it('bumps by label from the latest tag', () => {
    expect(nextVersion('v0.1.0', [])).toBe('0.1.1')
    expect(nextVersion('v1.2.3', ['release-minor'])).toBe('1.3.0')
    expect(nextVersion('v1.2.3', ['release-major'])).toBe('2.0.0')
  })
})

describe('parseVersion', () => {
  it('accepts an optional v and rejects anything else', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3])
    expect(() => parseVersion('v1.2')).toThrow('Not a version tag')
  })
})

describe('compareVersions', () => {
  it('orders numerically, not as text', () => {
    expect(compareVersions('v1.10.0', 'v1.9.0')).toBeGreaterThan(0)
    expect(compareVersions('v1.0.0', 'v2.0.0')).toBeLessThan(0)
    expect(compareVersions('v1.2.3', '1.2.3')).toBe(0)
  })
})
