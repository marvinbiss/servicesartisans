'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, Send, Search, Paperclip, ExternalLink } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { QuickSiteLinks } from '@/components/InternalLinks'
import LogoutButton from '@/components/LogoutButton'

const conversations = [
  {
    id: 1,
    client: 'Jean Dupont',
    avatar: 'JD',
    lastMessage: 'D\'accord, à demain 14h alors !',
    time: '10:30',
    unread: 2,
    service: 'Réparation fuite',
  },
  {
    id: 2,
    client: 'Marie Lambert',
    avatar: 'ML',
    lastMessage: 'Merci pour le devis, je vous recontacte rapidement.',
    time: 'Hier',
    unread: 0,
    service: 'Installation chauffe-eau',
  },
  {
    id: 3,
    client: 'Pierre Martin',
    avatar: 'PM',
    lastMessage: 'Super travail, merci beaucoup !',
    time: 'Lun',
    unread: 0,
    service: 'Débouchage canalisation',
  },
  {
    id: 4,
    client: 'Sophie Bernard',
    avatar: 'SB',
    lastMessage: 'Pouvez-vous me faire un devis ?',
    time: 'Dim',
    unread: 1,
    service: 'Recherche de fuite',
  },
]

const messages = [
  { id: 1, sender: 'client', text: 'Bonjour, je vous contacte suite à ma demande de devis.', time: '09:00' },
  { id: 2, sender: 'artisan', text: 'Bonjour M. Dupont, j\'ai bien reçu votre demande.', time: '09:05' },
  { id: 3, sender: 'artisan', text: 'Je peux intervenir demain après-midi si cela vous convient.', time: '09:06' },
  { id: 4, sender: 'client', text: 'Oui, 14h serait parfait pour moi.', time: '09:15' },
  { id: 5, sender: 'artisan', text: 'Très bien, c\'est noté. Pouvez-vous me confirmer l\'adresse exacte ?', time: '09:20' },
  { id: 6, sender: 'client', text: '15 rue de la Paix, 75015 Paris, code 1234', time: '10:25' },
  { id: 7, sender: 'client', text: 'D\'accord, à demain 14h alors !', time: '10:30' },
]

export default function MessagesArtisanPage() {
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
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[
            { label: 'Espace Artisan', href: '/espace-artisan' },
            { label: 'Messages' }
          ]} />
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Messages</h1>
              <p className="text-blue-100">Communiquez avec vos clients</p>
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
                href="/espace-artisan"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-5 h-5" />
                Tableau de bord
              </Link>
              <Link
                href="/espace-artisan/demandes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-5 h-5" />
                Demandes
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </Link>
              <Link
                href="/espace-artisan/messages"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">5</span>
              </Link>
              <Link
                href="/espace-artisan/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Star className="w-5 h-5" />
                Avis clients
              </Link>
              <Link
                href="/espace-artisan/profil"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-5 h-5" />
                Mon profil
              </Link>
              <Link
                href="/espace-artisan/abonnement"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Euro className="w-5 h-5" />
                Abonnement
              </Link>
              <LogoutButton />
            </nav>

            {/* Voir mon profil public */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <Link
                href="/services/artisan/martin-plomberie-paris"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Voir mon profil public
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-4">
              <QuickSiteLinks />
            </div>

            {/* Additional links */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
              <h4 className="font-medium text-gray-900 mb-3">Liens utiles</h4>
              <div className="space-y-2 text-sm">
                <Link href="/services" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Parcourir les services
                </Link>
                <Link href="/recherche" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 py-1">
                  <Search className="w-4 h-4" />
                  Rechercher un artisan
                </Link>
              </div>
            </div>
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
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                        {conv.avatar}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">{conv.client}</span>
                          <span className="text-xs text-gray-500">{conv.time}</span>
                        </div>
                        <p className="text-xs text-blue-600 mb-1">{conv.service}</p>
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
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                      {selectedConversation.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.client}</h3>
                      <span className="text-sm text-blue-600">{selectedConversation.service}</span>
                    </div>
                  </div>
                  <Link
                    href="/espace-artisan/demandes"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Voir la demande
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'artisan' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender === 'artisan'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.text}</p>
                        <span
                          className={`text-xs ${
                            message.sender === 'artisan' ? 'text-blue-200' : 'text-gray-500'
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
                    <button
                      type="button"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
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
