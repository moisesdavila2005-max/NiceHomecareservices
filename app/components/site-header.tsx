"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Inicio", href: "/#inicio", section: "inicio" },
  { label: "Servicios", href: "/#servicios", section: "servicios" },
  { label: "Sobre Nosotros", href: "/#nosotros", section: "nosotros" },
  { label: "Contacto", href: "/#contacto", section: "contacto" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("inicio")

  // Scroll suave a una sección
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Altura del header + un poco de margen
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }, [])

  // Manejar clic en enlaces
  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault()
    scrollToSection(sectionId)
    setOpen(false)
    
    // Actualizar URL sin recargar
    window.history.pushState({}, "", `/#${sectionId}`)
  }, [scrollToSection])

  // Detectar sección activa mientras se hace scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navLinks.map(link => link.section)
      
      // Encontrar la sección actualmente visible
      for (const section of sections.reverse()) { // Reverse para priorizar las últimas secciones
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          // Si la sección está en la parte superior de la ventana (con un margen)
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Llamada inicial
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Cerrar menú al redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  // Cerrar menú al presionar ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }
    
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <button
          onClick={() => scrollToSection("inicio")}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
          aria-label="Ir al inicio"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="size-5" fill="currentColor" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Nice Home Care
            </span>
            <span className="text-xs text-muted-foreground">Cuidados en Casa</span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={(e) => handleLinkClick(e, link.section)}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                activeSection === link.section
                  ? "text-foreground border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild className="rounded-full px-5">
            <button onClick={(e) => handleLinkClick(e as any, "contacto")}>
              Solicitar Consulta
            </button>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Menú móvil con overlay */}
      {open && (
        <div className="fixed inset-x-0 top-[73px] bottom-0 z-40 bg-background/95 backdrop-blur-sm md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={(e) => handleLinkClick(e, link.section)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground ${
                  activeSection === link.section
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </button>
            ))}
            <Button asChild className="mt-2 w-full rounded-full">
              <button onClick={(e) => handleLinkClick(e as any, "contacto")}>
                Solicitar Consulta
              </button>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}