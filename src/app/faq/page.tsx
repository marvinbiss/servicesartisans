'use client'

import { useState } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronDown, Search, HelpCircle, ArrowRight } from 'lucide-react'

const faqCategories = [
  {
    name: 'Général',
    questions: [
      {
        q: 'Qu\'est-ce que ServicesArtisans ?',
        a: 'ServicesArtisans est une plateforme gratuite qui met en relation les particuliers avec des artisans qualifiés et vérifiés. Nous couvrons plus de 50 métiers du bâtiment dans toute la France.',
      },
      {
        q: 'Le service est-il gratuit ?',
        a: 'Oui, notre service est entièrement gratuit pour les particuliers. Vous pouvez demander autant de devis que vous le souhaitez sans aucun engagement.',
      },
      {
        q: 'Comment fonctionne ServicesArtisans ?',
        a: 'C\'est simple : 1) Décrivez votre projet, 2) Recevez jusqu\'à 3 devis d\'artisans qualifiés, 3) Comparez et choisissez le professionnel qui vous convient.',
      },
    ],
  },
  {
    name: 'Demande de devis',
    questions: [
      {
        q: 'Comment demander un devis ?',
        a: 'Cliquez sur "Demander un devis", remplissez le formulaire en décrivant votre projet, et nous transmettons votre demande aux artisans qualifiés de votre région.',
      },
      {
        q: 'Combien de devis vais-je recevoir ?',
        a: 'Vous recevrez jusqu\'à 3 devis d\'artisans différents, généralement sous 24 à 48 heures.',
      },
      {
        q: 'Suis-je obligé d\'accepter un devis ?',
        a: 'Non, vous êtes libre de refuser tous les devis. Notre service est sans engagement.',
      },
      {
        q: 'Les devis sont-ils vraiment gratuits ?',
        a: 'Oui, les devis sont 100% gratuits et sans engagement. Vous ne payez que si vous décidez de faire appel à un artisan.',
      },
    ],
  },
  {
    name: 'Artisans',
    questions: [
      {
        q: 'Comment sont sélectionnés les artisans ?',
        a: 'Nous vérifions l\'identité, les assurances et les qualifications de chaque artisan. Nous suivons également les avis clients pour maintenir un niveau de qualité élevé.',
      },
      {
        q: 'Les artisans sont-ils assurés ?',
        a: 'Oui, tous nos artisans partenaires doivent justifier d\'une assurance responsabilité civile professionnelle et d\'une garantie décennale pour les travaux concernés.',
      },
      {
        q: 'Puis-je voir les avis sur un artisan ?',
        a: 'Oui, chaque fiche artisan affiche les avis et notes laissés par les clients précédents.',
      },
    ],
  },
  {
    name: 'Paiement & Garanties',
    questions: [
      {
        q: 'Comment payer l\'artisan ?',
        a: 'Le paiement se fait directement entre vous et l\'artisan, selon les modalités convenues ensemble (espèces, chèque, virement, etc.).',
      },
      {
        q: 'Quelles garanties ai-je sur les travaux ?',
        a: 'Les travaux sont couverts par les garanties légales : garantie de parfait achèvement (1 an), garantie biennale (2 ans) et garantie décennale (10 ans) selon la nature des travaux.',
      },
      {
        q: 'Que faire en cas de litige ?',
        a: 'Contactez-nous via notre page Contact. Nous vous accompagnons dans la résolution du litige et pouvons servir de médiateur avec l\'artisan.',
      },
    ],
  },
  {
    name: 'Compte & Données',
    questions: [
      {
        q: 'Dois-je créer un compte ?',
        a: 'Non, vous pouvez demander un devis sans créer de compte. Cependant, un compte vous permet de suivre vos demandes et de conserver votre historique.',
      },
      {
        q: 'Comment supprimer mon compte ?',
        a: 'Vous pouvez demander la suppression de votre compte et de vos données en nous contactant à dpo@servicesartisans.fr.',
      },
      {
        q: 'Mes données sont-elles protégées ?',
        a: 'Oui, nous respectons le RGPD et protégeons vos données. Consultez notre politique de confidentialité pour plus de détails.',
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const filteredCategories = faqCategories.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Questions fréquentes
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Trouvez rapidement les réponses à vos questions
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une question..."
                className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredCategories.map((category) => (
            <div key={category.name} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category.name}
              </h2>
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const id = `${category.name}-${index}`
                  const isOpen = openItems.includes(id)
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-gray-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-gray-600 mb-8">
            Notre équipe est là pour vous aider
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contactez-nous
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
