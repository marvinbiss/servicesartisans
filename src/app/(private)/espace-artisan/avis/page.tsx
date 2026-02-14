'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, MessageSquare, Star, Settings, TrendingUp, Euro, ArrowLeft, ThumbsUp, MessageCircle, Loader2, X } from 'lucide-react'
import LogoutButton from '@/components/LogoutButton'

interface Avis {
  id: string
  client: string
  service: string
  date: string
  note: number
  commentaire: string | null
  reponse: string | null
}

interface Stats {
  moyenne: number
  total: number
  distribution: { note: number; count: number }[]
}

export default function AvisArtisanPage() {
  const [loading, setLoading] = useState(true)
  const [avis, setAvis] = useState<Avis[]>([])
  const [stats, setStats] = useState<Stats>({
    moyenne: 0,
    total: 0,
    distribution: [5, 4, 3, 2, 1].map(note => ({ note, count: 0 })),
  })
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAvis()
  }, [])

  const fetchAvis = async () => {
    try {
      const response = await fetch('/api/artisan/avis')
      const data = await response.json()

      if (response.ok) {
        setAvis(data.avis || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching avis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/artisan/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: reviewId,
          response: replyText.trim(),
        }),
      })

      if (response.ok) {
        // Update local state
        setAvis(prev =>
          prev.map(a =>
            a.id === reviewId ? { ...a, reponse: replyText.trim() } : a
          )
        )
        setReplyingTo(null)
        setReplyText('')
      }
    } catch (error) {
      console.error('Error replying:', error)
    } finally {
      setSubmitting(false)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/espace-artisan" className="text-white/80 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Avis clients</h1>
              <p className="text-blue-100">Consultez et répondez aux avis</p>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <MessageSquare className="w-5 h-5" />
                Messages
                <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">5</span>
              </Link>
              <Link
                href="/espace-artisan/avis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium"
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
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{stats.moyenne}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(stats.moyenne) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-500">Basé sur {stats.total} avis</p>
                </div>
                <div className="space-y-2">
                  {stats.distribution.map((item) => (
                    <div key={item.note} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-12">{item.note} étoiles</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 rounded-full h-2"
                          style={{ width: `${(item.count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Avis list */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Derniers avis
              </h2>
              <div className="space-y-6">
                {avis.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">{item.client}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < item.note ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.service} • {new Date(item.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      {!item.reponse && (
                        <button
                          onClick={() => setReplyingTo(item.id)}
                          className="flex items-center gap-2 text-blue-600 text-sm hover:underline"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Répondre
                        </button>
                      )}
                    </div>
                    <p className="text-gray-700 mb-3">{item.commentaire}</p>

                    {/* Reply form */}
                    {replyingTo === item.id && (
                      <div className="bg-gray-50 rounded-lg p-4 ml-4 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Votre réponse :</p>
                          <button
                            onClick={() => {
                              setReplyingTo(null)
                              setReplyText('')
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Écrivez votre réponse..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                          rows={3}
                        />
                        <button
                          onClick={() => handleReply(item.id)}
                          disabled={submitting || !replyText.trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                          Envoyer
                        </button>
                      </div>
                    )}

                    {item.reponse && (
                      <div className="bg-blue-50 rounded-lg p-4 ml-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Votre réponse :</p>
                        <p className="text-gray-700 text-sm">{item.reponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
              <div className="flex items-start gap-4">
                <ThumbsUp className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Conseil pour améliorer vos avis</h3>
                  <p className="text-green-100 text-sm">
                    Répondez rapidement aux avis de vos clients, même positifs. Cela montre votre professionnalisme
                    et encourage d'autres clients à laisser leur avis. Les artisans qui répondent aux avis
                    peuvent recevoir davantage de demandes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
