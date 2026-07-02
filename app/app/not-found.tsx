import { COMPANY } from '@/lib/company'
import { getTranslation } from '@/lib/translations'

export default function NotFound({ params }: { params: { lang?: string } }) {
  const lang = params?.lang || 'es'
  const t = (key: string) => getTranslation(lang as 'es' | 'en', key)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="text-7xl md:text-9xl font-extrabold text-emerald-600 drop-shadow-sm">404</div>
        <h1 className="text-3xl font-bold mt-4 text-gray-800">{t('404.title')}</h1>
        <p className="text-gray-600 mt-2 text-lg">{t('404.description')}</p>
        <p className="text-sm text-muted-foreground mt-1">{COMPANY.slogan[lang]}</p>
        <a href="/" className="inline-flex items-center mt-6 bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 transition shadow-md">
          <i className="fas fa-home mr-2"></i>{t('404.button')}
        </a>
        <p className="text-sm text-gray-400 mt-6" dangerouslySetInnerHTML={{ __html: t('404.help') }} />
        <div className="mt-4 text-xs text-gray-400">
          {COMPANY.phone} · {COMPANY.email} · {COMPANY.website}
        </div>
      </div>
    </div>
  )
}