// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales, defaultLocale } from '@/i18n'
import { KeyboardScrollProvider } from '@/components/keyboard-scroll-provider'
import { SiteHeader } from '@/components/site-header'
import { GSAPProvider } from '@/components/gsap-provider'
import { Inter } from 'next/font/google'
import '@/app/globals.css'

const inter = Inter({ subsets: ['latin'] })

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <GSAPProvider>
            <KeyboardScrollProvider>
              <SiteHeader />
              <main>{children}</main>
            </KeyboardScrollProvider>
          </GSAPProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}