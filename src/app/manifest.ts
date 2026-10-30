import type { MetadataRoute } from 'next'

import { fetchCachedSiteSettings } from '@/lib/site-settings/cached'
import { siteIconUrls } from '@/lib/site-settings/util'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await fetchCachedSiteSettings()
  const icons = siteIconUrls(settings)
  const name = settings?.title || 'Site Title'
  return {
    name,
    short_name: name,
    description: settings?.description,
    start_url: '/',
    display: 'browser',
    icons: [
      { src: icons.icon192, sizes: '192x192', type: 'image/png' },
      { src: icons.icon512, sizes: '512x512', type: 'image/png' }
    ]
  }
}
