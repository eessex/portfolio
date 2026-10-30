/** Just the filename, e.g. a stored url's key basename. */
export function formattedFilename(url: string) {
  try {
    return decodeURIComponent(
      new URL(url).pathname.split('/').pop() || url
    )
  } catch {
    return url
  }
}

/** Hostname + path, omitting the protocol and any query/hash. */
export function formattedLinkUrl(url: string) {
  try {
    const { hostname, pathname } = new URL(url)
    const host = hostname.replace(/^www\./, '')
    return `${host}${pathname}`.replace(/\/$/, '')
  } catch {
    return url
  }
}
