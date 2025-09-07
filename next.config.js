/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove deprecated config:
  // experimental: {
  //   turbo: {
  //     // ...your previous Turbopack options
  //   }
  // },

  // New location (copy the same options here):
  turbopack: {
    // Example if you had options before:
    // resolveAlias: { '@': './src' },
    // rules: { '*.svg': { as: 'asset' } },
  },
}

module.exports = nextConfig
