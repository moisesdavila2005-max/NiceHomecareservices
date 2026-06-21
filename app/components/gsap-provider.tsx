// components/gsap-provider.tsx
"use client"

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Registrar plugins de GSAP
    gsap.registerPlugin(ScrollTrigger)
    
    // Configuración global de ScrollTrigger
    ScrollTrigger.config({
      limitCallbacks: true,
      ignoreMobileResize: true
    })

    return () => {
      // Limpiar todos los ScrollTriggers al desmontar
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return <>{children}</>
}