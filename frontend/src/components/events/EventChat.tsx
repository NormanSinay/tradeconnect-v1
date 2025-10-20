import React, { useEffect, useState, useRef } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ChatMessagePayload } from '@/types/websocket.types'

interface EventChatProps {
  eventId: string
  className?: string
  maxHeight?: string
}

interface ChatMessage extends ChatMessagePayload {
  id: string
  timestamp: Date
}

export const EventChat: React.FC<EventChatProps> = ({
  eventId,
  className,
  maxHeight = '400px'
}) => {
  const { user } = useAuth()
  const { subscribe, sendMessage, joinEvent, leaveEvent, isConnected } = useWebSocket()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isConnected && eventId) {
      joinEvent(eventId)

      const unsubscribe = subscribe('chat_message', (data: ChatMessagePayload) => {
        if (data.eventId === eventId) {
          const message: ChatMessage = {
            ...data,
            id: `${data.timestamp.getTime()}-${data.userId}`,
            timestamp: new Date(data.timestamp)
          }
          setMessages(prev => [...prev, message])
        }
      })

      return () => {
        unsubscribe()
        leaveEvent(eventId)
      }
    }
    return undefined
  }, [eventId, isConnected, joinEvent, leaveEvent, subscribe])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    const messagePayload: ChatMessagePayload = {
      id: `${Date.now()}-${user.id}`,
      eventId,
      message: newMessage.trim(),
      senderName: user.name,
      isPrivate: false,
      userId: user.id,
      timestamp: new Date()
    }

    sendMessage('chat_message', messagePayload)
    setNewMessage('')
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Conectando al chat del evento...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Chat del Evento
          <Badge variant="outline" className="ml-auto">
            <Users className="h-3 w-3 mr-1" />
            {messages.length > 0 ? `${new Set(messages.map(m => m.userId)).size} participantes` : '0 participantes'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Messages Area */}
        <div className="px-4 overflow-y-auto" style={{ height: maxHeight }}>
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sé el primero en enviar un mensaje</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.userId === user?.id ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="" alt={message.senderName} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${message.userId === user?.id ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(message.timestamp, {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg text-sm ${
                        message.userId === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!newMessage.trim()}
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar • Máximo 500 caracteres
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventChat