'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, ArrowLeft, Send, Search, Loader2 } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import ArtisanSidebar from '@/components/artisan-dashboard/ArtisanSidebar'
import { getArtisanUrl } from '@/lib/utils'
import { useRealtimeMessages } from '@/lib/hooks/use-realtime-messages'
import { logger } from '@/lib/logger'

interface Partner {
  id: string
  full_name: string | null
}

interface Message {
  id: string
  sender_id: string
  conversation_id: string
  content: string
  created_at: string
  read_at: string | null
}

interface Conversation {
  id: string
  partner: Partner
  lastMessage: Message
  unreadCount: number
}

export default function MessagesArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Real-time: append new messages from Supabase Realtime without re-fetching
  const handleRealtimeMessage = useCallback(
    (msg: {
      id: string
      sender_id: string
      conversation_id: string
      content: string
      created_at: string
      read_at: string | null
    }) => {
      setMessages((prev) => {
        // Deduplicate: skip if already present (e.g. optimistic add after own send)
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    },
    []
  )

  const handleRealtimeUpdate = useCallback(
    (msg: {
      id: string
      sender_id: string
      conversation_id: string
      content: string
      created_at: string
      read_at: string | null
    }) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)))
    },
    []
  )

  useRealtimeMessages(selectedConversation?.id, handleRealtimeMessage, handleRealtimeUpdate)

  useEffect(() => {
    fetchConversations()
    fetchPublicUrl()
  }, [])

  useEffect(() => {
    if (!selectedConversation) return
    const controller = new AbortController()

    const loadMessages = async () => {
      try {
        const response = await fetch(
          `/api/artisan/messages?conversation_id=${selectedConversation.id}`,
          { signal: controller.signal }
        )
        const data = await response.json()

        if (response.ok) {
          setMessages(data.messages || [])
          if (data.currentUserId) {
            setCurrentUserId(data.currentUserId)
          } else if (data.messages?.length > 0) {
            const msg = data.messages.find(
              (m: Message) => m.sender_id !== selectedConversation.partner.id
            )
            if (msg) setCurrentUserId(msg.sender_id)
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        logger.error('Error fetching messages', err)
        setError('Impossible de charger les messages.')
      }
    }

    loadMessages()
    return () => controller.abort()
  }, [selectedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/artisan/messages')
      const data = await response.json()

      if (response.ok) {
        setConversations(data.conversations || [])
        if (data.conversations?.length > 0) {
          setSelectedConversation(data.conversations[0])
        }
      } else {
        setError('Impossible de charger les conversations.')
      }
    } catch (err) {
      logger.error('Error fetching conversations', err)
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicUrl = async () => {
    try {
      const response = await fetch('/api/artisan/stats')
      const data = await response.json()
      if (response.ok && data.provider) {
        const url = getArtisanUrl({
          stable_id: data.provider.stable_id ?? null,
          slug: data.provider.slug ?? null,
          specialty: data.provider.specialty ?? null,
          city: data.provider.address_city ?? null,
        })
        setPublicUrl(url)
      }
    } catch {
      // Silently fail — link just won't show
    }
  }

  const fetchMessages = async (conversationId: string, partnerId: string) => {
    try {
      const response = await fetch(`/api/artisan/messages?conversation_id=${conversationId}`)
      const data = await response.json()

      if (response.ok) {
        setMessages(data.messages || [])
        // Extract current user ID from API response (preferred) or infer from messages
        if (data.currentUserId) {
          setCurrentUserId(data.currentUserId)
        } else if (data.messages?.length > 0) {
          // Infer: the sender that is NOT the partner is the current user
          const msg = data.messages.find((m: Message) => m.sender_id !== partnerId)
          if (msg) setCurrentUserId(msg.sender_id)
        }
      }
    } catch (err) {
      logger.error('Error fetching messages', err)
      setError('Impossible de charger les messages.')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/artisan/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation.id,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage('')
        setSendError(null)
        // Refresh messages
        fetchMessages(selectedConversation.id, selectedConversation.partner.id)
      } else {
        setSendError("Impossible d'envoyer le message. Veuillez réessayer.")
      }
    } catch (err) {
      logger.error('Error sending message', err)
      setSendError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setSendingMessage(false)
    }
  }

  const getAvatar = (partner: Partner) => {
    const name = partner.full_name || 'U'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getDisplayName = (partner: Partner) => {
    return partner.full_name || 'Utilisateur'
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris',
      })
    } else if (days === 1) {
      return 'Hier'
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short', timeZone: 'Europe/Paris' })
    }
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      timeZone: 'Europe/Paris',
    })
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb
            items={[{ label: 'Espace Artisan', href: '/espace-artisan' }, { label: 'Messages' }]}
          />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan/dashboard" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-primary-100">Communiquez avec vos clients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar activePage="messages" publicUrl={publicUrl} />

          {/* Messages */}
          <main id="main-content" className="lg:col-span-3">
            {error && (
              <div
                role="alert"
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </div>
            )}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center h-[400px] sm:h-[600px] flex items-center justify-center">
                <div>
                  <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
                  <p className="text-charcoal-600">Chargement des messages...</p>
                </div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center h-[400px] sm:h-[600px] flex items-center justify-center">
                <div>
                  <MessageSquare className="w-12 h-12 text-sand-500 mx-auto mb-4" />
                  <h3 className="font-medium text-charcoal-900 mb-2">Aucune conversation</h3>
                  <p className="text-charcoal-500">
                    Vos conversations avec les clients apparaîtront ici.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[70vh] sm:h-[600px] flex flex-col sm:flex-row">
                {/* Conversations list */}
                <div className="sm:w-1/3 border-b sm:border-b-0 sm:border-r max-h-[35vh] sm:max-h-none">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -trancharcoal-y-1/2 w-4 h-4 text-charcoal-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-sand-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto h-[calc(100%-73px)]">
                    {conversations
                      .filter(
                        (conv) =>
                          !searchQuery ||
                          getDisplayName(conv.partner)
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                      )
                      .map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full p-4 flex items-start gap-3 hover:bg-sand-50 transition-colors ${
                            selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="w-12 h-12 bg-sand-300 rounded-full flex items-center justify-center text-charcoal-600 font-semibold">
                            {getAvatar(conv.partner)}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-charcoal-900 truncate">
                                {getDisplayName(conv.partner)}
                              </span>
                              <span className="text-xs text-charcoal-500">
                                {formatTime(conv.lastMessage.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-charcoal-500 truncate">
                              {conv.lastMessage.content}
                            </p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Chat */}
                <div className="flex-1 flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat header */}
                      <div className="p-4 border-b flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sand-300 rounded-full flex items-center justify-center text-charcoal-600 font-semibold">
                            {getAvatar(selectedConversation.partner)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-charcoal-900">
                              {getDisplayName(selectedConversation.partner)}
                            </h3>
                          </div>
                        </div>
                        <Link
                          href="/espace-artisan/demandes-recues"
                          className="text-sm text-primary-500 hover:underline"
                        >
                          Voir la demande
                        </Link>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => {
                          const isOwnMessage = message.sender_id === currentUserId
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-sand-100 text-charcoal-900'
                                }`}
                              >
                                <p>{message.content}</p>
                                <span
                                  className={`text-xs ${
                                    isOwnMessage ? 'text-primary-100' : 'text-charcoal-500'
                                  }`}
                                >
                                  {formatTime(message.created_at)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t">
                        {sendError && (
                          <div
                            role="alert"
                            className="p-2 mb-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm"
                          >
                            {sendError}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Écrivez votre message..."
                            className="flex-1 px-4 py-2 border border-sand-300 rounded-lg focus:ring-2 focus:ring-primary-400"
                            disabled={sendingMessage}
                          />
                          <button
                            type="submit"
                            disabled={sendingMessage || !newMessage.trim()}
                            className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                          >
                            {sendingMessage ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-charcoal-500">
                      Sélectionnez une conversation
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
