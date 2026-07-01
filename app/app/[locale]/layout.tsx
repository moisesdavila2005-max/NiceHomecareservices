import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { Locale, locales } from '@/i18n'; // Ajusta la ruta según tu configuración
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Genera metadatos estáticos (opcional pero recomendado)
export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  // Validar que el locale sea soportado
  if (!locales.includes(locale)) notFound();

  // Obtener mensajes de traducción
  const messages = await getMessages({ locale });

  // Determinar dirección (RTL/LTR) según el locale
  const direction = locale === 'ar' || locale === 'he' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={inter.className}>
      <body>
        {/* Todos los providers se montan en cliente */}
        <Providers locale={locale} messages={messages} direction={direction}>
          <SiteHeader /> {/* Si SiteHeader usa hooks, debe ir dentro de Providers, o también ser cliente */}
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}