import { safeRedirectPath } from '@/lib/auth/redirect'

describe('safeRedirectPath', () => {
  it('keeps a relative path with its query and hash', () => {
    expect(safeRedirectPath('/events/new?x=1#top')).toBe(
      '/events/new?x=1#top'
    )
  })

  it('reduces an absolute URL to its path', () => {
    expect(
      safeRedirectPath('http://localhost:3000/releases/foo/edit')
    ).toBe('/releases/foo/edit')
  })

  it('drops the host of an offsite URL', () => {
    expect(safeRedirectPath('https://evil.example/steal')).toBe(
      '/steal'
    )
    expect(safeRedirectPath('//evil.example/steal')).toBe('/steal')
  })

  it('never returns a protocol-relative path', () => {
    expect(safeRedirectPath('http://localhost//evil.example')).toBe(
      '/'
    )
  })

  it('falls back to / for empty, non-path, or login targets', () => {
    expect(safeRedirectPath(undefined)).toBe('/')
    expect(safeRedirectPath(null)).toBe('/')
    expect(safeRedirectPath('')).toBe('/')
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(safeRedirectPath('/login')).toBe('/')
  })
})
