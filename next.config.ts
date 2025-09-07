import type { NextConfig } from 'next'
import type { Configuration } from 'webpack'

interface WebpackConfigOptions {
  dev: boolean
  isServer: boolean
}

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '3000', pathname: '/images/**' },
    ],
  },
  // Mantén optimizePackageImports en experimental
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'zod'],
  },
  // Mueve experimental.turbo -> turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Optimización de webpack (para build con webpack)
  webpack: (config: Configuration, { dev, isServer }: WebpackConfigOptions) => {
    if (!dev && !isServer) {
      if (!config.optimization) config.optimization = {}
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
