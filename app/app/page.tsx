// app/page.tsx
import { COMPANY, SERVICE_TYPES, VALUES } from '@/lib/company'
import { getTranslation } from '@/lib/translations'
import { AdvancedConsultationForm } from '@/components/advanced-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Heart,
  Users,
  Shield,
  Clock,
  Phone,
  Mail,
  MapPin,
  Home,
  Utensils,
  ShoppingBag,
  Car,
  Pill,
  Sparkles,
  User,
} from 'lucide-react'
import Link from 'next/link'

// Mapeo de íconos para servicios (usando Lucide)
const serviceIcons = {
  companionship: Users,
  'meal-preparation': Utensils,
  'errands-shopping': ShoppingBag,
  transportation: Car,
  'medication-reminders': Pill,
  'light-housekeeping': Sparkles,
  'personal-care': User,
}

// Mapeo de íconos para valores
const valueIcons = {
  dignity: Heart,
  safety: Shield,
  personalized: Users,
  communication: Phone,
  love: Heart,
}

export default function HomePage({
  params,
}: {
  params?: { lang?: string }
}) {
  // Idioma por defecto (se puede obtener de la URL o cookie, pero aquí usamos 'es' por defecto)
  const lang = params?.lang || 'es'
  const t = (key: string) => getTranslation(lang as 'es' | 'en', key)

  return (
    <main className="min-h-screen">
      {/* ====== HERO ====== */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-white py-20 md:py-28 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
                {COMPANY.name}
              </h1>
              <p className="text-xl md:text-2xl text-emerald-700 font-semibold mt-2">
                {COMPANY.slogan[lang]}
              </p>
              <p className="text-lg text-gray-600 mt-4 max-w-lg">
                {COMPANY.description[lang]}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="#contacto">{t('home.cta')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#servicios">{t('home.services')}</Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="size-4" /> {COMPANY.phone}
                </span>
                <span className="hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <Mail className="size-4" /> {COMPANY.email}
                </span>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-emerald-100 flex items-center justify-center shadow-2xl">
                <span className="text-7xl md:text-8xl">🏠</span>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg">
                <Heart className="size-8 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-600/5 rounded-l-full -z-0" />
      </section>

      {/* ====== SERVICIOS ====== */}
      <section id="servicios" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            {t('home.servicesTitle')}
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            {t('home.servicesSubtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(SERVICE_TYPES).map(([key, value]) => {
              const Icon = serviceIcons[key as keyof typeof serviceIcons] || Home
              return (
                <Card key={key} className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="size-6 text-emerald-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {lang === 'es' ? value.es : value.en}
                    </h3>
                    {/* Descripciones cortas (las tomamos de un objeto extra) */}
                    <p className="text-sm text-gray-500 mt-2">
                      {lang === 'es' ? value.desc_es : value.desc_en}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== VALORES / COMPROMISO ====== */}
      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            {t('home.valuesTitle')}
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            {t('home.valuesSubtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VALUES.map((value, index) => {
              const Icon = valueIcons[value.icon as keyof typeof valueIcons] || Heart
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Icon className="size-5 text-emerald-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {lang === 'es' ? value.title_es : value.title_en}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {lang === 'es' ? value.desc_es : value.desc_en}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ====== CONTACTO Y FORMULARIO ====== */}
      <section id="contacto" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {t('home.contactTitle')}
              </h2>
              <p className="text-gray-600 mb-6">{t('home.contactSubtitle')}</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-emerald-600" />
                  <span className="text-gray-700">{COMPANY.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-emerald-600" />
                  <span className="text-gray-700">{COMPANY.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-emerald-600" />
                  <span className="text-gray-700">{COMPANY.emailAlt}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-emerald-600" />
                  <span className="text-gray-700">{COMPANY.address.full}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-emerald-600" />
                  <span className="text-gray-700">{t('home.schedule')}</span>
                </div>
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-800 font-medium">
                    {COMPANY.serviceArea[lang]}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gray-50 p-6 rounded-xl shadow-md border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {t('home.formTitle')}
                </h3>
                <AdvancedConsultationForm lang={lang as 'es' | 'en'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="font-semibold text-white">{COMPANY.name}</p>
              <p className="text-sm">{COMPANY.slogan[lang]}</p>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>{COMPANY.phone}</p>
              <p>{COMPANY.email}</p>
              <p className="text-xs text-gray-500 mt-1">{COMPANY.website}</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-xs text-center text-gray-500">
            &copy; {new Date().getFullYear()} {COMPANY.name}. {t('home.rights')}
          </div>
        </div>
      </footer>
    </main>
  )
}