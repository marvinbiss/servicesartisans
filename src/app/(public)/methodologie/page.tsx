import { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Calculator,
  UserCheck,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle2,
  Scale,
} from 'lucide-react'
import { Breadcrumb } from '@/components/seo/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'

export const revalidate = 3600

const path = '/methodologie'

export const metadata: Metadata = {
  title: 'Notre méthodologie',
  description:
    'Comment ServicesArtisans vérifie les artisans, calcule prix, modère avis et rédige le contenu. Méthodologie transparente, sources officielles.',
  alternates: getAlternates(path),
  openGraph: {
    title: 'Notre méthodologie | ServicesArtisans',
    description:
      'Découvrez comment nous vérifions les artisans, calculons les prix et garantissons la fiabilité de nos informations.',
    url: `${SITE_URL}${path}`,
    type: 'website',
    locale: 'fr_FR',
  },
}

const METHODOLOGY_SECTIONS = [
  {
    id: 'prix',
    icon: Calculator,
    title: 'Comment les prix sont calculés',
    intro:
      'Les fourchettes de prix affichées sur ServicesArtisans sont construites à partir de données de marché réelles, jamais inventées.',
    points: [
      'Nous partons de prix de référence nationaux issus de bases professionnelles (artisans, fédérations du bâtiment, observatoires des prix).',
      "Ces prix sont ajustés par des multiplicateurs départementaux qui reflètent les écarts de coût de la vie, de main-d'œuvre et de matériaux entre les territoires (par exemple, l'Île-de-France est plus chère que la Creuse).",
      "Les fourchettes basses et hautes tiennent compte de la complexité des travaux, de la qualité des matériaux et des conditions d'accès au chantier.",
      "Les prix sont révisés régulièrement pour intégrer l'évolution des coûts des matériaux et de la main-d'œuvre.",
      "Lorsqu'aucune donnée fiable n'est disponible pour un type de travaux, nous ne publions pas de prix plutôt que d'afficher une estimation douteuse.",
    ],
  },
  {
    id: 'verification',
    icon: UserCheck,
    title: 'Comment les artisans sont vérifiés',
    intro:
      "Chaque artisan RGE certifié référencé sur ServicesArtisans fait l'objet de vérifications avant et après son inscription.",
    points: [
      "Vérification du numéro SIRET via l'API SIRENE officielle : existence de l'entreprise, code APE cohérent avec le métier déclaré, établissement actif.",
      'Pour les artisans RGE : vérification hebdomadaire automatisée via la base ADEME. Les qualifications expirées ou retirées sont désactivées sous 24h.',
      "Vérification de l'assurance décennale : demande du justificatif lors de la revendication de fiche, contrôle de la validité et de la couverture.",
      'Les artisans ne peuvent pas acheter leur position dans les résultats. Le référencement est basé sur des critères objectifs (localisation, qualifications, avis).',
      "Les fiches non revendiquées sont clairement identifiées. Nous n'affichons jamais de coordonnées téléphoniques non vérifiées.",
    ],
  },
  {
    id: 'avis',
    icon: MessageSquare,
    title: 'Comment les avis sont modérés',
    intro:
      "Les avis publiés sur ServicesArtisans font l'objet d'un processus de modération rigoureux pour garantir leur authenticité.",
    points: [
      'Seuls les utilisateurs authentifiés peuvent déposer un avis. Chaque avis est associé à un compte vérifié.',
      "Modération avant publication : les avis sont relus pour détecter les contenus diffamatoires, les faux avis (positifs comme négatifs), le spam et les conflits d'intérêts.",
      "Les avis négatifs sont publiés s'ils sont factuels et respectueux. Nous ne supprimons jamais un avis négatif légitime à la demande d'un artisan.",
      "L'artisan concerné peut répondre publiquement à tout avis. Cette réponse est affichée sous l'avis original.",
      "Notre politique d'avis complète est consultable sur la page dédiée.",
    ],
  },
  {
    id: 'contenu',
    icon: FileText,
    title: 'Comment le contenu est rédigé',
    intro:
      'Nos guides, articles et fiches métier sont rédigés par une équipe de rédacteurs spécialisés dans le bâtiment et la rénovation.',
    points: [
      'Chaque contenu est rédigé ou supervisé par un expert du domaine concerné (plomberie, électricité, isolation, chauffage, etc.).',
      'Les informations réglementaires (normes, aides financières, obligations légales) sont systématiquement sourcées auprès des organismes officiels (ADEME, ANAH, Légifrance).',
      "Les contenus sont mis à jour à chaque évolution réglementaire (barèmes MaPrimeRénov', fiches CEE, normes RT/RE) et révisés au minimum une fois par trimestre.",
      'Nous citons nos sources dans chaque article. Toutes les bases de données utilisées sont listées sur notre page Sources.',
      "Notre équipe éditoriale cumule plus de 80 ans d'expérience terrain et détient des certifications reconnues (RGE, Qualibat, Qualifelec, OPQTECC).",
    ],
  },
]

