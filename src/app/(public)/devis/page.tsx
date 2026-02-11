import { Metadata } from 'next'
import { Shield, Clock, Users, Search, FileText, CheckCircle, ChevronDown, Star, ArrowUp } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import DevisForm from '@/components/DevisForm'

export const metadata: Metadata = {
  title: 'Demander un devis gratuit \u2014 ServicesArtisans',
  description:
    'D\u00e9crivez votre projet et recevez jusqu\u2019\u00e0 3 devis gratuits d\u2019artisans v\u00e9rifi\u00e9s par SIREN. 100\u00a0% gratuit, sans engagement.',
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
}

const trustBadges = [
  { icon: Shield, label: 'Gratuit', sublabel: 'Aucun frais cach\u00e9' },
  { icon: Clock, label: 'Sans engagement', sublabel: 'R\u00e9ponse sous 24\u00a0h' },
  { icon: Users, label: 'Artisans v\u00e9rifi\u00e9s', sublabel: 'SIREN contr\u00f4l\u00e9' },
]

const howSteps = [
  {
    number: '1',
    icon: Search,
    title: 'D\u00e9crivez votre projet',
    description:
      'S\u00e9lectionnez le type de service, indiquez votre ville et d\u00e9crivez votre besoin en quelques lignes. Formulaire rapide en 2\u00a0minutes.',
  },
  {
    number: '2',
    icon: FileText,
    title: 'Recevez vos devis',
    description:
      'Votre demande est transmise aux artisans qualifi\u00e9s proches de chez vous. Vous recevez jusqu\u2019\u00e0 3 devis d\u00e9taill\u00e9s sous 24 \u00e0 48\u00a0h.',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez librement',
    description:
      'Comparez les tarifs, consultez les profils et choisissez l\u2019artisan qui vous convient. Aucune obligation d\u2019accepter.',
  },
]

const faqItems = [
  {
    question: 'Le service est-il vraiment gratuit\u00a0?',
    answer:
      'Oui, la demande de devis est 100\u00a0% gratuite et sans aucun engagement. Vous ne payez rien pour recevoir les propositions des artisans. Ce sont les professionnels qui financent le service.',
  },
  {
    question: 'Combien de devis vais-je recevoir\u00a0?',
    answer:
      'Vous pouvez recevoir jusqu\u2019\u00e0 3 devis d\u2019artisans diff\u00e9rents, selon la disponibilit\u00e9 dans votre zone g\u00e9ographique. Chaque devis est personnalis\u00e9 en fonction de votre projet.',
  },
  {
    question: 'En combien de temps suis-je contact\u00e9\u00a0?',
    answer:
      'Les artisans disponibles vous contactent g\u00e9n\u00e9ralement sous 24 \u00e0 48\u00a0h apr\u00e8s l\u2019envoi de votre demande. En cas d\u2019urgence, pr\u00e9cisez-le dans le formulaire pour acc\u00e9l\u00e9rer le traitement.',
  },
  {
    question: 'Comment les artisans sont-ils v\u00e9rifi\u00e9s\u00a0?',
    answer:
      'Tous les artisans r\u00e9f\u00e9renc\u00e9s sur ServicesArtisans sont immatricul\u00e9s au registre SIREN. Nous v\u00e9rifions leur num\u00e9ro d\u2019entreprise et leur activit\u00e9 d\u00e9clar\u00e9e aupr\u00e8s des donn\u00e9es officielles de l\u2019INSEE.',
  },
  {
    question: 'Suis-je oblig\u00e9 d\u2019accepter un devis\u00a0?',
    answer:
      'Non, vous \u00eates enti\u00e8rement libre. Comparez les devis re\u00e7us \u00e0 votre rythme et choisissez celui qui correspond le mieux \u00e0 vos attentes et \u00e0 votre budget. Aucune obligation d\u2019accepter.',
  },
  {
    question: 'Quelles donn\u00e9es personnelles sont partag\u00e9es\u00a0?',
    answer:
      'Seuls votre nom, num\u00e9ro de t\u00e9l\u00e9phone et la description de votre projet sont transmis aux artisans s\u00e9lectionn\u00e9s. Votre adresse e-mail reste confidentielle et vos donn\u00e9es ne sont jamais revendues \u00e0 des tiers.',
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
              Recevez <span className="whitespace-nowrap">jusqu&apos;\u00e0</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 whitespace-nowrap">
                3&nbsp;devis gratuits
              </span>{' '}
              <span className="whitespace-nowrap">d&apos;artisans</span> v\u00e9rifi\u00e9s
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Remplissez le formulaire ci-dessous et comparez les offres de professionnels
              qualifi\u00e9s pr\u00e8s de chez vous. Service 100&nbsp;% gratuit, sans engagement.
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
              Comment \u00e7a marche&nbsp;?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Trois \u00e9tapes suffisent pour recevoir des devis personnalis\u00e9s d&apos;artisans de confiance.
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
              Questions fr\u00e9quentes
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
            Pr\u00eat \u00e0 d\u00e9marrer votre projet&nbsp;?
          </h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Comparez gratuitement les devis d&apos;artisans qualifi\u00e9s et trouvez le bon professionnel pour vos travaux.
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
