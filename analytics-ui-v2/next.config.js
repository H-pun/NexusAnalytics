/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  redirects: async () => {
    return [
      {
        source: '/setup',
        destination: '/setup/connection',
        permanent: true,
      },
    ];
  },
  // Add rewrites/proxy here if needed to match analytics-ui behavior later
};

module.exports = nextConfig;










