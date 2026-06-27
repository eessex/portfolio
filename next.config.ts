import type { NextConfig } from 'next'

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
  images: {
    minimumCacheTTL: 2678400, // 31 days
    deviceSizes: [320, 640, 768, 1024, 1280],
    imageSizes: [32, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          process.env.REMOTE_IMAGE_HOSTNAME_OLD ||
          'images.myhost.com',
        pathname: (process.env.REMOTE_IMAGE_PATHNAME || '') + '/**'
      },
      {
        protocol: 'https',
        hostname:
          process.env.REMOTE_IMAGE_HOSTNAME || 'images.myhost.com',
        pathname: '/images/**'
      }
    ]
  }
}

export default nextConfig
