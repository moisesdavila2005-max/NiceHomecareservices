import { HeroSection } from './app/components/sections/hero'
import { ServicesSection } from './app/components/sections/services'
import { WhyChooseUs } from './app/components/sections/why-choose-us'
import { TeamSection } from './app/components/sections/team'
import { TestimonialsSection } from './app/components/sections/testimonials'
import { CTASection } from './app/components/sections/cta'
import './app/globals.css'

export const metadata = {
  title: 'NiceHome Care Services | Professional In-Home Caregiver Agency',
  description: 'Compassionate, professional caregivers providing personalized in-home care services. Vetted professionals, 24/7 support, and trusted by families.',
}

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
