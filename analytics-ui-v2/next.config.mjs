/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure API routes use Node.js runtime (required for knex, pg, etc.)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional knex database drivers that we don't use
      config.externals = config.externals || [];
      config.externals.push({
        'mysql': 'commonjs mysql',
        'mysql2': 'commonjs mysql2',
        'oracledb': 'commonjs oracledb',
        'sqlite3': 'commonjs sqlite3',
        'tedious': 'commonjs tedious',
        'pg-query-stream': 'commonjs pg-query-stream',
      });
    }
    return config;
  },
  // Force webpack for server-side bundling (needed for Knex externals)
  // Turbopack doesn't support externals the same way webpack does
  // Use --webpack flag when running dev/build
  // Add empty turbopack config to silence the warning
  turbopack: {},
}

export default nextConfig
