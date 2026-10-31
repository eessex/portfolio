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
  /^\/dashboard(?:\/.*)?$/
]

export const unauthedPathPatterns = [/^\/login$/]

export const isAuthedPath = (pathname: string) =>
  authedPathPatterns.some((pattern) => pattern.test(pathname))

export const isUnauthedPath = (pathname: string) =>
  unauthedPathPatterns.some((pattern) => pattern.test(pathname))
