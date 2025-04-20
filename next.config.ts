process.env.NODE_NO_WARNINGS = '1'

const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // ...otras opciones si las tienes...
}

export default nextConfig
