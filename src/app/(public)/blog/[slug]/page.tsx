import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin, Tag, ChevronRight } from 'lucide-react'
import { SITE_URL } from '@/lib/seo/config'

const articles: Record<string, {
  title: string
  excerpt: string
  content: string[]
  image: string
  author: string
  date: string
  readTime: string
  category: string
  tags: string[]
}> = {
  'comment-choisir-plombier': {
    title: 'Comment choisir le bon plombier ?',
    excerpt: 'Guide complet pour trouver un plombier fiable et compétent pour vos travaux.',
    content: [
      "Choisir un plombier peut sembler simple, mais c'est une décision qui mérite réflexion. Un mauvais choix peut entraîner des réparations coûteuses, des fuites persistantes ou même des dégâts des eaux. Voici notre guide complet pour vous aider à faire le bon choix.",
      "## 1. Vérifiez les qualifications",
      "Un plombier professionnel doit posséder certaines certifications et qualifications. Recherchez les labels RGE (Reconnu Garant de l'Environnement) si vous envisagez des travaux liés à l'énergie, comme l'installation d'un chauffe-eau thermodynamique.",
      "## 2. Demandez plusieurs devis",
      "Ne vous contentez jamais d'un seul devis. Comparez au moins trois propositions pour avoir une idée réaliste des prix du marché. Méfiez-vous des devis trop bas qui peuvent cacher des surprises.",
      "## 3. Consultez les avis clients",
      "Les avis en ligne sont précieux. Sur ServicesArtisans, tous nos artisans sont évalués par leurs clients après chaque intervention. Privilégiez les professionnels avec une note supérieure à 4/5.",
      "## 4. Vérifiez l'assurance",
      "Un plombier professionnel doit obligatoirement disposer d'une assurance responsabilité civile professionnelle et d'une garantie décennale pour les travaux importants.",
      "## 5. Évaluez la réactivité",
      "La communication est essentielle. Un bon plombier répond rapidement à vos demandes et vous tient informé de l'avancement des travaux.",
    ],
    image: '/images/blog/plombier.jpg',
    author: 'Marie Dupont',
    date: '2024-01-15',
    readTime: '5 min',
    category: 'Conseils',
    tags: ['Plomberie', 'Conseils', 'Artisans']
  },
  'renovation-energetique-2024': {
    title: 'Rénovation énergétique : les aides 2024',
    excerpt: 'Découvrez toutes les aides disponibles pour financer vos travaux de rénovation énergétique.',
    content: [
      "La rénovation énergétique est plus que jamais au cœur des préoccupations des Français. En 2024, de nombreuses aides sont disponibles pour financer vos travaux. Voici un tour d'horizon complet.",
      "## MaPrimeRénov'",
      "MaPrimeRénov' est la principale aide de l'État pour la rénovation énergétique. Elle est accessible à tous les propriétaires, qu'ils soient occupants ou bailleurs. Le montant dépend de vos revenus et du type de travaux réalisés.",
      "## Les CEE (Certificats d'Économies d'Énergie)",
      "Les fournisseurs d'énergie proposent des primes pour vous aider à financer vos travaux. Ces aides sont cumulables avec MaPrimeRénov'.",
      "## L'éco-prêt à taux zéro",
      "L'éco-PTZ vous permet d'emprunter jusqu'à 50 000€ sans intérêts pour financer vos travaux de rénovation énergétique. Il est accessible sans condition de revenus.",
      "## TVA réduite à 5,5%",
      "Les travaux d'amélioration énergétique bénéficient d'une TVA réduite à 5,5% au lieu de 20%.",
      "## Les aides locales",
      "De nombreuses collectivités (régions, départements, communes) proposent des aides complémentaires. Renseignez-vous auprès de votre mairie ou de l'ADIL de votre département.",
    ],
    image: '/images/blog/renovation.jpg',
    author: 'Pierre Martin',
    date: '2024-01-10',
    readTime: '7 min',
    category: 'Actualités',
    tags: ['Rénovation', 'Aides', 'Énergie']
  },
  'urgence-plomberie-que-faire': {
    title: 'Urgence plomberie : que faire en attendant le plombier ?',
    excerpt: 'Les gestes essentiels à connaître en cas de fuite ou de canalisation bouchée.',
    content: [
      "Une fuite d'eau ou une canalisation bouchée peut vite tourner au cauchemar. Voici les gestes essentiels à effectuer en attendant l'arrivée du plombier.",
      "## En cas de fuite d'eau",
      "1. **Coupez l'arrivée d'eau** : Le robinet d'arrêt général se trouve généralement près du compteur d'eau ou sous l'évier de la cuisine.",
      "2. **Coupez l'électricité** si l'eau risque d'atteindre des prises ou appareils électriques.",
      "3. **Épongez l'eau** pour limiter les dégâts sur les sols et murs.",
      "4. **Placez une bassine** sous la fuite si elle est localisée.",
      "## En cas de canalisation bouchée",
      "1. **N'utilisez pas de produits chimiques** qui peuvent endommager les canalisations et être dangereux.",
      "2. **Essayez la ventouse** : un outil simple mais souvent efficace.",
      "3. **Versez de l'eau bouillante** si le bouchon semble être dû à des graisses.",
      "## Quand appeler un plombier en urgence ?",
      "Certaines situations nécessitent une intervention immédiate : fuite importante, dégât des eaux, absence totale d'eau chaude en hiver, ou canalisation complètement bouchée.",
    ],
    image: '/images/blog/urgence.jpg',
    author: 'Jean Leroy',
    date: '2024-01-05',
    readTime: '4 min',
    category: 'Conseils',
    tags: ['Urgence', 'Plomberie', 'DIY']
  },
  'tendances-decoration-2024': {
    title: 'Les tendances décoration 2024',
    excerpt: 'Couleurs, matériaux, styles : découvrez les tendances qui vont marquer l\'année.',
    content: [
      "L'année 2024 s'annonce riche en nouveautés côté décoration. Voici les tendances qui vont marquer cette année.",
      "## Le retour des couleurs chaudes",
      "Après plusieurs années de tons neutres, les couleurs chaudes font leur grand retour : terracotta, ocre, rouille... Ces teintes apportent chaleur et caractère à vos intérieurs.",
      "## Les matériaux naturels",
      "Bois brut, pierre, lin, rotin... Les matériaux naturels restent incontournables. Ils apportent authenticité et créent une ambiance apaisante.",
      "## Le style japandi",
      "Ce mélange de design japonais et scandinave continue de séduire. Lignes épurées, fonctionnalité et touches naturelles caractérisent ce style zen et moderne.",
      "## L'artisanat local",
      "On privilégie les pièces uniques réalisées par des artisans locaux. Céramiques, textiles tissés main, mobilier sur-mesure... L'authenticité est au cœur des tendances.",
      "## Le maximalisme assumé",
      "À l'opposé du minimalisme, le maximalisme fait son retour. Accumulations, mélanges de motifs, couleurs vives... Pour ceux qui osent !",
    ],
    image: '/images/blog/decoration.jpg',
    author: 'Sophie Bernard',
    date: '2024-01-01',
    readTime: '6 min',
    category: 'Inspiration',
    tags: ['Décoration', 'Tendances', 'Design']
  }
}

