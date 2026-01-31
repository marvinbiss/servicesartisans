'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, LogOut, Send, Search, ArrowLeft } from 'lucide-react'

const conversations = [
  {
    id: 1,
    artisan: 'Martin Plomberie',
    avatar: 'MP',
    lastMessage: 'Bonjour, je confirme notre rendez-vous pour demain à 14h.',
    time: '10:30',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    artisan: 'Électricité Plus',
    avatar: 'EP',
    lastMessage: 'Le devis a été envoyé, n\'hésitez pas si vous avez des questions.',
    time: 'Hier',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    artisan: 'Peinture Pro',
    avatar: 'PP',
    lastMessage: 'Merci pour votre confiance, les travaux débuteront lundi.',
    time: 'Lun',
    unread: 0,
    online: true,
  },
]

const messages = [
  { id: 1, sender: 'artisan', text: 'Bonjour, j\'ai bien reçu votre demande de devis.', time: '09:00' },
  { id: 2, sender: 'artisan', text: 'Je peux intervenir cette semaine si cela vous convient.', time: '09:01' },
  { id: 3, sender: 'client', text: 'Bonjour, oui ce serait parfait ! Demain après-midi ?', time: '09:15' },
  { id: 4, sender: 'artisan', text: 'Demain 14h me convient parfaitement.', time: '09:20' },
  { id: 5, sender: 'client', text: 'Super, je vous envoie l\'adresse exacte.', time: '09:22' },
  { id: 6, sender: 'artisan', text: 'Bonjour, je confirme notre rendez-vous pour demain à 14h.', time: '10:30' },
]

export default function MessagesClientPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setNewMessage('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/espace-client" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600">Vos conversations avec les artisans</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-xl shadow-sm p-4 space-y-1">
              <Link
                href="/espace-client"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Mes demandes
              </Link>
              <Link
                href="/espace-client/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">2</span>
              </Link>
              <Link
                href="/espace-client/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Mes avis
              </Link>
              <Link
                href="/espace-client/parametres"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Paramètres
              </Link>
              <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full">
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </nav>
          </div>

          {/* Messages */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden h-[600px] flex">
              {/* Conversations list */}
              <div className="w-1/3 border-r">
                <div className="p-4 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto h-[calc(100%-73px)]">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                        selectedConversation.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                          {conv.avatar}
                        </div>
                        {conv.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">{conv.artisan}</span>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unread > 0 && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                          {conv.unread}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="p-4 border-b flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {selectedConversation.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.artisan}</h3>
                    <span className="text-sm text-green-600">
                      {selectedConversation.online ? 'En ligne' : 'Hors ligne'}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === 'client'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.text}</p>
                        <span
                          className={`text-xs ${
                            message.sender === 'client' ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
