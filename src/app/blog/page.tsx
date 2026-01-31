import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Conseils travaux et rénovation | ServicesArtisans',
  description: 'Retrouvez tous nos conseils pour vos travaux : guides pratiques, astuces, tendances déco et informations sur les aides financières.',
}

const articles = [
  {
    slug: 'comment-choisir-son-plombier',
    title: 'Comment choisir son plombier : le guide complet',
    excerpt: 'Découvrez tous nos conseils pour trouver un plombier de confiance et éviter les arnaques.',
    category: 'Conseils',
    date: '2024-01-15',
    readTime: '5 min',
    image: '🔧',
  },
  {
    slug: 'renovation-energetique-aides-2024',
    title: 'Rénovation énergétique : toutes les aides en 2024',
    excerpt: 'MaPrimeRénov\', CEE, éco-PTZ... Tour d\'horizon des aides pour financer vos travaux de rénovation.',
    category: 'Aides & Subventions',
    date: '2024-01-10',
    readTime: '8 min',
    image: '🏠',
  },
  {
    slug: 'tendances-salle-de-bain-2024',
    title: 'Les tendances salle de bain en 2024',
    excerpt: 'Couleurs, matériaux, équipements... Découvrez les tendances qui vont marquer la salle de bain cette année.',
    category: 'Inspiration',
    date: '2024-01-08',
    readTime: '4 min',
    image: '🛁',
  },
  {
    slug: 'devis-travaux-comprendre',
    title: 'Comment lire et comprendre un devis de travaux',
    excerpt: 'Les éléments essentiels à vérifier avant de signer un devis pour éviter les mauvaises surprises.',
    category: 'Conseils',
    date: '2024-01-05',
    readTime: '6 min',
    image: '📋',
  },
  {
    slug: 'isolation-thermique-guide',
    title: 'Guide complet de l\'isolation thermique',
    excerpt: 'Tout savoir sur l\'isolation de votre maison : techniques, matériaux et économies à la clé.',
    category: 'Guides',
    date: '2024-01-02',
    readTime: '10 min',
    image: '🧱',
  },
  {
    slug: 'electricite-normes-securite',
    title: 'Électricité : les normes de sécurité à connaître',
    excerpt: 'NF C 15-100, mise aux normes, diagnostic... Tout ce qu\'il faut savoir sur l\'électricité de votre logement.',
    category: 'Sécurité',
    date: '2023-12-28',
    readTime: '7 min',
    image: '⚡',
  },
  {
    slug: 'peinture-interieure-conseils',
    title: 'Réussir sa peinture intérieure : nos conseils',
    excerpt: 'Préparation, choix des couleurs, techniques d\'application... Tous les secrets d\'une peinture réussie.',
    category: 'DIY',
    date: '2023-12-20',
    readTime: '5 min',
    image: '🎨',
  },
  {
    slug: 'chauffage-solution-economique',
    title: 'Quel chauffage choisir pour faire des économies ?',
    excerpt: 'Pompe à chaleur, poêle à granulés, chaudière... Comparatif des solutions de chauffage les plus économiques.',
    category: 'Énergie',
    date: '2023-12-15',
    readTime: '8 min',
    image: '🔥',
  },
]

const categories = [
  'Tous',
  'Conseils',
  'Guides',
  'Aides & Subventions',
  'Inspiration',
  'DIY',
  'Sécurité',
  'Énergie',
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog & Actualités
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Conseils, guides pratiques et tendances pour tous vos projets de travaux
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  cat === 'Tous'
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
            {articles.map((article) => (
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
          <h2 className="text-3xl font-bold text-white mb-4">
            Restez informé
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Recevez nos derniers articles et conseils directement dans votre boîte mail
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Votre email"
              className="flex-1 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-300"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
