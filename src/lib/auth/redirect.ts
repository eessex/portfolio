/**
 * Reduces a post-login redirect target to a same-origin path, so a
 * crafted `callbackUrl` can't send a freshly logged-in admin offsite.
 * Absolute URLs (next-auth sets `callbackUrl` to the full href) keep
 * only their path; anything unusable, or /login itself, falls back
 * to `/`. Dependency-free: the login form and `authenticate` share it.
 */
export function safeRedirectPath(
  target: string | null | undefined
): string {
  if (!target) return '/'
  try {
    const { pathname, search, hash } = new URL(
      target,
      'http://localhost'
    )
    // `//host` would be read as protocol-relative, ie offsite
    if (!pathname.startsWith('/') || pathname.startsWith('//')) {
      return '/'
    }
    if (pathname === '/login') return '/'
    return `${pathname}${search}${hash}`
  } catch {
    return '/'
  }
}
