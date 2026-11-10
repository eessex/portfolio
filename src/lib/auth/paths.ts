import { ABOUT_PATH, pagePaths } from '@/lib/schemas'

// dependency-free so client code (analytics) can share it
export const authedPathPatterns = [
  ...pagePaths.map(
    (type) => new RegExp(`^/${type}/[^/]+/edit$`) // /events/:slug/edit
  ),
  ...pagePaths.map(
    (type) => new RegExp(`^/${type}/new$`) // /events/new
  ),
  new RegExp(`^/${ABOUT_PATH}/edit$`),
  /^\/dashboard(?:\/.*)?$/,
  /^\/account$/
]

export const unauthedPathPatterns = [
  /^\/login$/,
  /^\/forgot-password$/
]

// One-time links work signed in or out (e.g. an admin opening a reset
// link someone sent them); token in the fragment, never logged
export const linkPathPatterns = [/^\/invite$/, /^\/reset-password$/]

export const isAuthedPath = (pathname: string) =>
  authedPathPatterns.some((pattern) => pattern.test(pathname))

export const isUnauthedPath = (pathname: string) =>
  unauthedPathPatterns.some((pattern) => pattern.test(pathname))

export const isLinkPath = (pathname: string) =>
  linkPathPatterns.some((pattern) => pattern.test(pathname))
