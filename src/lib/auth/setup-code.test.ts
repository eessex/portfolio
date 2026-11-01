import {
  buildSetupCodeBanner,
  generateSetupCode,
  hashSetupCode,
  SETUP_CODE_TTL_HOURS
} from '@/lib/auth/setup-code'

describe('generateSetupCode', () => {
  it('groups 16 characters from the no-look-alike alphabet', () => {
    const code = generateSetupCode()
    expect(code).toMatch(
      /^[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/
    )
    expect(code.replace(/-/g, '')).toHaveLength(16)
  })

  it('never includes a look-alike character', () => {
    const code = generateSetupCode()
    expect(code).not.toMatch(/[ILOU]/)
  })

  it('is different on each call', () => {
    expect(generateSetupCode()).not.toBe(generateSetupCode())
  })
})

describe('hashSetupCode', () => {
  it('hashes the same regardless of case, dashes or spaces', () => {
    const a = hashSetupCode('K7QM-3XRD-PW9T-H2FC')
    const b = hashSetupCode('k7qm3xrdpw9th2fc')
    const c = hashSetupCode('k7qm 3xrd pw9t h2fc')
    expect(a).toBe(b)
    expect(a).toBe(c)
  })

  it('returns a sha256 hex digest', () => {
    expect(hashSetupCode('K7QM-3XRD-PW9T-H2FC')).toMatch(
      /^[0-9a-f]{64}$/
    )
  })

  it('hashes different codes differently', () => {
    expect(hashSetupCode('K7QM-3XRD-PW9T-H2FC')).not.toBe(
      hashSetupCode('K7QM-3XRD-PW9T-H2FD')
    )
  })
})

describe('buildSetupCodeBanner', () => {
  it('prints the code between dividers, with the expiry', () => {
    const banner = buildSetupCodeBanner('K7QM-3XRD-PW9T-H2FC')
    const lines = banner.split('\n')
    expect(lines).toHaveLength(5)
    expect(lines[0]).toBe('='.repeat(50))
    expect(lines[4]).toBe('='.repeat(50))
    expect(lines[1]).toBe('  Setup code: K7QM-3XRD-PW9T-H2FC')
    expect(lines[3]).toBe(
      `  Expires in ${SETUP_CODE_TTL_HOURS} hours. Redeploy after that for a new one.`
    )
  })
})
