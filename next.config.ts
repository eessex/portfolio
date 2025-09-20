import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.REMOTE_IMAGE_HOSTNAME || 'images.myhost.com',
        pathname: (process.env.REMOTE_IMAGE_PATHNAME || '') + '/**'
      }
    ]
  }
}

export default nextConfig
