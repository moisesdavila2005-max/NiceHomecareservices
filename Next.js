"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
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
    brand: "Nice Home Care Services",
    subtitle: "Estamos aquí para ayudarte",
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
    brand: "Nice Home Care Services",
    subtitle: "We love to help",
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
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // Cargar idioma guardado al montar (solo cliente)
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("nhcs-language") as Language | null
      if (saved && (saved === "es" || saved === "en")) {
        setLanguage(saved)
      }
    } catch {
      // Ignorar errores de localStorage
    }
  }, [])

  // Guardar idioma cuando cambia
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem("nhcs-language", language)
    } catch {
      // Ignorar
    }
    document.documentElement.lang = language
  }, [language, mounted])

  // Medir altura del header para el menú móvil
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
    const observer = new ResizeObserver(() => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight)
      }
    })
    if (headerRef.current) {
      observer.observe(headerRef.current)
    }
    return () => observer.disconnect()
  }, [])

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

  // Cerrar menú al navegar (popstate)
  useEffect(() => {
    const handlePopState = () => setOpen(false)
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
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

  const handleLinkClick = useCallback(() => setOpen(false), [])
  const toggleLanguage = useCallback(() => {
    setLanguage((lang) => (lang === "es" ? "en" : "es"))
  }, [])

  // Memorizar datos según el idioma
  const t = useMemo(() => translations[language], [language])
  const links = useMemo(() => navLinks(language), [language])

  // Evitar hidratación incorrecta: renderizar un placeholder hasta que el cliente esté listo
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Heart className="size-5" fill="currentColor" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
                Nice Home Care Services
              </span>
              <span className="text-xs text-muted-foreground">Cargando...</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="size-10 rounded-full bg-muted" />
            <span className="hidden h-10 w-24 rounded-full bg-muted md:block" />
          </div>
        </div>
      </header>
    )
  }

  // ============================================================
  // 3. RENDER
  // ============================================================
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md transition-colors"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        {/* ---- Logo ---- */}
        <Link
          href="/#inicio"
          className="flex items-center gap-3 group"
          aria-label={t.brand}
        >
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label={t.language}>
                <Globe className="size-4" />
                <span className="ml-1 text-xs font-medium uppercase">{language}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setLanguage("es")}
                className={language === "es" ? "bg-secondary" : ""}
              >
                🇪🇸 Español
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLanguage("en")}
                className={language === "en" ? "bg-secondary" : ""}
              >
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

      {/* ---- Menú móvil con overlay y animación ---- */}
      <div
        className={`fixed inset-x-0 z-40 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out md:hidden ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{ top: headerHeight }}
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
                className={`text-sm font-medium transition-colors ${
                  language === "es" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                🇪🇸 Español
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                onClick={() => setLanguage("en")}
                className={`text-sm font-medium transition-colors ${
                  language === "en" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}