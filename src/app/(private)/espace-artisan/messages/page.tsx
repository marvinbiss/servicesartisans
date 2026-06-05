'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, ArrowLeft, Search, Loader2, Info } from 'lucide-react'
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
  // null si conversation sans message (l'API ne le garantit pas)
  lastMessage: Message | null
  unreadCount: number
}

export default function MessagesArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [publicUrl, setPublicUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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
              <p className="text-primary-100">Historique de vos conversations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <ArtisanSidebar activePage="messages" publicUrl={publicUrl} />

          {/* Messages */}
          <main id="main-content" className="lg:col-span-3">
            {/* Décision produit 2026-06-05 : espace particulier fermé. Les
                clients ne peuvent plus se connecter — la messagerie interne
                ne leur parvient plus. On conserve l'historique en lecture mais
                on oriente l'artisan vers le contact direct (tel/email du lead). */}
            <div
              role="note"
              className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2"
            >
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                La messagerie interne est en lecture seule : vos clients ne reçoivent plus de
                nouveaux messages ici. Pour les recontacter, utilisez le téléphone ou l'email
                indiqués dans la demande de devis.
              </p>
            </div>
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
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
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
                                {conv.lastMessage ? formatTime(conv.lastMessage.created_at) : ''}
                              </span>
                            </div>
                            <p className="text-sm text-charcoal-500 truncate">
                              {conv.lastMessage?.content ?? 'Aucun message'}
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
                      {/* Lecture seule depuis la fermeture de l'espace
                          particulier (2026-06-05) : l'envoi est désactivé car
                          le client ne reçoit plus les messages internes. */}
                      <div className="p-4 border-t bg-sand-50 text-center text-sm text-charcoal-500">
                        Messagerie en lecture seule. Recontactez ce client via le téléphone ou
                        l'email de sa demande de devis.
                      </div>
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
