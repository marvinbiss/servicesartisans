'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  HelpCircle,
  Book,
  MessageSquare,
  Phone,
  Mail,
  Video,
  ChevronDown,
  ExternalLink,
  FileText,
  Settings,
  CreditCard,
  Users,
  Calendar,
  Star,
  Shield,
  Zap,
} from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  {
    category: 'Compte',
    question: 'Comment modifier mes informations de profil ?',
    answer: 'Accédez à "Mon Profil" dans le menu latéral, cliquez sur "Modifier" en haut à droite, effectuez vos modifications puis sauvegardez. Vos changements seront visibles immédiatement sur votre profil public.',
  },
  {
    category: 'Compte',
    question: 'Comment changer mon mot de passe ?',
    answer: 'Allez dans Paramètres > Sécurité > Changer le mot de passe. Vous devrez entrer votre mot de passe actuel puis le nouveau mot de passe deux fois pour confirmation.',
  },
  {
    category: 'Leads',
    question: 'Comment recevoir plus de leads ?',
    answer: 'Pour maximiser vos leads : 1) Complétez votre profil à 100%, 2) Ajoutez des photos de vos réalisations, 3) Collectez des avis clients, 4) Passez au plan Pro pour une meilleure visibilité, 5) Répondez rapidement aux demandes.',
  },
  {
    category: 'Leads',
    question: 'Pourquoi je ne reçois pas de leads ?',
    answer: 'Vérifiez que : 1) Votre profil est complet et vérifié, 2) Vos services sont bien configurés, 3) Votre zone d\'intervention est correcte, 4) Vous n\'avez pas atteint la limite de votre plan gratuit.',
  },
  {
    category: 'Paiements',
    question: 'Comment fonctionne la facturation ?',
    answer: 'Votre abonnement est facturé au début de chaque période (mensuelle ou annuelle). Les factures sont disponibles dans Paramètres > Facturation. Vous recevez également un email à chaque paiement.',
  },
  {
    category: 'Paiements',
    question: 'Comment annuler mon abonnement ?',
    answer: 'Accédez à Abonnement > Gérer l\'abonnement > Annuler. Votre abonnement restera actif jusqu\'à la fin de la période payée. Vous ne serez pas remboursé pour la période en cours.',
  },
  {
    category: 'Réservations',
    question: 'Comment gérer mes disponibilités ?',
    answer: 'Dans Réservations > Calendrier, cliquez sur un créneau pour le rendre disponible ou indisponible. Vous pouvez aussi définir vos horaires par défaut dans Paramètres > Horaires.',
  },
  {
    category: 'Réservations',
    question: 'Comment annuler une réservation ?',
    answer: 'Cliquez sur la réservation concernée, puis sur "Annuler". Le client sera automatiquement notifié. Notez qu\'annuler fréquemment peut impacter votre réputation.',
  },
  {
    category: 'Avis',
    question: 'Comment obtenir plus d\'avis ?',
    answer: 'Après chaque intervention, demandez à vos clients satisfaits de laisser un avis. Vous pouvez leur envoyer un lien direct depuis la page de réservation complétée.',
  },
  {
    category: 'Avis',
    question: 'Comment répondre à un avis négatif ?',
    answer: 'Restez professionnel et courtois. Reconnaissez le problème si justifié, expliquez votre version des faits, et proposez une solution. Une bonne réponse peut transformer un avis négatif en opportunité.',
  },
]

const categories = [
  { id: 'all', label: 'Tout', icon: HelpCircle },
  { id: 'Compte', label: 'Compte', icon: Settings },
  { id: 'Leads', label: 'Leads', icon: Users },
  { id: 'Paiements', label: 'Paiements', icon: CreditCard },
  { id: 'Réservations', label: 'Réservations', icon: Calendar },
  { id: 'Avis', label: 'Avis', icon: Star },
]

const quickLinks = [
  { title: 'Guide de démarrage', icon: Book, href: '#' },
  { title: 'Tutoriels vidéo', icon: Video, href: '#' },
  { title: 'Documentation API', icon: FileText, href: '#' },
  { title: 'Conditions d\'utilisation', icon: Shield, href: '#' },
]

export default function ProAidePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const filteredFaqs = faqItems.filter((faq) => {
    if (selectedCategory !== 'all' && faq.category !== selectedCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Comment pouvons-nous vous aider ?
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Trouvez des réponses à vos questions ou contactez notre équipe support
        </p>

        {/* Search */}
        <div className="max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une question..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
          />
        </div>
      </div>

      {/* Quick Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <a
          href="mailto:support@servicesartisans.fr"
          className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Email</div>
            <div className="text-sm text-slate-500">support@servicesartisans.fr</div>
          </div>
        </a>
        <a
          href="tel:+33123456789"
          className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">Téléphone</div>
            <div className="text-sm text-slate-500">01 23 45 67 89</div>
          </div>
        </a>
        <button className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-slate-900">Chat en direct</div>
            <div className="text-sm text-slate-500">Réponse immédiate</div>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.question ? null : faq.question)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <span className="font-medium text-slate-900">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      expandedFaq === faq.question ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.question && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 text-slate-600 border-t border-slate-100 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucun résultat pour votre recherche</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Ressources utiles</h3>
            <div className="space-y-2">
              {quickLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                >
                  <link.icon className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-slate-600 group-hover:text-slate-900">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-300 ml-auto" />
                </a>
              ))}
            </div>
          </div>

          {/* Pro Support */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Support Pro</span>
            </div>
            <p className="text-blue-100 text-sm mb-4">
              Les membres Pro bénéficient d'un support prioritaire avec réponse garantie sous 24h.
            </p>
            <button className="w-full bg-white text-blue-600 py-2.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
              Contacter le support Pro
            </button>
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">État des services</h3>
            <div className="space-y-3">
              {[
                { name: 'Plateforme', status: 'operational' },
                { name: 'Paiements', status: 'operational' },
                { name: 'Messagerie', status: 'operational' },
                { name: 'Notifications', status: 'operational' },
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-600">{service.name}</span>
                  <span className="flex items-center gap-1.5 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                    Opérationnel
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
