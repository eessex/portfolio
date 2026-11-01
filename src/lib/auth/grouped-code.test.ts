import {
  generateGroupedCode,
  normalizeGroupedCode
} from '@/lib/auth/grouped-code'

describe('generateGroupedCode', () => {
  it('dash-groups the requested length', () => {
    expect(generateGroupedCode(10, 5)).toMatch(
      /^[0-9A-Z]{5}-[0-9A-Z]{5}$/
    )
  })
})

describe('normalizeGroupedCode', () => {
  it('strips dashes and spaces and uppercases', () => {
    expect(normalizeGroupedCode('k7qm-3xrd pw9t-h2fc')).toBe(
      'K7QM3XRDPW9TH2FC'
    )
  })
})
