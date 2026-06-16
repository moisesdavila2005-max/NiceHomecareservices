"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================
// 1. CONFIGURACIÓN DE IDIOMAS
// ============================================================
type Language = "es" | "en"

const translations = {
  es: {
    brand: "Nice Home Care",
    subtitle: "Cuidados en Casa",
    nav: {
      home: "Inicio",
      services: "Servicios",
      about: "Sobre Nosotros",
      contact: "Contacto",
    },
    cta: "Solicitar Consulta",
    menuOpen: "Abrir menú",
    menuClose: "Cerrar menú",
    language: "Idioma",
  },
  en: {
    brand: "Nice Home Care",
    subtitle: "Home Care Services",
    nav: {
      home: "Home",
      services: "Services",
      about: "About Us",
      contact: "Contact",
    },
    cta: "Request Consultation",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    language: "Language",
  },
}

const navLinks = (lang: Language) => [
  { label: translations[lang].nav.home, href: "/#inicio" },
  { label: translations[lang].nav.services, href: "/#servicios" },
  { label: translations[lang].nav.about, href: "/#nosotros" },
  { label: translations[lang].nav.contact, href: "/#contacto" },
]

// ============================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState<Language>("es")
  const [mounted, setMounted] = useState(false)

  // Cargar idioma guardado al montar
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("nhc-language") as Language | null
    if (saved && (saved === "es" || saved === "en")) {
      setLanguage(saved)
    }
  }, [])

  // Guardar idioma cuando cambia
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("nhc-language", language)
      document.documentElement.lang = language
    }
  }, [language, mounted])

  // Cerrar menú al redimensionar a pantalla grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const handleLinkClick = () => setOpen(false)
  const toggleLanguage = () => setLanguage(lang => lang === "es" ? "en" : "es")

  // Evitar hidratación incorrecta
  if (!mounted) return null

  const t = translations[language]
  const links = navLinks(language)

  // ============================================================
  // 3. RENDER
  // ============================================================
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        
        {/* ---- Logo ---- */}
        <Link href="/#inicio" className="flex items-center gap-3 group" aria-label={t.brand}>
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <Heart className="size-5" fill="currentColor" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              {t.brand}
            </span>
            <span className="text-xs text-muted-foreground">{t.subtitle}</span>
          </span>
        </Link>

        {/* ---- Navegación Desktop ---- */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ---- Acciones Desktop ---- */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Selector de idioma */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label={t.language}>
                <Globe className="size-4" />
                <span className="ml-1 text-xs font-medium uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("es")} className={language === "es" ? "bg-secondary" : ""}>
                🇪🇸 Español
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-secondary" : ""}>
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-md transition-all">
            <Link href="/#contacto">{t.cta}</Link>
          </Button>
        </div>

        {/* ---- Botón menú móvil ---- */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary md:hidden"
          aria-label={open ? t.menuClose : t.menuOpen}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* ---- Menú móvil con overlay ---- */}
      {open && (
        <div 
          className="fixed inset-x-0 top-[73px] bottom-0 z-40 bg-background/95 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="mt-4 flex flex-col gap-3">
              <Button asChild className="w-full rounded-full">
                <Link href="/#contacto" onClick={handleLinkClick}>
                  {t.cta}
                </Link>
              </Button>
              
              {/* Selector de idioma en móvil */}
              <div className="flex items-center justify-center gap-4 border-t border-border pt-4">
                <button
                  onClick={() => setLanguage("es")}
                  className={`text-sm font-medium transition-colors ${language === "es" ? "text-primary" : "text-muted-foreground"}`}
                >
                  🇪🇸 Español
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  onClick={() => setLanguage("en")}
                  className={`text-sm font-medium transition-colors ${language === "en" ? "text-primary" : "text-muted-foreground"}`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}