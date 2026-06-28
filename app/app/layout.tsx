import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nice Home Care Services | Cuidado en el Hogar en California",
  description: "Servicios profesionales de cuidado en el hogar en Santa Clara, San Jose, Cupertino, Milpitas y Sunnyvale. 24/7, atención personalizada para adultos mayores. Licencia pendiente.",
  keywords: ["cuidado en el hogar", "home care", "Santa Clara", "San Jose", "Cupertino", "cuidados para adultos mayores", "California"],
  openGraph: {
    title: "Nice Home Care Services",
    description: "Cuidado confiable y compasivo en el hogar del Valle de Santa Clara.",
    images: [{ url: "/og-image.jpg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Google Tag Manager (noscript) - Respaldo si JavaScript está desactivado */}
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-MT4PSJZR"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        {children}

        {/* Google Tag Manager - Script Principal de seguimiento */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MT4PSJZR');
          `}
        </Script>
      </body>
    </html>
  );
}
