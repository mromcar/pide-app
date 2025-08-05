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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      },
    ],
  },
  // Optimizaciones de compilación
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'zod'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Optimización de webpack
  webpack: (config: Configuration, { dev, isServer }: WebpackConfigOptions) => {
    if (!dev && !isServer) {
      // Ensure optimization object exists
      if (!config.optimization) {
        config.optimization = {}
      }
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    return config
  }
}

export default nextConfig
