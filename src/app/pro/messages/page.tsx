'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Send,
  Paperclip,
  Image,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Clock,
  User,
  ArrowLeft,
} from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  type: 'text' | 'image' | 'file'
}

interface Conversation {
  id: string
  clientName: string
  clientAvatar?: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  service?: string
  messages: Message[]
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    clientName: 'Marie Martin',
    lastMessage: 'D\'accord, je vous attends demain à 9h alors !',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
    unreadCount: 2,
    isOnline: true,
    service: 'Rénovation salle de bain',
    messages: [
      { id: '1', content: 'Bonjour, je souhaite rénover ma salle de bain', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), status: 'read', type: 'text' },
      { id: '2', content: 'Bonjour Marie ! Bien sûr, pouvez-vous me donner plus de détails sur votre projet ?', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), status: 'read', type: 'text' },
      { id: '3', content: 'Je voudrais remplacer la baignoire par une douche italienne et refaire tout le carrelage', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read', type: 'text' },
      { id: '4', content: 'Parfait, je peux passer demain à 9h pour faire un devis. Cela vous convient ?', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'read', type: 'text' },
      { id: '5', content: 'D\'accord, je vous attends demain à 9h alors !', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'delivered', type: 'text' },
    ],
  },
  {
    id: '2',
    clientName: 'Pierre Durand',
    lastMessage: 'Merci pour votre intervention rapide !',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unreadCount: 0,
    isOnline: false,
    service: 'Réparation fuite',
    messages: [
      { id: '1', content: 'Urgence ! J\'ai une fuite sous l\'évier', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), status: 'read', type: 'text' },
      { id: '2', content: 'J\'arrive dans 30 minutes', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4.5), status: 'read', type: 'text' },
      { id: '3', content: 'Merci pour votre intervention rapide !', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), status: 'read', type: 'text' },
    ],
  },
  {
    id: '3',
    clientName: 'Sophie Lefebvre',
    lastMessage: 'Pouvez-vous me faire un devis pour l\'installation ?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 1,
    isOnline: true,
    service: 'Installation chauffe-eau',
    messages: [
      { id: '1', content: 'Bonjour, je cherche un plombier pour installer un chauffe-eau thermodynamique', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), status: 'read', type: 'text' },
      { id: '2', content: 'Bonjour Sophie, oui je fais ce type d\'installation. Quelle capacité souhaitez-vous ?', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), status: 'read', type: 'text' },
      { id: '3', content: 'Pouvez-vous me faire un devis pour l\'installation ?', senderId: 'client', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'delivered', type: 'text' },
    ],
  },
]

function formatMessageTime(date: Date) {
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Hier'
  return format(date, 'd MMM', { locale: fr })
}

export default function ProMessagesPage() {
  const [conversations, setConversations] = useState(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversation?.messages])

  const filteredConversations = conversations.filter((c) =>
    c.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: 'me',
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    }

    setConversations(
      conversations.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              messages: [...c.messages, message],
              lastMessage: newMessage,
              lastMessageTime: new Date(),
            }
          : c
      )
    )

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
    })

    setNewMessage('')
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex">
      {/* Conversations List */}
      <div
        className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col ${
          selectedConversation && isMobileView ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation)
                setIsMobileView(true)
              }}
              className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
                {conversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-900">{conversation.clientName}</span>
                  <span className="text-xs text-slate-400">
                    {formatMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>
                {conversation.service && (
                  <div className="text-xs text-blue-600 mb-1">{conversation.service}</div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 truncate">{conversation.lastMessage}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col bg-slate-50 ${
          !selectedConversation && isMobileView ? 'hidden md:flex' : 'flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-4">
              <button
                onClick={() => {
                  setSelectedConversation(null)
                  setIsMobileView(false)
                }}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                {selectedConversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{selectedConversation.clientName}</div>
                <div className="text-sm text-slate-500">
                  {selectedConversation.isOnline ? 'En ligne' : 'Hors ligne'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-slate-500" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-slate-500" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      message.senderId === 'me'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-slate-900 rounded-bl-md shadow-sm'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${
                        message.senderId === 'me' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      <span className="text-xs">{format(message.timestamp, 'HH:mm')}</span>
                      {message.senderId === 'me' && (
                        <>
                          {message.status === 'sent' && <Clock className="w-3 h-3" />}
                          {message.status === 'delivered' && <Check className="w-3 h-3" />}
                          {message.status === 'read' && <CheckCheck className="w-3 h-3" />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-slate-500" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Image className="w-5 h-5 text-slate-500" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Vos messages</h3>
              <p className="text-slate-500">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
