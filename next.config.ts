/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'crm.imedes.es'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'crm-imedes-supabase-841299-72-60-214-52.traefik.me',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.traefik.me',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
