// hooks/use-analytics.ts
"use client"

import { useCallback, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface AnalyticsEvent {
  category: string
  action: string
  label?: string
  value?: number
  timestamp?: number
}

interface ClickTrackingOptions {
  trackClicks?: boolean
  trackNavigation?: boolean
  trackScrollDepth?: boolean
  trackTimeOnPage?: boolean
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export function useAnalytics(options: ClickTrackingOptions = {}) {
  const {
    trackClicks = true,
    trackNavigation = true,
    trackScrollDepth = true,
    trackTimeOnPage = true
  } = options

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const startTimeRef = useRef(Date.now())
  const maxScrollRef = useRef(0)
  const trackedDepthsRef = useRef<Set<number>>(new Set())

  // Evento genérico de analytics
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      url: window.location.href,
      path: pathname
    }

    // Google Analytics
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        page_location: window.location.href
      })
    }

    // Facebook Pixel
    if (typeof window.fbq !== 'undefined') {
      window.fbq('trackCustom', event.action, fullEvent)
    }

    // Google Tag Manager
    if (typeof window.dataLayer !== 'undefined') {
      window.dataLayer.push({
        event: 'custom_event',
        ...fullEvent
      })
    }

    // Consola para debug (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', fullEvent)
    }
  }, [pathname])

  // Tracking de clics en elementos
  const trackClick = useCallback((element: HTMLElement, event: Event) => {
    if (!trackClicks) return

    const clickData = {
      category: 'click',
      action: 'click',
      label: element.getAttribute('aria-label') || 
             element.textContent?.slice(0, 50) || 
             element.tagName,
      value: undefined
    }

    // Obtener metadata adicional
    const link = element.closest('a')
    if (link) {
      clickData.label = `${clickData.label} - ${link.href}`
    }

    const button = element.closest('button')
    if (button) {
      clickData.category = 'button_click'
    }

    trackEvent(clickData)
  }, [trackClicks, trackEvent])

  // Tracking de scroll depth
  const trackScrollDepth = useCallback(() => {
    if (!trackScrollDepth) return

    const scrollPercent = (window.scrollY / 
      (document.documentElement.scrollHeight - window.innerHeight)) * 100
    
    const thresholds = [25, 50, 75, 90, 100]
    
    thresholds.forEach(threshold => {
      if (scrollPercent >= threshold && !trackedDepthsRef.current.has(threshold)) {
        trackedDepthsRef.current.add(threshold)
        trackEvent({
          category: 'scroll',
          action: 'scroll_depth',
          label: `${threshold}%`,
          value: threshold
        })
      }
    })
    
    maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent)
  }, [trackScrollDepth, trackEvent])

  // Tracking de tiempo en página
  useEffect(() => {
    if (!trackTimeOnPage) return

    const handleBeforeUnload = () => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000
      
      trackEvent({
        category: 'engagement',
        action: 'time_on_page',
        label: 'seconds',
        value: Math.round(timeSpent)
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [trackTimeOnPage, trackEvent])

  // Tracking de navegación
  useEffect(() => {
    if (!trackNavigation) return

    trackEvent({
      category: 'navigation',
      action: 'page_view',
      label: pathname,
      value: undefined
    })
  }, [pathname, trackNavigation, trackEvent])

  // Scroll tracking
  useEffect(() => {
    if (!trackScrollDepth) return

    window.addEventListener('scroll', trackScrollDepth, { passive: true })
    trackScrollDepth()

    return () => window.removeEventListener('scroll', trackScrollDepth)
  }, [trackScrollDepth, trackScrollDepth])

  // Click tracking global
  useEffect(() => {
    if (!trackClicks) return

    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target) {
        trackClick(target, e)
      }
    }

    document.addEventListener('click', handleGlobalClick)
    return () => document.removeEventListener('click', handleGlobalClick)
  }, [trackClicks, trackClick])

  return {
    trackEvent,
    trackClick,
    trackScrollDepth,
    getMaxScroll: () => maxScrollRef.current,
    getTimeOnPage: () => (Date.now() - startTimeRef.current) / 1000
  }
}