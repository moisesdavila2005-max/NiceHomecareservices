// components/theme-switcher.tsx
"use client"

import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-secondary animate-pulse" />
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === 'light' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-secondary"
        )}
        aria-label="Modo claro"
      >
        <Sun className="size-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === 'dark' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-secondary"
        )}
        aria-label="Modo oscuro"
      >
        <Moon className="size-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === 'system' 
            ? "bg-primary text-primary-foreground shadow-sm" 
            : "text-muted-foreground hover:bg-secondary"
        )}
        aria-label="Sistema"
      >
        <Monitor className="size-4" />
      </button>
    </div>
  )
}