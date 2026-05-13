import { Metadata } from 'next'
import Link from 'next/link'
import { FileCheck, Shield, Lock, Eye, AlertTriangle, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Notre processus de vérification',
  description:
    "Découvrez comment ServicesArtisans vérifie chaque artisan : contrôle SIRET via l'API SIRENE, assurance RC professionnelle, garantie décennale et suivi continu.",
  alternates: getAlternates('/notre-processus-de-verification'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Notre processus de vérification des artisans',
    description:
      "Contrôle SIRET via l'API SIRENE, assurance RC professionnelle, garantie décennale et suivi continu.",
    url: `${SITE_URL}/notre-processus-de-verification`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Vérification artisans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notre processus de vérification des artisans',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const verificationSteps = [
  {
    icon: FileCheck,
    title: "Vérification SIRET via l'API SIRENE",
    description:
      "Chaque artisan souhaitant être référencé doit fournir son numéro SIRET. Nous contrôlons l'existence et l'activité de l'entreprise auprès de l'API SIRENE de l'INSEE, le répertoire officiel des entreprises françaises. Cette vérification permet de confirmer que l'entreprise est bien immatriculée et en activité.",
  },
  {
    icon: Shield,
    title: 'Assurance RC professionnelle',
    description:
      "Nous demandons à chaque artisan de fournir une attestation d'assurance responsabilité civile professionnelle en cours de validité. Cette assurance couvre les dommages pouvant survenir dans le cadre de l'exercice professionnel de l'artisan.",
  },
  {
    icon: Lock,
    title: 'Garantie décennale',
    description:
      "Pour les artisans exerçant dans les métiers du bâtiment concernés par la loi Spinetta, nous vérifions la souscription à une assurance garantie décennale. Cette garantie couvre les dommages compromettant la solidité de l'ouvrage pendant dix ans après la réception des travaux.",
  },
  {
    icon: Eye,
    title: 'Suivi continu',
    description:
      "La vérification ne s'arrête pas à l'inscription. Nous effectuons des contrôles périodiques pour nous assurer que les documents restent à jour (validité des assurances, activité SIRET). Un artisan dont les documents expirent sans renouvellement voit son profil désactivé.",
  },
  {
    icon: AlertTriangle,
    title: 'Signalement',
    description:
      "Si vous constatez un problème avec un artisan RGE certifié référencé sur la plateforme, vous pouvez nous le signaler. Chaque signalement est examiné et peut entraîner la suspension ou le retrait du profil de l'artisan concerné.",
  },
]

export default async function NotreProcessusDeVerificationPage() {
  const cmsPage = await getPageContent('notre-processus-de-verification', 'static')

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment ServicesArtisans vérifie les artisans',
    description:
      "Processus de vérification en 5 étapes : contrôle SIRET via l'API SIRENE, assurance RC professionnelle, garantie décennale, suivi continu et traitement des signalements.",
    step: verificationSteps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
    })),
  }

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={[
            getBreadcrumbSchema([
              { name: 'Accueil', url: '/' },
              { name: 'Notre processus de vérification', url: '/notre-processus-de-verification' },
            ]),
            howToSchema,
          ]}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Notre processus de vérification' }]} className="mb-4" />
            <PageHeroH1 size="article">{cmsPage.title}</PageHeroH1>
          </div>
        </section>
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <CmsContent html={cmsPage.content_html} />
            </div>
          </div>
        </section>
      </div>
    )
  }

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Notre processus de vérification', url: '/notre-processus-de-verification' },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'Quels documents sont contrôlés lors de l’inscription d’un artisan ?',
      answer:
        "Nous contrôlons : le numéro SIRET via l'API SIRENE officielle (INSEE), le code NAF cohérent avec le métier déclaré, l'attestation d'assurance responsabilité civile professionnelle en cours de validité, l'attestation de garantie décennale pour les métiers concernés, les qualifications RGE le cas échéant (via la base ADEME).",
    },
    {
      question: 'À quelle fréquence les vérifications sont-elles renouvelées ?',
      answer:
        "Les données SIRENE sont contrôlées mensuellement (cessation d'activité, radiation). Les qualifications RGE sont synchronisées toutes les semaines avec la base officielle ADEME. Une alerte remonte immédiatement pour tout changement critique et la fiche est désactivée sous 24 h en cas de perte d'éligibilité.",
    },
    {
      question: 'Que se passe-t-il si un artisan perd sa qualification RGE ?',
      answer:
        "La fiche perd automatiquement son badge RGE et n'apparaît plus dans les résultats filtrés 'RGE uniquement'. L'artisan peut re-déposer sa qualification une fois renouvelée. Pour les travaux en cours au moment de la perte de qualification, le client est invité à demander une attestation de renouvellement avant la fin du chantier.",
    },
    {
      question: 'Comment signaler une fiche suspecte ?',
      answer:
        "Chaque fiche artisan comporte un bouton « Signaler » permettant d'alerter notre équipe modération (identité douteuse, SIRET incorrect, activité suspectée d'être frauduleuse). Le signalement est traité sous 48 h ouvrées avec suspension immédiate de la fiche en cas de doute sérieux.",
    },
    {
      question: "Quels contrôles s'appliquent aux avis clients ?",
      answer:
        "Seuls les clients ayant fait une demande de devis sur la plateforme peuvent laisser un avis. Nous utilisons un token HMAC signé lié à l'identifiant du devis pour prévenir la fabrication d'avis fictifs. La modération avant publication détecte les avis diffamatoires, faux avis (positifs ou négatifs), spam et conflits d'intérêts.",
    },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={[breadcrumbSchema, howToSchema, faqSchema]} />

      {/* Hero */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,107,75,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(232,107,75,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(232,107,75,0.06) 0%, transparent 50%)',
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
            items={[{ label: 'Notre processus de vérification' }]}
            className="mb-6 text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
          />
          <div className="text-center">
            <h1
              data-speakable="true"
              className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
            >
              Notre processus de vérification des artisans
            </h1>
            <p className="text-xl text-charcoal-400 max-w-3xl mx-auto">
              Chaque artisan RGE certifié référencé sur {companyIdentity.name} passe par un
              processus de vérification structuré. Voici les étapes que nous suivons.
            </p>
          </div>
        </div>
      </section>

      {/* Étapes de vérification */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-charcoal-900 mb-4">
              Les étapes de notre processus
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Un processus en plusieurs étapes pour s'assurer de la fiabilité des artisans
              référencés sur la plateforme.
            </p>
          </div>

          <div className="space-y-8 max-w-4xl mx-auto">
            {verificationSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.title}
                  className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 flex items-start gap-5"
                >
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary-500" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-semibold text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
                        Étape {index + 1}
                      </span>
                      <h3 className="text-lg font-semibold text-charcoal-900">{step.title}</h3>
                    </div>
                    <p className="text-charcoal-600">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ce que cela signifie pour vous */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">
              Ce que cela signifie pour vous
            </h2>
            <div className="space-y-4 text-charcoal-600">
              <p>
                En tant qu'utilisateur de la plateforme, vous savez que chaque artisan affiché a
                fait l'objet de vérifications documentaires. Cela ne constitue pas une garantie
                absolue de la qualité des prestations, mais un premier filtre vérifiable.
              </p>
              <p>
                Si une prestation ne correspond pas à vos attentes, vous disposez de plusieurs
                recours : signaler l'artisan, laisser un avis sur la plateforme, ou faire appel à
                notre processus de médiation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signaler un problème */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-sand-50 rounded-2xl p-8 max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Signaler un problème</h2>
            <p className="text-charcoal-600 mb-6">
              Vous avez constaté un problème avec un artisan RGE certifié ? Contactez-nous à{' '}
              <a
                href={`mailto:${companyIdentity.email}`}
                className="text-primary-500 hover:underline"
              >
                <strong>{companyIdentity.email}</strong>
              </a>{' '}
              ou via notre page de contact. Chaque signalement est examiné avec attention.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Nous contacter
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">
              En savoir plus
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/a-propos"
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  À propos de {companyIdentity.name}
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Découvrez notre mission, notre technologie et nos engagements.
                </p>
              </Link>
              <Link
                href="/politique-avis"
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Politique de gestion des avis
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Comment les avis sont collectés, modérés et publiés sur la plateforme.
                </p>
              </Link>
              <Link
                href="/mediation"
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Médiation et résolution des litiges
                </h3>
                <p className="text-charcoal-600 text-sm">
                  En cas de litige, découvrez notre processus de médiation.
                </p>
              </Link>
              <Link
                href="/mentions-legales"
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Mentions légales
                </h3>
                <p className="text-charcoal-600 text-sm">
                  Informations juridiques, éditeur et hébergeur du site.
                </p>
              </Link>
              <Link
                href="/contact"
                className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
              >
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                  Contact
                </h3>
                <p className="text-charcoal-600 text-sm">Une question ? Contactez notre équipe.</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
