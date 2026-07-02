import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; import { SpeedInsights } from "@vercel/speed-insights/next"
import { Script } from 'next/script';
import { "./globals.css" }
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nice Home Care Services | Cuidado en el Hogar en San Jose California",
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
      lang="es" | "en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {/* Aquí puedes importar e incluir tu <Navbar /> en el futuro */}
        
        {/* 2. <main> asegura que el contenido ocupe el espacio disponible y empuje el Footer abajo */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Aquí puedes importar e incluir tu <Footer /> en el futuro */}

        {/* Google Analytics 4 (GA4) - REEMPLAZAR EL ID CUANDO LO TENGAS */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GTM-GT4PSJZR" 
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GTM-MT4PSJZR, {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </body>
    </html>
  );
}
