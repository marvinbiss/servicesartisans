'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

const articles = [
  {
    slug: 'comment-choisir-son-plombier',
    title: 'Comment choisir son plombier : le guide complet',
    excerpt: 'Découvrez tous nos conseils pour trouver un plombier de confiance et éviter les arnaques.',
    category: 'Conseils',
    date: '2026-01-15',
    readTime: '5 min',
    image: '🔧',
  },
  {
    slug: 'renovation-energetique-aides-2026',
    title: 'Rénovation énergétique : toutes les aides en 2026',
    excerpt: 'MaPrimeRénov\', CEE, éco-PTZ... Tour d\'horizon des aides pour financer vos travaux de rénovation.',
    category: 'Aides & Subventions',
    date: '2026-01-10',
    readTime: '8 min',
    image: '🏠',
  },
  {
    slug: 'tendances-salle-de-bain-2026',
    title: 'Les tendances salle de bain en 2026',
    excerpt: 'Couleurs, matériaux, équipements... Découvrez les tendances qui vont marquer la salle de bain cette année.',
    category: 'Inspiration',
    date: '2026-01-08',
    readTime: '4 min',
    image: '🛁',
  },
  {
    slug: 'devis-travaux-comprendre',
    title: 'Comment lire et comprendre un devis de travaux',
    excerpt: 'Les éléments essentiels à vérifier avant de signer un devis pour éviter les mauvaises surprises.',
    category: 'Conseils',
    date: '2026-01-05',
    readTime: '6 min',
    image: '📋',
  },
  {
    slug: 'isolation-thermique-guide',
    title: 'Guide complet de l\'isolation thermique',
    excerpt: 'Tout savoir sur l\'isolation de votre maison : techniques, matériaux et économies à la clé.',
    category: 'Guides',
    date: '2026-01-02',
    readTime: '10 min',
    image: '🧱',
  },
  {
    slug: 'electricite-normes-securite',
    title: 'Électricité : les normes de sécurité à connaître',
    excerpt: 'NF C 15-100, mise aux normes, diagnostic... Tout ce qu\'il faut savoir sur l\'électricité de votre logement.',
    category: 'Sécurité',
    date: '2026-01-28',
    readTime: '7 min',
    image: '⚡',
  },
  {
    slug: 'peinture-interieure-conseils',
    title: 'Réussir sa peinture intérieure : nos conseils',
    excerpt: 'Préparation, choix des couleurs, techniques d\'application... Tous les secrets d\'une peinture réussie.',
    category: 'DIY',
    date: '2026-01-20',
    readTime: '5 min',
    image: '🎨',
  },
  {
    slug: 'chauffage-solution-economique',
    title: 'Quel chauffage choisir pour faire des économies ?',
    excerpt: 'Pompe à chaleur, poêle à granulés, chaudière... Comparatif des solutions de chauffage les plus économiques.',
    category: 'Énergie',
    date: '2026-01-18',
    readTime: '8 min',
    image: '🔥',
  },
  {
    slug: 'combien-coute-un-plombier-tarifs-devis',
    title: 'Combien coûte un plombier en 2026 ? Tarifs et devis',
    excerpt: 'Prix horaire, tarif d\'intervention, coût des réparations courantes... Tous les tarifs plomberie à connaître avant de demander un devis.',
    category: 'Guides',
    date: '2026-02-05',
    readTime: '7 min',
    image: '💰',
  },
  {
    slug: 'trouver-artisan-verifie-siren',
    title: 'Trouver un artisan vérifié : pourquoi le SIREN compte',
    excerpt: 'Numéro SIREN, assurance décennale, qualifications... Les vérifications indispensables avant de faire appel à un artisan.',
    category: 'Conseils',
    date: '2026-02-03',
    readTime: '5 min',
    image: '🔍',
  },
  {
    slug: 'renovation-maison-par-ou-commencer',
    title: 'Rénovation maison : par où commencer ?',
    excerpt: 'Ordre des travaux, budget prévisionnel, choix des artisans... Le guide étape par étape pour réussir la rénovation de votre maison.',
    category: 'Guides',
    date: '2026-02-01',
    readTime: '10 min',
    image: '🏗️',
  },
  {
    slug: 'artisan-pas-cher-attention-arnaques',
    title: 'Artisan pas cher : attention aux arnaques',
    excerpt: 'Devis anormalement bas, travaux bâclés, faux artisans... Comment repérer les arnaques et protéger votre projet de travaux.',
    category: 'Sécurité',
    date: '2026-01-30',
    readTime: '6 min',
    image: '🚨',
  },
  {
    slug: 'prix-plombier-2026-tarifs-horaires',
    title: 'Prix plombier 2026 : tarifs horaires et coût des interventions',
    excerpt: 'Tarif horaire moyen, coût d\'un dépannage, prix des installations... Tous les tarifs plomberie à connaître. Comparez les prix avant de demander un devis.',
    category: 'Tarifs',
    date: '2026-02-08',
    readTime: '8 min',
    image: '🔧',
  },
  {
    slug: 'aide-maprimerenov-2026-montants-conditions',
    title: 'Aide MaPrimeRénov\' 2026 : montants, conditions et démarches',
    excerpt: 'Montants actualisés, conditions d\'éligibilité, étapes de la demande... Le guide complet pour obtenir MaPrimeRénov\' en 2026. Ne passez pas à côté de cette aide.',
    category: 'Aides & Subventions',
    date: '2026-02-07',
    readTime: '10 min',
    image: '🏛️',
  },
  {
    slug: 'comment-verifier-artisan-avant-engager',
    title: 'Comment vérifier un artisan avant de l\'engager ?',
    excerpt: 'SIRET, assurance décennale, qualifications... Les vérifications indispensables pour éviter les mauvaises surprises. Protégez-vous avant de signer.',
    category: 'Conseils',
    date: '2026-02-06',
    readTime: '6 min',
    image: '✅',
  },
  {
    slug: 'travaux-renovation-energetique-par-ou-commencer',
    title: 'Travaux de rénovation énergétique : par où commencer ?',
    excerpt: 'Isolation, chauffage, ventilation... Découvrez l\'ordre optimal des travaux de rénovation énergétique. Un guide étape par étape pour maximiser vos économies.',
    category: 'Guides',
    date: '2026-02-04',
    readTime: '9 min',
    image: '🌱',
  },
  {
    slug: 'devis-travaux-comment-comparer-choisir',
    title: 'Devis travaux : comment comparer et choisir ?',
    excerpt: 'Mentions obligatoires, pièges à éviter, critères de comparaison... Apprenez à analyser un devis comme un pro. Ne signez plus les yeux fermés.',
    category: 'Conseils',
    date: '2026-02-02',
    readTime: '7 min',
    image: '📊',
  },
  {
    slug: '10-arnaques-courantes-batiment',
    title: 'Les 10 arnaques les plus courantes dans le bâtiment',
    excerpt: 'Faux artisans, devis gonflés, travaux fantômes... Découvrez les arnaques les plus fréquentes et comment vous en protéger efficacement.',
    category: 'Sécurité',
    date: '2026-01-29',
    readTime: '8 min',
    image: '⚠️',
  },
  {
    slug: 'prix-electricien-2026-tarifs-travaux',
    title: 'Prix électricien 2026 : tarifs et coût des travaux',
    excerpt: 'Mise aux normes, installation, dépannage... Tous les prix des travaux d\'électricité en 2026. Comparez les tarifs pour mieux négocier vos devis.',
    category: 'Tarifs',
    date: '2026-01-27',
    readTime: '8 min',
    image: '⚡',
  },
  {
    slug: 'prix-peintre-batiment-2026-guide-complet',
    title: 'Prix peintre en bâtiment 2026 : guide complet',
    excerpt: 'Prix au m², coût par pièce, tarifs spéciaux façade... Le guide complet des prix de peinture en 2026. Estimez votre budget avant de demander un devis.',
    category: 'Tarifs',
    date: '2026-01-25',
    readTime: '7 min',
    image: '🎨',
  },
  {
    slug: 'garantie-decennale-tout-savoir',
    title: 'Garantie décennale : tout ce qu\'il faut savoir',
    excerpt: 'Durée, couverture, recours... La garantie décennale expliquée simplement. Ce que tout propriétaire doit savoir avant et après des travaux.',
    category: 'Guides',
    date: '2026-01-23',
    readTime: '7 min',
    image: '🛡️',
  },
  {
    slug: 'comment-choisir-cuisine-equipee-guide',
    title: 'Comment choisir sa cuisine équipée : guide complet',
    excerpt: 'Matériaux, agencement, budget, erreurs à éviter... Tout pour réussir le choix de votre cuisine équipée. Un investissement qui se prépare bien.',
    category: 'Guides',
    date: '2026-01-21',
    readTime: '9 min',
    image: '🍳',
  },
  {
    slug: 'isolation-thermique-meilleures-solutions-2026',
    title: 'Isolation thermique : les meilleures solutions en 2026',
    excerpt: 'Combles, murs, sols... Comparatif des matériaux et techniques d\'isolation thermique. Réduisez votre facture énergétique jusqu\'à 30 %.',
    category: 'Énergie',
    date: '2026-01-19',
    readTime: '10 min',
    image: '🧱',
  },
  {
    slug: 'prix-couvreur-2026-cout-refection-toiture',
    title: 'Prix couvreur 2026 : coût réfection toiture',
    excerpt: 'Réfection complète, réparation de fuite, démoussage... Tous les tarifs couverture et toiture en 2026. Anticipez le budget de vos travaux.',
    category: 'Tarifs',
    date: '2026-01-17',
    readTime: '7 min',
    image: '🏠',
  },
  {
    slug: 'renovation-salle-de-bain-budget-etapes',
    title: 'Rénovation salle de bain : budget et étapes',
    excerpt: 'Coût moyen, planning des travaux, choix des matériaux... Le guide complet pour rénover votre salle de bain sans mauvaise surprise.',
    category: 'Guides',
    date: '2026-01-14',
    readTime: '8 min',
    image: '🚿',
  },
  {
    slug: 'chauffage-pompe-chaleur-vs-chaudiere-gaz-2026',
    title: 'Chauffage : pompe à chaleur vs chaudière gaz en 2026',
    excerpt: 'Coût d\'installation, consommation, aides disponibles... Comparatif complet pour choisir entre pompe à chaleur et chaudière gaz en 2026.',
    category: 'Énergie',
    date: '2026-01-12',
    readTime: '9 min',
    image: '🔥',
  },
  {
    slug: 'droits-obligations-travaux-chez-soi',
    title: 'Droits et obligations lors de travaux chez soi',
    excerpt: 'Autorisations, horaires, nuisances, responsabilités... Tout savoir sur le cadre légal des travaux à domicile. Évitez les conflits avec vos voisins.',
    category: 'Guides',
    date: '2026-01-09',
    readTime: '8 min',
    image: '⚖️',
  },
]

const categories = [
  'Tous',
  'Conseils',
  'Guides',
  'Tarifs',
  'Aides & Subventions',
  'Inspiration',
  'DIY',
  'Sécurité',
  'Énergie',
]

export default function BlogPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')

  const filteredArticles = selectedCategory === 'Tous'
    ? articles
    : articles.filter(a => a.category === selectedCategory)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }

      setIsSubscribed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(59,130,246,0.06) 0%, transparent 50%)',
          }} />
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Blog' }]}
            className="mb-6 text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
          />
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-extrabold mb-4 tracking-[-0.025em]">
              Blog & Actualit&eacute;s
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Conseils, guides de prix et tendances pour vos projets de travaux. Par les experts de ServicesArtisans.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === selectedCategory
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-6xl">
                  {article.image}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lire
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load more */}
          <div className="text-center mt-12">
            <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Voir plus d'articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Restez informé
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez nos derniers articles et conseils directement dans votre boîte mail
          </p>
          {isSubscribed ? (
            <div className="max-w-md mx-auto bg-white/20 rounded-lg p-6 flex items-center justify-center gap-3 text-white">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Merci ! Vous êtes inscrit à notre newsletter.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  required
                  className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-4 flex items-center justify-center gap-2 text-red-200">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
