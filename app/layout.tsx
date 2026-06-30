import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NiceHome Care Services | Professional In-Home Caregiver Agency',
  description: 'Compassionate, professional caregivers providing personalized in-home care services. Vetted professionals, 24/7 support, and trusted by families.',
  openGraph: {
    title: 'NiceHome Care Services',
    description: 'Professional in-home caregiving with compassion and expertise',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}