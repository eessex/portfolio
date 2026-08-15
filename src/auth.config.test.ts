import type { authConfig as AuthConfig } from '@/auth.config'
import type { hasSiteSettings as HasSiteSettings } from '@/lib/site-settings/data'

jest.mock('@/lib/site-settings/data', () => ({
  hasSiteSettings: jest.fn()
}))

type Authorized = NonNullable<
  NonNullable<(typeof AuthConfig)['callbacks']>['authorized']
>

/**
 * `authConfig` memoizes a `true` site-settings check at module scope
 * (see the comment in src/auth.config.ts), so each test loads a fresh
 * module instance to avoid leaking state between cases.
 */
async function load() {
  jest.resetModules()
  const { authConfig } = await import('@/auth.config')
  const { hasSiteSettings } = await import('@/lib/site-settings/data')
  return {
    authorized: authConfig.callbacks!.authorized! as Authorized,
    hasSiteSettings: jest.mocked(
      hasSiteSettings as typeof HasSiteSettings
    )
  }
}

function args(pathname: string, isLoggedIn: boolean) {
  return {
    auth: isLoggedIn ? { user: { name: 'Test' } } : null,
    request: { nextUrl: { pathname } }
  } as unknown as Parameters<Authorized>[0]
}

describe('authConfig.callbacks.authorized', () => {
  it('denies unauthenticated users on authed paths', async () => {
    const { authorized, hasSiteSettings } = await load()

    expect(await authorized(args('/dashboard', false))).toBe(false)
    expect(hasSiteSettings).not.toHaveBeenCalled()
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
})
