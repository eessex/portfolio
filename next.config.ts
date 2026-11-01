import type { NextConfig } from 'next'

import {
  DEVICE_SIZES,
  IMAGE_FORMATS,
  IMAGE_SIZES,
  SERVER_ACTION_BODY_SIZE_LIMIT
} from './src/lib/images/util'
import {
  blobHostname,
  IMAGE_PATH_PREFIX,
  s3Hostname
} from './src/lib/storage/keys'

// kept literal so this file needn't import the embed-code module
const COVER_IMAGE_PATH_PREFIX = 'embedCodeCoverImages'

type RemotePattern = NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
>[number]

const remotePatterns: RemotePattern[] = []

for (const hostname of [s3Hostname(), blobHostname()]) {
  if (!hostname) continue
  for (const prefix of [IMAGE_PATH_PREFIX, COVER_IMAGE_PATH_PREFIX]) {
    remotePatterns.push({
      protocol: 'https',
      hostname,
      pathname: `/${prefix}/**`
    })
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/info',
        destination: '/about',
        permanent: true // 301 redirect
      }
    ]
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // image uploads go through the form's server action
    serverActions: { bodySizeLimit: SERVER_ACTION_BODY_SIZE_LIMIT }
  },
  serverExternalPackages: ['sharp'],
  images: {
    minimumCacheTTL: 2678400, // 31 days
    formats: IMAGE_FORMATS,
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
    remotePatterns
  }
}

export default nextConfig
