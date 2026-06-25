import { HeroSection } from '@/components/sections/hero'
import { ServicesSection } from '@/components/sections/services'
import { WhyChooseUs } from '@/components/sections/why-choose-us'
import { TeamSection } from '@/components/sections/team'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { CTASection } from '@/components/sections/cta'

export default function HomePage() {
  return (
    <div style={{ width: '100%' }}>
      <HeroSection />
      <ServicesSection />
      <WhyChooseUs />
      <TeamSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
