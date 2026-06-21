// components/language-switcher.tsx
"use client"

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { locales, localeNames, type Locale } from '@/i18n'

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLanguage = (locale: Locale) => {
    if (locale === currentLocale) return

    startTransition(() => {
      // Reemplazar el locale en la URL actual
      const newPathname = pathname.replace(`/${currentLocale}`, `/${locale}`)
      router.push(newPathname)
      setIsOpen(false)
    })
  }

  const currentLocaleName = localeNames[currentLocale as Locale]

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
          "hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isOpen && "bg-secondary"
        )}
        aria-label="Cambiar idioma"
        aria-expanded={isOpen}
      >
        <Languages className="size-4" />
        <span className="hidden sm:inline">{currentLocaleName}</span>
        <ChevronDown className={cn("size-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-secondary flex items-center justify-between",
                  currentLocale === locale && "text-primary font-medium bg-secondary/50"
                )}
              >
                {localeNames[locale]}
                {currentLocale === locale && <Check className="size-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}