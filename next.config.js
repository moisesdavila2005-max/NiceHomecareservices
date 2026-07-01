/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración de seguridad y tiempos
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  // Definir duración máxima para API routes (en segundos)
  // Nota: maxDuration solo aplica en Vercel en el archivo vercel.json,
  // aquí lo dejamos como referencia, pero lo moveremos a vercel.json
  // para que funcione realmente.
};

export default nextConfig;