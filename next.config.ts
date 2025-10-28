import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.REMOTE_IMAGE_HOSTNAME_OLD || 'images.myhost.com',
        pathname: (process.env.REMOTE_IMAGE_PATHNAME || '') + '/**'
      },
      {
        protocol: 'https',
        hostname: process.env.REMOTE_IMAGE_HOSTNAME || 'images.myhost.com',
        pathname: (process.env.REMOTE_IMAGE_PATHNAME || '/images') + '/**'
      }
    ]
  }
}

export default nextConfig
