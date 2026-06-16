"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Sobre Nosotros", href: "/#nosotros" },
  { label: "Contacto", href: "/#contacto" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

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

  // Cerrar menú al hacer clic en un enlace
  const handleLinkClick = () => {
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        <Link href="/#inicio" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="size-5" fill="currentColor" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
              Nice Home Care
            </span>
            <span className="text-xs text-muted-foreground">Cuidados en Casa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button asChild className="rounded-full px-5">
            <Link href="/#contacto">Solicitar Consulta</Link>
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
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="mt-2 w-full rounded-full">
              <Link href="/#contacto" onClick={handleLinkClick}>
                Solicitar Consulta
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}