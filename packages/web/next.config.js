/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@myhealthally/shared'],
  experimental: {
    // Fix for clientReferenceManifest issues in Next.js 15
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Ensure proper handling of client components
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig

