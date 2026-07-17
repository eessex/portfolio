import type { NextConfig } from 'next'

type RemotePattern = NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
>[number]

const { AWS_S3_BUCKET_NAME, AWS_S3_REGION } = process.env

// Primary uploads bucket. Derived from the S3 config.
// REMOTE_IMAGE_HOSTNAME can override it for non-standard endpoints.
const s3Hostname =
  process.env.REMOTE_IMAGE_HOSTNAME ||
  (AWS_S3_BUCKET_NAME && AWS_S3_REGION
    ? `${AWS_S3_BUCKET_NAME}.s3.${AWS_S3_REGION}.amazonaws.com`
    : undefined)

const remotePatterns: RemotePattern[] = []

if (s3Hostname) {
  remotePatterns.push({
    protocol: 'https',
    hostname: s3Hostname,
    pathname: '/images/**'
  })
}

// FIXME: keep serving images from a previous bucket during a
// migration to a new one. Can remove once images are moved.
if (process.env.REMOTE_IMAGE_HOSTNAME_OLD) {
  remotePatterns.push({
    protocol: 'https',
    hostname: process.env.REMOTE_IMAGE_HOSTNAME_OLD,
    pathname: (process.env.REMOTE_IMAGE_PATHNAME || '') + '/**'
  })
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
  images: {
    minimumCacheTTL: 2678400, // 31 days
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 640, 768, 1024, 1280],
    imageSizes: [52, 96, 256],
    remotePatterns
  }
}

export default nextConfig
