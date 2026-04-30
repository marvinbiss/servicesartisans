import { Metadata } from 'next'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import DiagnosticClient from './DiagnosticClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Diagnostic artisan gratuit en 30 sec',
  description:
    'Répondez à 3 questions pour savoir quel artisan vous faut-il. Plombier, électricien, serrurier... Notre outil vous guide vers le bon professionnel.',
  alternates: getAlternates('/outils/diagnostic'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    locale: 'fr_FR',
    title: 'Quel artisan choisir ? Diagnostic gratuit en 30 secondes',
    description:
      'Répondez à 3 questions pour savoir quel artisan vous faut-il. Plombier, électricien, serrurier... Notre outil vous guide vers le bon professionnel.',
    url: `${SITE_URL}/outils/diagnostic`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Diagnostic artisan gratuit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quel artisan choisir ? Diagnostic gratuit en 30 secondes',
    description:
      'Répondez à 3 questions pour trouver le bon artisan. Plombier, électricien, serrurier et plus.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const diagnosticFAQs = [
  {
    question: 'Comment savoir quel artisan appeler pour mon problème ?',
    answer:
      "Notre outil de diagnostic vous pose 3 questions simples sur votre problème (catégorie, détail, urgence) et vous recommande le type d'artisan le plus adapté, avec une estimation de prix et des conseils pratiques.",
  },
  {
    question: 'Le diagnostic est-il vraiment gratuit ?',
    answer:
      'Oui, notre outil de diagnostic est entièrement gratuit et sans engagement. Il vous guide vers le bon type de professionnel en moins de 30 secondes.',
  },
  {
    question: 'Quelle est la différence entre un plombier et un chauffagiste ?',
    answer:
      "Un plombier intervient sur les canalisations d'eau, les robinets, les WC et les chauffe-eau. Un chauffagiste est spécialisé dans les systèmes de chauffage : chaudières, radiateurs, pompes à chaleur et planchers chauffants. Pour un chauffe-eau, les deux peuvent intervenir.",
  },
  {
    question: 'Dois-je appeler un électricien ou un domoticien ?',
    answer:
      'Un électricien gère les installations électriques classiques (prises, tableau, éclairage). Un domoticien est spécialisé dans la maison connectée (automatisation des volets, éclairage intelligent, chauffage connecté). Pour une panne électrique, appelez un électricien.',
  },
  {
    question: 'Comment trouver un artisan en urgence ?',
    answer:
      "Lors du diagnostic, indiquez que votre problème est urgent. Nous vous redirigerons vers notre page urgence dédiée avec des artisans disponibles rapidement. En cas de danger immédiat (fuite de gaz, incendie), appelez d'abord les secours.",
  },
]

export default function DiagnosticPage() {
  const breadcrumbItems = [{ label: 'Outils', href: '/outils' }, { label: 'Diagnostic' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Outils', url: '/outils' },
    { name: 'Diagnostic', url: '/outils/diagnostic' },
  ])

  const faqSchema = getFAQSchema(
    diagnosticFAQs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }))
  )

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

      <div className="min-h-screen bg-gradient-to-b from-sand-50 to-white">
        {/* Header section */}
        <div className="bg-gradient-to-r from-primary-500 to-indigo-700 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            <Breadcrumb
              items={breadcrumbItems}
              className="mb-4 text-primary-100 [&_a]:text-primary-100 [&_a:hover]:text-white [&_svg]:text-primary-200 [&>ol>li:last-child_span]:text-white"
            />
            <h1
              data-speakable="true"
              className="text-3xl sm:text-4xl font-extrabold font-heading mb-3"
            >
              Quel artisan vous faut-il ?
            </h1>
            <p className="text-primary-100 text-lg max-w-2xl">
              Répondez à 3 questions simples et découvrez le professionnel idéal pour votre
              problème. Gratuit et en 30 secondes.
            </p>
          </div>
        </div>

        {/* Quiz section */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <DiagnosticClient />
        </div>

        {/* FAQ section */}
        <div className="bg-white border-t border-sand-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <h2 className="text-2xl font-bold text-charcoal-900 font-heading mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              {diagnosticFAQs.map((faq, index) => (
                <div key={index} className="border-b border-sand-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-charcoal-900 mb-2">{faq.question}</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
