/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 Activa el modo estricto de React para detectar problemas en desarrollo
  reactStrictMode: true,

  // 🔒 Elimina la cabecera "X-Powered-By: Next.js" (buena práctica de seguridad)
  poweredByHeader: false,

  // ✅ TypeScript: NUNCA ignores errores en producción.
  // Si necesitas saltarlos en local, hazlo con un script en package.json, pero aquí va a false.
  typescript: {
    ignoreBuildErrors: false,
  },

  // ✅ ESLint: El build fallará si hay errores de linting.
  // Así aseguras la calidad del código en equipo.
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ✅ Imágenes: Dejamos la optimización nativa de Next.js activada.
  // Vercel la maneja perfectamente. Elimina esta clave si quieres, pero la dejo explícita a false.
  images: {
    unoptimized: false,
  },

  // 🧹 Opcional pero muy recomendable: elimina los console.log en producción
  // (Deja los console.error para depurar fallos)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Si necesitas redirecciones o headers, este es el lugar limpio para añadirlos.
  // async redirects() {
  //   return [];
  // },
};

export default nextConfig;

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Si usas imágenes externas, añade domains aquí
  images: {
    domains: ['your-cdn.com'],
  },
};

export default withNextIntl(nextConfig);