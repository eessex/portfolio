import type { authConfig as AuthConfig } from '@/auth.config'
import type { hasSiteSettings as HasSiteSettings } from '@/lib/site-settings/data'
import type { hasUsers as HasUsers } from '@/lib/users/data'

jest.mock('@/lib/site-settings/data', () => ({
  hasSiteSettings: jest.fn()
}))
// Defaults to true (an admin already exists) so every pre-existing
// test below exercises today's steady-state behaviour unchanged;
// tests for the new no-users-yet state override it to false.
jest.mock('@/lib/users/data', () => ({
  hasUsers: jest.fn().mockResolvedValue(true)
}))

type Authorized = NonNullable<
  NonNullable<(typeof AuthConfig)['callbacks']>['authorized']
>

/**
 * `authConfig` memoizes a `true` site-settings/users check at module
 * scope (see the comments in src/auth.config.ts), so each test loads
 * a fresh module instance to avoid leaking state between cases.
 */
async function load() {
  jest.resetModules()
  const { authConfig } = await import('@/auth.config')
  const { hasSiteSettings } = await import('@/lib/site-settings/data')
  const { hasUsers } = await import('@/lib/users/data')
  return {
    authorized: authConfig.callbacks!.authorized! as Authorized,
    hasSiteSettings: jest.mocked(
      hasSiteSettings as typeof HasSiteSettings
    ),
    hasUsers: jest.mocked(hasUsers as typeof HasUsers)
  }
}

function args(pathname: string, isLoggedIn: boolean) {
  return {
    auth: isLoggedIn ? { user: { name: 'Test' } } : null,
    request: { nextUrl: new URL(pathname, 'http://localhost') }
  } as unknown as Parameters<Authorized>[0]
}

describe('authConfig.callbacks.authorized', () => {
  it('denies unauthenticated users on authed paths', async () => {
    const { authorized, hasSiteSettings } = await load()

    expect(await authorized(args('/dashboard', false))).toBe(false)
    expect(await authorized(args('/account', false))).toBe(false)
    expect(hasSiteSettings).not.toHaveBeenCalled()
  })

  it('denies unauthenticated users on /about/edit but not /about', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockResolvedValue(true)

    expect(await authorized(args('/about/edit', false))).toBe(false)
    expect(await authorized(args('/about', false))).toBe(true)
  })

  it('allows authenticated users on authed paths', async () => {
    const { authorized } = await load()

    expect(await authorized(args('/events/new', true))).toBe(true)
  })

  it('allows unauthenticated users on /login', async () => {
    const { authorized, hasSiteSettings } = await load()

    expect(await authorized(args('/login', false))).toBe(true)
    expect(hasSiteSettings).not.toHaveBeenCalled()
  })

  it('denies authenticated users on /login', async () => {
    const { authorized } = await load()

    expect(await authorized(args('/login', true))).toBe(false)
  })

  it.each(['/invite', '/reset-password'])(
    'allows %s signed in or out, before site settings exist',
    async (path) => {
      const { authorized, hasSiteSettings } = await load()
      hasSiteSettings.mockResolvedValue(false)

      expect(await authorized(args(path, true))).toBe(true)
      expect(await authorized(args(path, false))).toBe(true)
    }
  )

  it('allows logged-in users on public paths without checking site settings', async () => {
    const { authorized, hasSiteSettings } = await load()

    expect(await authorized(args('/about', true))).toBe(true)
    expect(hasSiteSettings).not.toHaveBeenCalled()
  })

  it('denies logged-out users on public paths when the site has no settings yet', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockResolvedValue(false)

    expect(await authorized(args('/', false))).toBe(false)
  })

  it('allows logged-out users on public paths once the site is configured', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockResolvedValue(true)

    expect(await authorized(args('/', false))).toBe(true)
  })

  it('memoizes a configured result instead of re-checking every request', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockResolvedValue(true)

    await authorized(args('/', false))
    await authorized(args('/about', false))

    expect(hasSiteSettings).toHaveBeenCalledTimes(1)
  })

  it('re-checks on every request while still unconfigured', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockResolvedValue(false)

    await authorized(args('/', false))
    await authorized(args('/about', false))

    expect(hasSiteSettings).toHaveBeenCalledTimes(2)
  })

  it('fails open (allows access) if the site-settings check throws', async () => {
    const { authorized, hasSiteSettings } = await load()
    hasSiteSettings.mockRejectedValue(new Error('connection refused'))
    jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(await authorized(args('/', false))).toBe(true)
  })

  describe('before any admin exists', () => {
    it('redirects every other path to /setup', async () => {
      const { authorized, hasUsers } = await load()
      hasUsers.mockResolvedValue(false)

      const res = await authorized(args('/dashboard', false))

      // Not NextResponse itself: `load()` resets modules, so the
      // dynamically re-imported `next/server` is a different module
      // instance than this file's static import — only the
      // underlying (global, never reset) Response class is shared.
      expect(res).toBeInstanceOf(Response)
      expect((res as Response).headers.get('location')).toBe(
        'http://localhost/setup'
      )
    })

    it('redirects /login too — there is no account to log into yet', async () => {
      const { authorized, hasUsers } = await load()
      hasUsers.mockResolvedValue(false)

      const res = await authorized(args('/login', false))

      expect(res).toBeInstanceOf(Response)
    })

    it('allows /setup itself, without checking site settings', async () => {
      const { authorized, hasUsers, hasSiteSettings } = await load()
      hasUsers.mockResolvedValue(false)

      expect(await authorized(args('/setup', false))).toBe(true)
      expect(hasSiteSettings).not.toHaveBeenCalled()
    })

    it('memoizes a found user instead of re-checking every request', async () => {
      const { authorized, hasUsers } = await load()
      hasUsers.mockResolvedValue(true)

      await authorized(args('/setup', false))
      await authorized(args('/about', false))

      expect(hasUsers).toHaveBeenCalledTimes(1)
    })

    it('re-checks on every request while still userless', async () => {
      const { authorized, hasUsers } = await load()
      hasUsers.mockResolvedValue(false)

      await authorized(args('/setup', false))
      await authorized(args('/setup', false))

      expect(hasUsers).toHaveBeenCalledTimes(2)
    })

    it('fails open (skips setup-only mode) if the users check throws', async () => {
      const { authorized, hasUsers } = await load()
      hasUsers.mockRejectedValue(new Error('connection refused'))
      jest.spyOn(console, 'error').mockImplementation(() => {})

      // Falls through to today's ordinary authed-path handling
      expect(await authorized(args('/dashboard', false))).toBe(false)
    })
  })
})
