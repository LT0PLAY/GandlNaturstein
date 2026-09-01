import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // "Massivproduktion" wurde zu "Eigenproduktion" umbenannt — alte Links auf
  // /massivproduktion sollen trotzdem weiterhin funktionieren.
  async redirects() {
    return [
      {
        source:      '/massivproduktion',
        destination: '/eigenproduktion',
        permanent:   true,
      },
      {
        source:      '/massivproduktion/:path*',
        destination: '/eigenproduktion/:path*',
        permanent:   true,
      },
    ]
  },
}

export default nextConfig
