import { Metadata } from 'next'
import { Shield, Clock, Users, Search, FileText, CheckCircle, ChevronDown } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import DevisForm from '@/components/DevisForm'

export const metadata: Metadata = {
  title: 'Demander un devis gratuit \u2014 ServicesArtisans',
  description:
    'D\u00e9crivez votre projet et recevez jusqu\u2019\u00e0 3 devis gratuits d\u2019artisans v\u00e9rifi\u00e9s par SIREN. 100% gratuit, sans engagement.',
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
  { icon: Clock, label: 'Sans engagement', sublabel: 'Lib\u00e9rez-vous \u00e0 tout moment' },
  { icon: Users, label: 'Artisans v\u00e9rifi\u00e9s', sublabel: 'SIREN contr\u00f4l\u00e9' },
]

const howSteps = [
  {
    number: '1',
    icon: Search,
    title: 'D\u00e9crivez votre projet',
    description:
      'Indiquez le service recherch\u00e9, votre ville et les d\u00e9tails de votre besoin. Cela ne prend que 2 minutes.',
  },
  {
    number: '2',
    icon: FileText,
    title: 'Recevez des devis',
    description:
      'Nous transmettons votre demande aux artisans qualifi\u00e9s de votre r\u00e9gion. Recevez jusqu\u2019\u00e0 3 devis d\u00e9taill\u00e9s.',
  },
  {
    number: '3',
    icon: CheckCircle,
    title: 'Choisissez votre artisan',
    description:
      'Comparez les offres, consultez les profils et s\u00e9lectionnez l\u2019artisan qui correspond \u00e0 vos attentes.',
  },
]

const faqItems = [
  {
    question: 'Est-ce vraiment gratuit ?',
    answer:
      'Oui, demander un devis est 100% gratuit et sans aucun engagement. Vous ne payez rien pour recevoir des propositions d\u2019artisans.',
  },
  {
    question: 'Combien de devis vais-je recevoir ?',
    answer:
      'Vous pouvez recevoir jusqu\u2019\u00e0 3 devis d\u2019artisans diff\u00e9rents, en fonction de la disponibilit\u00e9 dans votre r\u00e9gion.',
  },
  {
    question: 'En combien de temps suis-je contact\u00e9 ?',
    answer:
      'Les artisans vous contactent g\u00e9n\u00e9ralement sous 24 \u00e0 48h apr\u00e8s votre demande.',
  },
  {
    question: 'Les artisans sont-ils v\u00e9rifi\u00e9s ?',
    answer:
      'Oui, tous les artisans de notre r\u00e9seau sont r\u00e9f\u00e9renc\u00e9s gr\u00e2ce aux donn\u00e9es officielles du registre SIREN. Leur activit\u00e9 et leur immatriculation sont contr\u00f4l\u00e9es.',
  },
  {
    question: 'Suis-je oblig\u00e9 d\u2019accepter un devis ?',
    answer:
      'Non, vous \u00eates libre de comparer les devis re\u00e7us et de choisir celui qui vous convient. Il n\u2019y a aucune obligation d\u2019accepter une proposition.',
  },
  {
    question: 'Quelles donn\u00e9es personnelles sont partag\u00e9es ?',
    answer:
      'Seuls votre nom, t\u00e9l\u00e9phone et description du projet sont transmis aux artisans s\u00e9lectionn\u00e9s. Vos donn\u00e9es ne sont jamais revendues.',
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
              Recevez jusqu&apos;\u00e0{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300">
                3 devis gratuits
              </span>{' '}
              d&apos;artisans v\u00e9rifi\u00e9s
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              D\u00e9crivez votre projet en quelques clics et recevez des devis personnalis\u00e9s
              d&apos;artisans qualifi\u00e9s pr\u00e8s de chez vous. 100% gratuit, sans engagement.
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
      <section className="relative -mt-16 z-10 px-4 pb-20">
        <DevisForm />
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Comment \u00e7a marche ?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              En 3 \u00e9tapes simples, recevez des devis d&apos;artisans qualifi\u00e9s.
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
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Questions fr\u00e9quentes sur les devis
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Tout ce que vous devez savoir avant de demander un devis.
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
          <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-3">
            Pr\u00eat \u00e0 d\u00e9marrer votre projet ?
          </h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Remontez en haut de la page et remplissez le formulaire pour recevoir vos devis gratuits.
          </p>
          <a
            href="/devis"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            Demander un devis gratuit
          </a>
        </div>
      </section>
    </div>
  )
}
