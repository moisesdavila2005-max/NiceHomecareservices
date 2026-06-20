import { Suspense, lazy } from 'react'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { WhyChooseUs } from '@/components/why-choose-us'
import { Values } from '@/components/values'
import { Team } from '@/components/team'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'

// Componente de carga para lazy loading
function SectionLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

// Lazy loading para secciones que no están en el fold inicial
const LazyTeam = lazy(() =>
  import('@/components/team').then((mod) => ({ default: mod.Team }))
)
const LazyContact = lazy(() =>
  import('@/components/contact').then((mod) => ({ default: mod.Contact }))
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
        <Suspense fallback={<SectionLoader />}>
          <LazyTeam />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LazyContact />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  )
}

// Alternativa sin lazy loading para mejor SEO (si prefieres)
export function PageWithAllComponents() {
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