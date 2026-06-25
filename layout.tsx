import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './app/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NiceHome Care Services | Professional In-Home Caregiver Agency',
  description: 'Compassionate, professional caregivers providing personalized in-home care services. Vetted professionals, 24/7 support, and trusted by families.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}  style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
