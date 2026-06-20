import dynamic from 'next/dynamic'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Values } from '@/components/values'
import { SiteFooter } from '@/components/site-footer'

// Componente de carga optimizado
function SectionLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// Dynamic imports con SSR habilitado para mantener SEO
const Team = dynamic(
  () => import('@/components/team').then((mod) => mod.Team),
  {
    loading: () => <SectionLoader />,
    ssr: true, // Mantener SSR para SEO
  }
)

const Contact = dynamic(
  () => import('@/components/contact').then((mod) => mod.Contact),
  {
    loading: () => <SectionLoader />,
    ssr: true, // Mantener SSR para SEO
  }
)

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <WhyChooseUs />
        <Values />
        <Team />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}