export default function MethodologiePage() {
  const breadcrumbItems = [{ label: 'Notre méthodologie' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: SITE_URL },
    { name: 'Notre méthodologie', url: `${SITE_URL}${path}` },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'Comment sont calculés les prix affichés ?',
      answer:
        "Les fourchettes de prix proviennent de données de marché réelles : prix de référence nationaux, bases professionnelles (CAPEB, FFB, observatoires des prix) et devis réels signés via notre plateforme. Nous appliquons des multiplicateurs départementaux pour refléter les écarts régionaux et affichons toujours une fourchette basse/haute. En l'absence de données fiables, nous préférons ne pas afficher de prix plutôt qu'une estimation douteuse.",
    },
    {
      question: 'Comment sont vérifiés les artisans RGE certifiés ?',
      answer:
        "Pivot full RGE 2026-05-05 : ServicesArtisans n'affiche publiquement que des artisans RGE certifiés. Vérification SIRET via l'API SIRENE officielle (entreprise active, NAF cohérent avec le métier), sync hebdomadaire avec la base ADEME france-renov.gouv.fr pour les qualifications RGE (Qualibat, Qualifelec, QualiPAC, Qualit'EnR) — qualifications expirées désactivées sous 24h, demande d'attestation décennale à la revendication. Les artisans ne peuvent pas acheter leur position dans les résultats : le classement est basé sur des critères objectifs (localisation, qualifications, note moyenne, nombre d'avis).",
    },
    {
      question: 'Les avis peuvent-ils être supprimés à la demande d’un artisan ?',
      answer:
        "Non. Un avis négatif factuel et respectueux n'est jamais supprimé à la demande de l'artisan concerné. Seuls les avis diffamatoires, injurieux, faux (positifs comme négatifs), ou en conflit d'intérêt peuvent être retirés après modération. L'artisan peut toujours publier une réponse publique sous l'avis.",
    },
    {
      question: 'Qui rédige le contenu éditorial ?',
      answer:
        "Nos rédacteurs internes (voir /equipe) rédigent les guides à partir de sources exclusivement officielles : ADEME, service-public.fr, France Rénov', ANAH, Journal Officiel, DTU/CSTB, INSEE, CAPEB, FFB. Chaque guide technique est relu par un artisan RGE actif de notre réseau. Nous n'utilisons ni contenu scrapé ni générateur IA non supervisé.",
    },
    {
      question: 'Peut-on auditer votre méthodologie ?',
      answer:
        "Oui. Nos études sont publiées sous licence Creative Commons BY 4.0 avec sources, définitions et limites explicites. Notre pipeline de vérification des artisans est documenté sur /notre-processus-de-verification. Pour un audit indépendant ou une demande d'accès détaillée, contactez notre équipe éditoriale via /contact.",
    },
  ])

  return (
    <>
      <JsonLd data={[breadcrumbSchema, faqSchema]} />

      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} className="mb-6" />

          <header className="mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-4 py-1.5 mb-5">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">Transparence E-E-A-T</span>
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-charcoal-900 mb-4"
            >
              Notre méthodologie
            </h1>
            <p className="text-charcoal-600 text-lg max-w-3xl leading-relaxed">
              Chez ServicesArtisans, la fiabilité de l&apos;information est notre priorité absolue.
              Cette page explique en toute transparence comment nous vérifions les artisans,
              calculons les prix, modérons les avis et rédigeons nos contenus.
            </p>
          </header>

          <nav className="mb-10 bg-white rounded-xl border border-sand-200 p-6">
            <p className="text-sm font-semibold text-charcoal-700 mb-3">Sommaire</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {METHODOLOGY_SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="space-y-10">
            {METHODOLOGY_SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <section
                  key={section.id}
                  id={section.id}
                  className="bg-white rounded-xl border border-sand-200 p-6 md:p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-semibold text-charcoal-900">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-charcoal-600 leading-relaxed mb-5">{section.intro}</p>
                  <ul className="space-y-3">
                    {section.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                        <span className="text-charcoal-700 leading-relaxed text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>

          <section className="mt-12 bg-white rounded-xl border border-sand-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary-600" />
              <h2 className="font-heading text-xl font-semibold text-charcoal-900">
                Notre engagement d&apos;indépendance
              </h2>
            </div>
            <p className="text-charcoal-600 leading-relaxed mb-4">
              ServicesArtisans est un service indépendant. Aucun artisan, aucune marque et aucun
              organisme ne peut influencer le contenu éditorial du site. Les classements, les
              fourchettes de prix et les recommandations sont produits de manière objective, sur la
              base de données publiques et de critères transparents.
            </p>
            <p className="text-charcoal-600 leading-relaxed mb-6">
              Si vous constatez une erreur ou souhaitez signaler une information obsolète,
              n&apos;hésitez pas à nous contacter. Nous traitons chaque signalement sous 48 heures
              ouvrées.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sources"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
              >
                Nos sources de données
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/equipe"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 text-charcoal-700 font-semibold hover:bg-sand-100 transition-colors"
              >
                Notre équipe
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-sand-300 text-charcoal-700 font-semibold hover:bg-sand-100 transition-colors"
              >
                Nous contacter
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
