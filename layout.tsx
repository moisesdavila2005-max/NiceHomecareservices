// app/[locale]/layout.tsx (actualizado)
import { CustomerSupport } from '@/components/customer-support'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  // ... código existente ...

  return (
    <html lang={locale} dir={direction}>
      <body>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NextIntlClientProvider>
              <GSAPProvider>
                <KeyboardScrollProvider>
                  <SiteHeader />
                  <main>{children}</main>
                  <CustomerSupport />
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 5000,
                      style: {
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)'
                      }
                    }}
                  />
                </KeyboardScrollProvider>
              </GSAPProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}