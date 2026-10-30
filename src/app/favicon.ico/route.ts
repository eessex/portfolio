import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { siteIconUrls } from '@/lib/site-settings/util'

/** Requested directly by browsers and feed readers, without the page. */
export async function GET(request: Request) {
  const { favicon } = siteIconUrls(await fetchCachedSiteSettings())
  return Response.redirect(new URL(favicon, request.url), 307)
}
