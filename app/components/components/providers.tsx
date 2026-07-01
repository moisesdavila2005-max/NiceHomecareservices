'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider'; // Ajusta según tu implementación
import { NextIntlClientProvider } from 'next-intl';
import { GSAPProvider } from '@/components/gsap-provider';
import { KeyboardScrollProvider } from '@/components/keyboard-scroll-provider';
import { Toaster } from 'react-hot-toast';
import { ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
  locale: string;
  messages: any;
  direction: 'ltr' | 'rtl';
}

export function Providers({ children, locale, messages, direction }: ProvidersProps) {
  // ✅ Cada cliente tiene su propia instancia de QueryClient
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <GSAPProvider>
            <KeyboardScrollProvider>
              {children}
              <CustomerSupport /> {/* Mueve CustomerSupport aquí si es cliente */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  },
                }}
              />
            </KeyboardScrollProvider>
          </GSAPProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}