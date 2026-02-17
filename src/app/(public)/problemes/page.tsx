import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, Search, ArrowRight, CheckCircle, ChevronDown, Shield, Clock, Wrench, Zap, Key, Flame, HardHat } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import problems from '@/lib/data/problems'

export const metadata: Metadata = {
  title: 'Probl\u00e8mes courants \u2014 Diagnostic et solutions',
  description: 'Identifiez votre probl\u00e8me (fuite d\u2019eau, panne \u00e9lectrique, serrure bloqu\u00e9e\u2026) et trouvez la solution adapt\u00e9e. Diagnostic gratuit, conseils pratiques et mise en relation avec des artisans r\u00e9f\u00e9renc\u00e9s.',
  alternates: { canonical: `${SITE_URL}/problemes` },
  openGraph: {
    locale: 'fr_FR',
    title: 'Probl\u00e8mes courants \u2014 Diagnostic et solutions',
    description: 'Identifiez votre probl\u00e8me et trouvez la solution adapt\u00e9e. Diagnostic gratuit, conseils pratiques et artisans r\u00e9f\u00e9renc\u00e9s.',
    url: `${SITE_URL}/problemes`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans \u2014 Probl\u00e8mes courants' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Probl\u00e8mes courants \u2014 Diagnostic et solutions',
    description: 'Identifiez votre probl\u00e8me et trouvez la solution adapt\u00e9e avec nos artisans r\u00e9f\u00e9renc\u00e9s.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const urgencyConfig = {
  haute: { label: 'Urgence haute', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  moyenne: { label: 'Urgence moyenne', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  basse: { label: 'Non urgent', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
}

const serviceCategories = [
  { name: 'Plomberie', slug: 'plombier', icon: Wrench, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: '\u00c9lectricit\u00e9', slug: 'electricien', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  { name: 'Serrurerie', slug: 'serrurier', icon: Key, color: 'text-green-600', bg: 'bg-green-50' },
  { name: 'Chauffage', slug: 'chauffagiste', icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
  { name: 'Toiture', slug: 'couvreur', icon: HardHat, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { name: 'Ma\u00e7onnerie', slug: 'macon', icon: HardHat, color: 'text-gray-600', bg: 'bg-gray-100' },
  { name: 'Autres', slug: '_other', icon: Wrench, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const otherServiceSlugs = ['peintre-en-batiment', 'vitrier', 'menuisier', 'isolation-thermique', 'desinsectisation']

function getProblemsByCategory(slug: string) {
  if (slug === '_other') {
    return problems.filter((p) => otherServiceSlugs.includes(p.primaryService))
  }
  return problems.filter((p) => p.primaryService === slug)
}

const serviceNameMap: Record<string, string> = {
  plombier: 'Plombier',
  electricien: '\u00c9lectricien',
  serrurier: 'Serrurier',
  chauffagiste: 'Chauffagiste',
  couvreur: 'Couvreur',
  macon: 'Ma\u00e7on',
  'peintre-en-batiment': 'Peintre en b\u00e2timent',
  vitrier: 'Vitrier',
  menuisier: 'Menuisier',
  'isolation-thermique': 'Isolation thermique',
  desinsectisation: 'D\u00e9sinsectisation',
}

const howSteps = [
  {
    step: 1,
    icon: Search,
    title: 'Identifiez votre probl\u00e8me',
    description: 'Parcourez notre liste de probl\u00e8mes courants ou d\u00e9crivez votre situation pour trouver le diagnostic adapt\u00e9.',
  },
  {
    step: 2,
    icon: CheckCircle,
    title: 'Suivez nos conseils',
    description: 'Consultez les gestes d\u2019urgence, les sympt\u00f4mes \u00e0 surveiller et les actions \u00e0 mener en attendant l\u2019artisan.',
  },
  {
    step: 3,
    icon: Wrench,
    title: 'Contactez un artisan',
    description: 'Demandez un devis gratuit aupr\u00e8s d\u2019artisans r\u00e9f\u00e9renc\u00e9s sp\u00e9cialis\u00e9s dans votre type de probl\u00e8me.',
  },
]

const faqItems = [
  {
    question: 'Comment identifier le type de probl\u00e8me que j\u2019ai ?',
    answer: 'Parcourez notre liste de probl\u00e8mes class\u00e9s par cat\u00e9gorie (plomberie, \u00e9lectricit\u00e9, serrurerie\u2026). Chaque fiche d\u00e9taille les sympt\u00f4mes typiques pour vous aider \u00e0 identifier votre situation. En cas de doute, contactez un artisan pour un diagnostic professionnel.',
  },
  {
    question: 'Que faire en attendant l\u2019artisan ?',
    answer: 'Chaque fiche probl\u00e8me liste les gestes d\u2019urgence \u00e0 r\u00e9aliser imm\u00e9diatement : couper l\u2019eau, l\u2019\u00e9lectricit\u00e9 ou le gaz si n\u00e9cessaire, s\u00e9curiser la zone et prot\u00e9ger vos biens. Ces actions simples limitent les d\u00e9g\u00e2ts en attendant l\u2019intervention.',
  },
  {
    question: 'Les diagnostics sont-ils gratuits ?',
    answer: 'Les fiches de diagnostic sur ServicesArtisans sont enti\u00e8rement gratuites. La demande de devis est \u00e9galement gratuite et sans engagement. Seule l\u2019intervention de l\u2019artisan est payante, apr\u00e8s acceptation de votre part.',
  },
  {
    question: 'Comment trouver un artisan pour mon probl\u00e8me ?',
    answer: 'Depuis chaque fiche probl\u00e8me, vous pouvez acc\u00e9der directement \u00e0 la page du service concern\u00e9 et demander un devis gratuit. Nos artisans sont r\u00e9f\u00e9renc\u00e9s par SIREN et leurs coordonn\u00e9es sont v\u00e9rifi\u00e9es.',
  },
  {
    question: 'Les co\u00fbts indiqu\u00e9s sont-ils fiables ?',
    answer: 'Les fourchettes de prix sont des estimations indicatives bas\u00e9es sur les tarifs constat\u00e9s en France. Le co\u00fbt r\u00e9el d\u00e9pend de la complexit\u00e9 du probl\u00e8me, de votre r\u00e9gion et de l\u2019urgence. Seul un devis personnalis\u00e9 fait foi.',
  },
]

export default function ProblemesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={[
        getBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Probl\u00e8mes courants', url: '/problemes' },
        ]),
        getFAQSchema(faqItems.map((item) => ({ question: item.question, answer: item.answer }))),
      ]} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={[{ label: 'Probl\u00e8mes courants' }]} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-[#0a0f1e] text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(239,68,68,0.1) 0%, transparent 50%)',
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 md:pt-16 md:pb-36">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm border border-amber-400/30 rounded-full mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-200">30 probl\u00e8mes document\u00e9s</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 tracking-[-0.025em] leading-[1.1]">
              Probl\u00e8mes courants{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-orange-300">
                Diagnostic et solutions
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
              Identifiez votre probl\u00e8me, suivez nos conseils d&apos;urgence et trouvez un artisan r\u00e9f\u00e9renc\u00e9
              pour intervenir rapidement. Fiches compl\u00e8tes avec sympt\u00f4mes, co\u00fbts et pr\u00e9vention.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/80">Artisans r\u00e9f\u00e9renc\u00e9s</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-white/80">Conseils imm\u00e9diats</span>
              </div>
              <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/80">Devis gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems by category */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Par cat\u00e9gorie</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Trouvez votre probl\u00e8me
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              S\u00e9lectionnez la cat\u00e9gorie correspondante pour acc\u00e9der au diagnostic d\u00e9taill\u00e9 et aux solutions.
            </p>
          </div>

          <div className="space-y-12">
            {serviceCategories.map((category) => {
              const categoryProblems = getProblemsByCategory(category.slug)
              if (categoryProblems.length === 0) return null
              const Icon = category.icon
              return (
                <div key={category.slug}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 ${category.bg} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-400">({categoryProblems.length} probl\u00e8me{categoryProblems.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryProblems.map((problem) => {
                      const urgency = urgencyConfig[problem.urgencyLevel]
                      return (
                        <Link
                          key={problem.slug}
                          href={`/problemes/${problem.slug}`}
                          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-gray-300 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                              {problem.name}
                            </h4>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${urgency.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${urgency.dot}`} />
                              {urgency.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{problem.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              {problem.estimatedCost.min} \u2013 {problem.estimatedCost.max} \u20ac
                            </span>
                            <span className="text-xs text-gray-400">
                              {serviceNameMap[problem.primaryService] || problem.primaryService}
                            </span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Simple et rapide</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Comment \u00e7a marche ?
            </h2>
            <p className="text-slate-500 max-w-lg mx-auto">
              Trois \u00e9tapes pour diagnostiquer votre probl\u00e8me et trouver un artisan.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%]">
              <div className="h-px border-t-2 border-dashed border-gray-200" />
            </div>
            {howSteps.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative text-center">
                  <div className="relative z-10 mx-auto mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-slate-700">{item.step}</span>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Questions fr\u00e9quentes
            </h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group bg-gray-50 rounded-xl border border-gray-100 overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-5 text-left hover:bg-gray-100 transition-colors [&::-webkit-details-marker]:hidden">
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

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Besoin d&apos;un artisan ?
          </h2>
          <p className="text-xl text-amber-100/90 mb-8 max-w-2xl mx-auto">
            Demandez un devis gratuit et recevez jusqu&apos;\u00e0 3 propositions d&apos;artisans r\u00e9f\u00e9renc\u00e9s dans votre r\u00e9gion.
          </p>
          <Link
            href="/devis"
            className="inline-flex items-center gap-3 bg-white text-amber-700 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            Demander un devis gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Voir aussi */}
      <section className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Voir aussi</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Services d&apos;urgence</h3>
              <div className="space-y-2">
                <Link href="/urgence" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Urgence artisan 24h/24</Link>
                <Link href="/urgence/plombier" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Plombier urgence</Link>
                <Link href="/urgence/electricien" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">\u00c9lectricien urgence</Link>
                <Link href="/urgence/serrurier" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Serrurier urgence</Link>
                <Link href="/urgence/chauffagiste" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Chauffagiste urgence</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Devis par m\u00e9tier</h3>
              <div className="space-y-2">
                <Link href="/devis/plombier" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Devis plombier</Link>
                <Link href="/devis/electricien" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Devis \u00e9lectricien</Link>
                <Link href="/devis/serrurier" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Devis serrurier</Link>
                <Link href="/devis/chauffagiste" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Devis chauffagiste</Link>
                <Link href="/devis/couvreur" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Devis couvreur</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informations utiles</h3>
              <div className="space-y-2">
                <Link href="/comment-ca-marche" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Comment \u00e7a marche</Link>
                <Link href="/tarifs-artisans" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Guide des tarifs</Link>
                <Link href="/faq" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">FAQ</Link>
                <Link href="/notre-processus-de-verification" className="block text-sm text-gray-600 hover:text-amber-600 py-1 transition-colors">Processus de v\u00e9rification</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial credibility */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Information importante</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Les co\u00fbts et d\u00e9lais indiqu\u00e9s sont des estimations moyennes constat\u00e9es en France m\u00e9tropolitaine. Ils varient selon la complexit\u00e9 du probl\u00e8me, votre r\u00e9gion et l&apos;urgence. Seul un devis personnalis\u00e9 fait foi. ServicesArtisans est un annuaire ind\u00e9pendant \u2014 nous mettons en relation mais ne r\u00e9alisons pas les interventions. En cas d&apos;urgence vitale, appelez le 18 (pompiers) ou le 112.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
