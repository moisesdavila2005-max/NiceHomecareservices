/** @type {import('next').NextConfig} */
const nextConfig = {
  // Redirecciones (equivalente a RewriteRule)
  async redirects() {
    return [
      // Redirigir www a no-www (HTTP 301)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.nicehomecareservices.com',
          },
        ],
        destination: 'https://nicehomecareservices.com/:path*',
        permanent: true,
      },
    ]
  },

  // Cabeceras para caché (equivalente a ExpiresByType)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Compresión: Vercel ya la aplica, pero podemos forzarla con:
  compress: true,

  // Otros ajustes útiles
  reactStrictMode: true,
  poweredByHeader: false, // Oculta "X-Powered-By: Next.js"
}

module.exports = nextConfig