// components/customer-support.tsx
"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/hooks/use-user'
import { LiveChat } from './live-chat'
import { NotificationBell } from './notifications'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Bell, X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CustomerSupport() {
  const [showChat, setShowChat] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user } = useUser()
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // Detectar mensajes no leídos (simulado)
  useEffect(() => {
    const interval = setInterval(() => {
      // Aquí iría la lógica real de conteo
      setUnreadMessages(Math.floor(Math.random() * 3))
      setUnreadNotifications(Math.floor(Math.random() * 2))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0"
            >
              <div className="w-80 bg-background border border-border rounded-lg shadow-xl">
                <div className="p-3 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold">Notificaciones</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <NotificationBell userId={user?.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showChat && (
          <LiveChat
            userId={user?.id}
            userName={user?.name}
            userEmail={user?.email}
          />
        )}

        {/* Botones flotantes */}
        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowChat(!showChat)}
            className="relative p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="size-5" />
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadMessages}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 bg-secondary text-secondary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadNotifications}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.open('/help', '_blank')}
            className="p-3 bg-muted text-muted-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <HelpCircle className="size-5" />
          </motion.button>
        </div>
      </div>
    </>
  )
}