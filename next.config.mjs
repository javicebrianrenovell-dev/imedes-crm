/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      // Dominios permitidos para invocar Server Actions.
      // Incluimos el dominio productivo actual, localhost para dev y los
      // subdominios corporativos planificados para que cualquier futura
      // migración no requiera tocar este archivo.
      allowedOrigins: [
        'localhost:3000',
        'crm-imedes-72-60-214-52.traefik.me',
        'crm.imedes.es',
        'crm.grupimedes.com',
        'crmimedes.javicebrian.es',
      ],
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
