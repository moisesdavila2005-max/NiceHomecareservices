// components/live-chat.tsx
"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent' | 'bot'
  timestamp: number
  read: boolean
}

interface ChatProps {
  userId?: string
  userName?: string
  userEmail?: string
}

export function LiveChat({ userId, userName, userEmail }: ChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Conectar al socket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/api/socket',
      transports: ['websocket']
    })

    newSocket.on('connect', () => {
      console.log('Chat connected')
      newSocket.emit('join', { userId, userName, userEmail })
    })

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
      if (!isOpen) {
        // Mostrar notificación
        new Notification('Nuevo mensaje', {
          body: message.text,
          icon: '/icon-192.png'
        })
      }
    })

    newSocket.on('typing', ({ isTyping, agentName }) => {
      setIsTyping(isTyping)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [userId, userName, userEmail])

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Enviar mensaje
  const sendMessage = useCallback(() => {
    if (!inputText.trim() || !socket) return

    const message: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
      read: false
    }

    socket.emit('message', message)
    setMessages(prev => [...prev, message])
    setInputText('')
    inputRef.current?.focus()
  }, [inputText, socket])

  // Manejar typing
  const handleTyping = useCallback(() => {
    if (socket) {
      socket.emit('typing', { isTyping: true })
      setTimeout(() => {
        socket.emit('typing', { isTyping: false })
      }, 1000)
    }
  }, [socket])

  // Respuestas automáticas del bot
  const getBotResponse = useCallback((text: string): string => {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('horario') || lowerText.includes('hora')) {
      return 'Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 horas.'
    }
    if (lowerText.includes('precio') || lowerText.includes('costo') || lowerText.includes('tarifa')) {
      return 'Los precios varían según el servicio. ¿Podrías especificar qué servicio te interesa?'
    }
    if (lowerText.includes('servicio') || lowerText.includes('cuidado')) {
      return 'Ofrecemos cuidado de ancianos, asistencia médica, terapia física y compañía. ¿Te gustaría más información sobre alguno en particular?'
    }
    if (lowerText.includes('contacto') || lowerText.includes('teléfono')) {
      return 'Puedes contactarnos al +1 234 567 890 o enviarnos un email a contact@nicehomecare.com'
    }
    if (lowerText.includes('gracias')) {
      return '¡De nada! Estamos aquí para ayudarte. ¿Necesitas algo más?'
    }
    
    return 'Gracias por tu mensaje. Un agente te atenderá en breve. Mientras tanto, ¿puedo ayudarte con algo más específico?'
  }, [])

  // Procesar mensajes del bot (opcional)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.sender === 'user' && socket) {
      // Simular respuesta del bot después de 1 segundo
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now().toString(),
          text: getBotResponse(lastMessage.text),
          sender: 'bot',
          timestamp: Date.now(),
          read: false
        }
        socket.emit('message', botResponse)
        setMessages(prev => [...prev, botResponse])
      }, 1000)
    }
  }, [messages, socket, getBotResponse])

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all"
        aria-label="Abrir chat"
      >
        <MessageCircle className="size-6" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={cn(
        "fixed bottom-8 right-8 z-50 w-96 bg-background border border-border rounded-lg shadow-xl flex flex-col transition-all",
        isMinimized && "h-14"
      )}
    >
      {/* Header del chat */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-primary/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-1 -right-1 animate-pulse" />
            <MessageCircle className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Soporte en Vivo</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping ? 'Alguien está escribiendo...' : 'En línea'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 h-96 overflow-y-auto p-3 space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-2 rounded-lg",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : message.sender === 'bot'
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary p-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                onKeyUp={handleTyping}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  )
}