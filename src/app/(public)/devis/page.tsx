import { Metadata } from 'next'
import { Shield, Clock, Users, Search, FileText, CheckCircle, ChevronDown, Star, ArrowUp } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import DevisForm from '@/components/DevisForm'

export const metadata: Metadata = {
  title: 'Demander un devis gratuit — ServicesArtisans',
  description:
    "Décrivez votre projet et recevez jusqu'à 3 devis gratuits d'artisans référencés. 100 % gratuit, sans engagement.",
  alternates: {
    canonical: 'https://servicesartisans.fr/devis',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Demander un devis gratuit — ServicesArtisans',
    description: "Décrivez votre projet et recevez jusqu'à 3 devis gratuits d'artisans référencés. 100 % gratuit, sans engagement.",
    url: 'https://servicesartisans.fr/devis',
    type: 'website',
  },
}

const trustBadges = [
  { icon: Shield, label: 'Gratuit', sublabel: 'Aucun frais caché' },
  { icon: Clock, label: 'Sans engagement', sublabel: 'Réponse sous 24 h' },
  { icon: Users, label: 'Artisans référencés', sublabel: 'SIREN contrôlé' },
]

const howSteps = [
  {
    number: '1',
    icon: Search,
    title: 'Décrivez votre projet',
    description:
      'Sélectionnez le type de service, indiquez votre ville et décrivez votre besoin en quelques lignes. Formulaire rapide en 2 minutes.',
  },
  {
    number: '2',
    icon: FileText,
    title: 'Recevez vos devis',
    description:
      'Votre demande est transmise aux artisans qualifiés proches de chez vous. Vous recevez jusqu’à 3 devis détaillés sous 24 à 48 h.',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez librement',
    description:
      'Comparez les tarifs, consultez les profils et choisissez l’artisan qui vous convient. Aucune obligation d’accepter.',
  },
]

const faqItems = [
  {
    question: 'Le service est-il vraiment gratuit ?',
    answer:
      'Oui, la demande de devis est 100 % gratuite et sans aucun engagement. Vous ne payez rien pour recevoir les propositions des artisans. Ce sont les professionnels qui financent le service.',
  },
  {
    question: 'Combien de devis vais-je recevoir ?',
    answer:
      'Vous pouvez recevoir jusqu’à 3 devis d’artisans différents, selon la disponibilité dans votre zone géographique. Chaque devis est personnalisé en fonction de votre projet.',
  },
  {
    question: 'En combien de temps suis-je contacté ?',
    answer:
      'Les artisans disponibles vous contactent généralement sous 24 à 48 h après l’envoi de votre demande. En cas d’urgence, précisez-le dans le formulaire pour accélérer le traitement.',
  },
  {
    question: 'Comment les artisans sont-ils référencés ?',
    answer:
      'Tous les artisans référencés sur ServicesArtisans sont immatriculés au registre SIREN. Nous contrôlons leur numéro d’entreprise et leur activité déclarée auprès des données officielles de l’INSEE.',
  },
  {
    question: 'Suis-je obligé d’accepter un devis ?',
    answer:
      'Non, vous êtes entièrement libre. Comparez les devis reçus à votre rythme et choisissez celui qui correspond le mieux à vos attentes et à votre budget. Aucune obligation d’accepter.',
  },
  {
    question: 'Quelles données personnelles sont partagées ?',
    answer:
      'Seuls votre nom, numéro de téléphone et la description de votre projet sont transmis aux artisans sélectionnés. Votre adresse e-mail reste confidentielle et vos données ne sont jamais revendues à des tiers.',
  },
]

export default function DevisPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Demander un devis', url: '/devis' },
          ]),
        ]}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(37,99,235,0.1) 0%, transparent 50%)',
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
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-28 md:pt-14 md:pb-36">
          {/* Breadcrumb */}
          <div className="mb-10">
            <Breadcrumb
              items={[{ label: 'Demander un devis' }]}
              className="text-slate-400 [&_a]:text-slate-400 [&_a:hover]:text-white [&_svg]:text-slate-600"
            />
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
              Recevez <span className="whitespace-nowrap">jusqu&apos;à</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 whitespace-nowrap">
                3&nbsp;devis gratuits
              </span>{' '}
              <span className="whitespace-nowrap">d&apos;artisans</span> référencés
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Remplissez le formulaire ci-dessous et comparez les offres de professionnels
              qualifiés près de chez vous. Service 100&nbsp;% gratuit, sans engagement.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {trustBadges.map((badge) => {
                const Icon = badge.icon
                return (
                  <div key={badge.label} className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white/[0.08] backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-white">{badge.label}</div>
                      <div className="text-xs text-slate-500">{badge.sublabel}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORM ─────────────────────────────────────────────── */}
      <section id="formulaire" className="relative -mt-16 z-10 px-4 pb-20">
        <DevisForm />
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Simple et rapide</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Comment ça marche&nbsp;?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Trois étapes suffisent pour recevoir des devis personnalisés d&apos;artisans de confiance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%]">
              <div className="h-px border-t-2 border-dashed border-gray-200" />
            </div>

            {howSteps.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.number} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-slate-700">{item.number}</span>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Questions fréquentes
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Tout ce que vous devez savoir avant de demander votre devis gratuit.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-gray-50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-slate-900 pr-4">{item.question}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 text-slate-500 leading-relaxed text-sm">
                  {item.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Star className="w-8 h-8 text-amber-400 mx-auto mb-4" />
          <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-3">
            Prêt à démarrer votre projet&nbsp;?
          </h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Comparez gratuitement les devis d&apos;artisans qualifiés et trouvez le bon professionnel pour vos travaux.
          </p>
          <a
            href="#formulaire"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <ArrowUp className="w-5 h-5" />
            Remplir le formulaire
          </a>
        </div>
      </section>
    </div>
  )
}