const relatedArticles = [
  { slug: 'comment-choisir-plombier', title: 'Comment choisir le bon plombier ?', category: 'Conseils' },
  { slug: 'renovation-energetique-2024', title: 'Rénovation énergétique : les aides 2024', category: 'Actualités' },
  { slug: 'urgence-plomberie-que-faire', title: 'Urgence plomberie : que faire ?', category: 'Conseils' },
]

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }))
}

export const dynamicParams = false

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = articles[params.slug]
  if (!article) return { title: 'Article non trouvé' }

  return {
    title: `${article.title} | Blog ServicesArtisans`,
    description: article.excerpt,
    alternates: {
      canonical: `${SITE_URL}/blog/${params.slug}`,
    },
  }
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category */}
        <div className="mb-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-gray-500 mb-8">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {article.author}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(article.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {article.readTime} de lecture
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl h-80 mb-8 flex items-center justify-center">
          <span className="text-6xl">📰</span>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {article.content.map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                  {paragraph.replace('## ', '')}
                </h2>
              )
            }
            return (
              <p key={index} className="text-gray-700 mb-4 leading-relaxed">
                {paragraph}
              </p>
            )
          })}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-8 pt-8 border-t">
          <Tag className="w-5 h-5 text-gray-400" />
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share */}
        <div className="flex items-center gap-4 mt-8 pt-8 border-t">
          <span className="text-gray-600 font-medium">Partager :</span>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors">
              <Linkedin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Author Box */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{article.author}</h3>
              <p className="text-gray-600 text-sm">
                Rédacteur chez ServicesArtisans, passionné par le monde de l'artisanat et de la rénovation.
              </p>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Articles similaires
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedArticles
              .filter(a => a.slug !== params.slug)
              .slice(0, 3)
              .map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <span className="text-xs text-blue-600 font-medium">
                    {related.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mt-2 line-clamp-2">
                    {related.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-blue-600 text-sm mt-3">
                    Lire <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Besoin d'un artisan ?
          </h2>
          <p className="text-blue-100 mb-6">
            Trouvez le professionnel qu'il vous faut en quelques clics
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Demander un devis gratuit
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
