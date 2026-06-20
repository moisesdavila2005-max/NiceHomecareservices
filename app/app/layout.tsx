import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces, Geist_Mono } from 'next/font/google'
import './globals.css'

// Optimización de fuentes con mejor precarga
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  weight: ['400', '500', '600', '700'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
  preload: true,
  weight: ['400', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false, // No precargar mono si no se usa en el fold inicial
  weight: ['400'],
})

// Metadata mejorada para SEO
export const metadata: Metadata = {
  metadataBase: new URL('https://nicehomecareservices.com'),
  title: {
    default: 'Nice Home Care Services | Cuidados Compasivos para Adultos Mayores',
    template: '%s | Nice Home Care Services',
  },
  description:
    'Atención personalizada en el hogar para adultos mayores. Profesionales capacitados que brindan cuidados con calidez, dignidad y respeto. Consulta gratuita.',
  keywords: [
    'cuidado de adultos mayores',
    'asistencia domiciliaria',
    'cuidados paliativos',
    'preparación de alimentos,
    'compañía para mayores',
    'cuidado compasivo',
  ],
  authors: [{ name: 'Nice Home Care Services' }],
  creator: 'Nice Home Care Services',
  publisher: 'Nice Home Care Services',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://nicehomecareservices.com',
    siteName: 'Nice Home Care Services',
    title: 'Nice Home Care Services | Cuidados Compasivos para Adultos Mayores',
    description:
      'Atención personalizada en el hogar para adultos mayores. Profesionales capacitados que brindan cuidados con calidez, dignidad y respeto.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nice Home Care Services - Cuidado compasivo para adultos mayores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nice Home Care Services | Cuidados Compasivos para Adultos Mayores',
    description:
      'Atención personalizada en el hogar para adultos mayores. Profesionales capacitados que brindan cuidados con calidez, dignidad y respeto.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
  },
}

// Viewport separado para mejor compatibilidad
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fbf9' },
    { media: '(prefers-color-scheme: dark)', color: '#252525' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        {children}
        {/* Analytics solo en producción */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}