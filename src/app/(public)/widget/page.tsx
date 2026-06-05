import { Metadata } from 'next'
import Link from 'next/link'
import { Code, CheckCircle, ArrowRight, ChevronDown, Globe, TrendingUp, Shield } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { WidgetCopyButton } from './WidgetCopyButton'

const canonicalUrl = `${SITE_URL}/widget`

export const metadata: Metadata = {
  title: `Widget ${SITE_NAME} — Affichez votre profil`,
  description: `Intégrez le widget ${SITE_NAME} sur votre site web pour renforcer votre crédibilité en ligne. Badge artisan gratuit, installation en 2 minutes.`,
  robots: { index: false, follow: true },
  alternates: getAlternates('/widget'),
  openGraph: {
    locale: 'fr_FR',
    title: `Widget ${SITE_NAME} — Affichez votre profil`,
    description: `Intégrez le widget ${SITE_NAME} sur votre site web pour renforcer votre crédibilité en ligne.`,
    url: canonicalUrl,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Widget ${SITE_NAME} — Affichez votre profil`,
    description: `Intégrez le widget ${SITE_NAME} sur votre site web pour renforcer votre crédibilité en ligne.`,
  },
}

const EMBED_CODE = `<div id="sa-widget" data-service="plombier" data-ville="paris" data-name="Mon Entreprise"></div>
<script src="${SITE_URL}/api/widget" async></script>`

const faqItems = [
  {
    question: 'Le widget est-il gratuit ?',
    answer: `Oui, le widget ${SITE_NAME} est entièrement gratuit. Il n'y a aucun frais caché ni abonnement requis. Vous pouvez l'intégrer librement sur votre site web professionnel.`,
  },
  {
    question: 'Comment personnaliser le widget avec mes informations ?',
    answer:
      "Modifiez les attributs data-service (votre métier), data-ville (votre ville) et data-name (le nom de votre entreprise) dans le code HTML. Le widget s'adaptera automatiquement à vos informations.",
  },
  {
    question: 'Le widget ralentit-il mon site web ?',
    answer:
      "Non, le widget est conçu pour être ultra-léger (moins de 5 Ko). Il se charge de manière asynchrone et n'affecte pas les performances de votre site. Il n'utilise aucun cookie ni tracker.",
  },
  {
    question: "Puis-je installer le widget sur n'importe quel site ?",
    answer:
      'Oui, le widget est compatible avec tous les sites web : WordPress, Wix, Squarespace, Shopify, sites HTML classiques, etc. Il suffit de coller le code dans la zone HTML de votre choix.',
  },
  {
    question: 'Le widget est-il responsive (adapté mobile) ?',
    answer:
      "Oui, le widget s'adapte automatiquement à la largeur de son conteneur. Il s'affiche parfaitement sur mobile, tablette et ordinateur.",
  },
]

export default function WidgetPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Partenaires', url: '/partenaires' },
    { name: 'Widget', url: '/widget' },
  ])

  const faqSchema = getFAQSchema(faqItems.map((f) => ({ question: f.question, answer: f.answer })))

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-sand-50 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36">
          <Breadcrumb
            items={[{ label: 'Partenaires', href: '/partenaires' }, { label: 'Widget' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
            >
              Affichez votre profil artisan sur votre site
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto mb-4">
              Renforcez votre crédibilité en ligne avec le widget {SITE_NAME}. Gratuit, léger et
              facile à installer.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Globe className="w-4 h-4 text-secondary-400" />
                <span>100 % gratuit</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <TrendingUp className="w-4 h-4 text-secondary-400" />
                <span>Backlink SEO inclus</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10 text-sm">
                <Shield className="w-4 h-4 text-secondary-400" />
                <span>Sans cookie ni tracker</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widget Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Aperçu du widget
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Voici à quoi ressemble le widget une fois intégré sur votre site.
          </p>
          <div className="flex justify-center">
            <div className="bg-sand-50 rounded-2xl border border-sand-200 p-8">
              {/* Static preview of the widget */}
              <div
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                  maxWidth: 320,
                  border: '1px solid #e2e0db',
                  borderRadius: 12,
                  padding: 16,
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 4L4 18h5v14h8v-8h6v8h8V18h5L20 4z" fill="#E86B4B" />
                    <path d="M28 12l-4-4v4h4z" fill="#C24B2A" />
                    <circle cx="30" cy="30" r="8" fill="#3D8B68" />
                    <path
                      d="M27 30l2 2 4-4"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#2a2520' }}>
                    {SITE_NAME}
                  </span>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#1a1612', marginBottom: 4 }}>
                  Mon Entreprise
                </div>
                <div style={{ fontSize: 13, color: '#7a7267', marginBottom: 8 }}>
                  Plombier à Paris
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#E86B4B',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Voir le profil
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <div style={{ marginTop: 10, fontSize: 10, color: '#a09a92' }}>
                  Artisan RGE certifié sur <span style={{ color: '#E86B4B' }}>{SITE_NAME}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Installation en 3 étapes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Choisir votre métier',
                description:
                  "Modifiez les attributs data-service et data-ville dans le code pour correspondre à votre activité et votre zone d'intervention.",
              },
              {
                step: '2',
                title: 'Copier le code',
                description:
                  'Copiez le code HTML ci-dessous en un clic. Il contient tout le nécessaire pour afficher le widget.',
              },
              {
                step: '3',
                title: 'Coller sur votre site',
                description:
                  "Collez le code dans votre site web (WordPress, Wix, HTML...) à l'endroit où vous souhaitez afficher le badge.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-xl border border-sand-200 p-6 text-center shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading font-semibold text-charcoal-900 mb-2">{item.title}</h3>
                <p className="text-charcoal-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Embed Code */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-2 text-center">
            Code à intégrer
          </h2>
          <p className="text-charcoal-500 text-sm text-center mb-8">
            Copiez ce code et collez-le dans le HTML de votre site web.
          </p>
          <div className="bg-charcoal-900 rounded-xl p-6 relative">
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-4 h-4 text-charcoal-400" />
              <span className="text-charcoal-400 text-sm font-mono">HTML</span>
            </div>
            <pre className="text-accent-400 text-sm font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {EMBED_CODE}
            </pre>
            <WidgetCopyButton code={EMBED_CODE} />
          </div>
          <div className="mt-6 bg-primary-50 rounded-xl border border-primary-200 p-4">
            <h3 className="font-heading font-semibold text-primary-900 text-sm mb-2">
              Personnalisation
            </h3>
            <ul className="text-primary-800 text-sm space-y-1">
              <li>
                <code className="bg-primary-100 px-1 rounded text-xs">data-service</code> : votre
                métier (plombier, électricien, serrurier...)
              </li>
              <li>
                <code className="bg-primary-100 px-1 rounded text-xs">data-ville</code> : votre
                ville (paris, lyon, marseille...)
              </li>
              <li>
                <code className="bg-primary-100 px-1 rounded text-xs">data-name</code> : le nom de
                votre entreprise
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-sand-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Pourquoi intégrer le widget ?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: 'Renforcez votre crédibilité',
                desc: "Montrez à vos visiteurs que vous êtes un artisan RGE certifié sur l'annuaire ServicesArtisans, basé sur les données SIREN officielles et la base ADEME france-renov.gouv.fr.",
              },
              {
                title: 'Améliorez votre SEO',
                desc: 'Le widget crée un lien retour (backlink) depuis votre site vers votre profil, ce qui améliore votre visibilité sur Google.',
              },
              {
                title: 'Générez des contacts',
                desc: 'Les visiteurs de votre site peuvent accéder directement à votre profil complet et vous contacter facilement.',
              },
              {
                title: 'Installation ultra-simple',
                desc: "Aucune compétence technique requise. Copiez-collez le code, c'est tout. Compatible avec tous les sites web.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 bg-white rounded-xl border border-sand-200 p-5 shadow-soft hover:shadow-card-hover transition-shadow"
              >
                <div className="w-8 h-8 bg-accent-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-charcoal-900 mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-charcoal-600 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-charcoal-900 mb-8 text-center">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <details key={i} className="bg-sand-50 rounded-xl border border-sand-200 group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <h3 className="text-base font-semibold text-charcoal-900 pr-4">
                    {item.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-charcoal-400 flex-shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-charcoal-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white mb-4">
            Vous n'êtes pas encore référencé ?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Inscrivez-vous gratuitement sur {SITE_NAME} et obtenez votre widget personnalisé.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/inscription-artisan"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors text-lg shadow-cta"
            >
              Créer mon profil artisan
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-600 transition-colors text-lg border border-primary-300"
            >
              Découvrir le programme partenaires
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
