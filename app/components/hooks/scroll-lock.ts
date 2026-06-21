// hooks/use-scroll-lock.ts
import { useEffect, useRef } from "react"

interface UseScrollLockOptions {
  autoLock?: boolean
  lockTarget?: HTMLElement | string
}

export function useScrollLock(
  isLocked: boolean,
  options: UseScrollLockOptions = {}
) {
  const { autoLock = true, lockTarget = document.body } = options
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    if (!autoLock) return

    const target = typeof lockTarget === "string" 
      ? document.querySelector(lockTarget) as HTMLElement
      : lockTarget

    if (!target) return

    if (isLocked) {
      // Guardar posición actual del scroll
      scrollPositionRef.current = window.scrollY
      
      // Aplicar estilos para bloquear scroll
      target.style.overflow = "hidden"
      target.style.position = "fixed"
      target.style.top = `-${scrollPositionRef.current}px`
      target.style.width = "100%"
      target.style.paddingRight = getScrollbarWidth() + "px"
    } else {
      // Restaurar scroll
      target.style.overflow = ""
      target.style.position = ""
      target.style.top = ""
      target.style.width = ""
      target.style.paddingRight = ""
      
      window.scrollTo(0, scrollPositionRef.current)
    }

    return () => {
      // Cleanup: asegurar que se restaura el scroll
      if (target) {
        target.style.overflow = ""
        target.style.position = ""
        target.style.top = ""
        target.style.width = ""
        target.style.paddingRight = ""
      }
    }
  }, [isLocked, autoLock, lockTarget])
}

// Helper: obtener el ancho de la scrollbar
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth
}