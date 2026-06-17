import { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, Users, Scale, Clock, Mail, ArrowRight } from 'lucide-react'
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
  title: 'Médiation et résolution des litiges',
  description:
    'Processus de médiation de ServicesArtisans : réclamation, médiation interne et externe, délais de traitement. Résolution amiable des litiges.',
  alternates: getAlternates('/mediation'),
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Médiation et résolution des litiges',
    description:
      'Processus de médiation : réclamation, médiation interne et externe, résolution amiable des litiges.',
    url: `${SITE_URL}/mediation`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Médiation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Médiation et résolution des litiges',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const steps = [
  {
    icon: MessageCircle,
    title: 'Processus de réclamation',
    content: [
      'Si vous rencontrez un problème avec une prestation effectuée par un artisan RGE certifié référencé sur la plateforme, la première étape consiste à nous adresser une réclamation écrite.',
      <>
        Vous pouvez nous contacter par email à{' '}
        <a
          href={`mailto:${companyIdentity.supportEmail}`}
          className="text-primary-500 hover:underline font-medium"
        >
          {companyIdentity.supportEmail}
        </a>{' '}
        en décrivant la situation, la prestation concernée et le résultat souhaité. Nous accusons
        réception de chaque réclamation.
      </>,
    ],
  },
  {
    icon: Users,
    title: 'Médiation interne',
    content: [
      'À la réception de votre réclamation, notre équipe prend contact avec les deux parties (client et artisan) pour comprendre la situation et tenter de trouver une solution amiable.',
      "Cette étape vise à faciliter le dialogue entre le client et l'artisan. Nous ne sommes pas un tribunal et n'avons pas le pouvoir d'imposer une solution, mais nous accompagnons les parties dans la recherche d'un accord.",
    ],
  },
  {
    icon: Scale,
    title: 'Médiation externe',
    content: [
      "Si la médiation interne n'aboutit pas à une solution satisfaisante, vous pouvez faire appel à un médiateur de la consommation conformément aux dispositions du Code de la consommation (articles L.611-1 et suivants).",
      "Le recours au médiateur de la consommation est gratuit pour le consommateur. Les coordonnées du médiateur compétent seront communiquées lors de l'immatriculation de la société, conformément à l'obligation légale.",
    ],
  },
  {
    icon: Clock,
    title: 'Délais de traitement',
    content: [
      "Nous nous efforçons d'accuser réception de chaque réclamation dans un délai de 48 heures ouvrées.",
      "Le processus de médiation interne vise à proposer une solution dans un délai raisonnable après réception de l'ensemble des éléments nécessaires. Ce délai dépend de la complexité du dossier et de la réactivité des parties.",
    ],
  },
]

export default async function MediationPage() {
  const cmsPage = await getPageContent('mediation', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Médiation', url: '/mediation' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Médiation' }]} className="mb-4" />
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
    { name: 'Médiation', url: '/mediation' },
  ])

  const faqSchema = getFAQSchema([
    {
      question: 'Comment adresser une réclamation à ServicesArtisans ?',
      answer: `Envoyez un email détaillé à ${companyIdentity.supportEmail} décrivant la situation : nom de l'artisan, dates d'intervention, devis et facture concernés, nature précise du litige et résultat souhaité. Nous accusons réception sous 48 h ouvrées et vous communiquons le numéro de dossier de médiation.`,
    },
    {
      question: 'Quel est le délai de traitement d’une réclamation ?',
      answer:
        "Première réponse sous 48 h ouvrées, instruction complète sous 30 jours (pièces, confrontation avec l'artisan, proposition de solution amiable). En cas d'échec de la médiation interne, nous vous orientons vers le médiateur de la consommation du bâtiment (saisine gratuite, délai légal 90 jours).",
    },
    {
      question: 'La médiation est-elle gratuite ?',
      answer:
        "Oui. La médiation interne ServicesArtisans est gratuite pour le particulier. La saisine du médiateur de la consommation agréé CMCB (Centre de Médiation de la Consommation du Bâtiment) est également gratuite. Seules les procédures judiciaires (tribunal judiciaire, tribunal de proximité) ont un coût, souvent couvert par l'assurance protection juridique.",
    },
    {
      question: 'Qui est le médiateur de la consommation compétent ?',
      answer:
        "Pour les litiges avec un artisan du bâtiment, le médiateur de la consommation est le CMCB (Centre de Médiation de la Consommation du Bâtiment) ou le médiateur désigné par la fédération professionnelle dont relève l'artisan (CAPEB, FFB). Le nom du médiateur doit obligatoirement figurer sur le devis et la facture.",
    },
    {
      question: 'Quels recours si la médiation échoue ?',
      answer:
        "En cas d'échec de la médiation, vous pouvez saisir le tribunal de proximité (litiges < 10 000 €) ou le tribunal judiciaire (au-delà). Pensez à activer votre assurance protection juridique qui prend généralement en charge les frais d'avocat et d'expert. Un procès-verbal d'huissier sur les malfaçons renforce votre dossier.",
    },
  ])

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
                'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200, 73, 42,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 110%, rgba(200, 73, 42,0.1) 0%, transparent 50%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(200, 73, 42,0.06) 0%, transparent 50%)',
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 md:pt-14 md:pb-36 text-center">
          <div className="mb-10">
            <Breadcrumb
              items={[{ label: 'Médiation' }]}
              className="text-charcoal-400 [&_a]:text-charcoal-400 [&_a:hover]:text-white [&_svg]:text-charcoal-600"
            />
          </div>
          <h1
            data-speakable="true"
            className="font-heading text-4xl md:text-5xl font-extrabold mb-6 tracking-[-0.025em]"
          >
            Médiation et résolution des litiges
          </h1>
          <p className="text-xl text-charcoal-400 max-w-3xl mx-auto">
            En cas de litige, {companyIdentity.name} met en place un processus de médiation pour
            faciliter la résolution amiable des différends.
          </p>
          <p className="text-charcoal-500 mt-4 text-sm">Dernière mise à jour : avril 2026</p>
        </div>
      </section>

      {/* Étapes */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="bg-white rounded-xl shadow-sm p-8 border border-sand-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary-500 bg-primary-50 px-2 py-0.5 rounded">
                      Étape {index + 1}
                    </span>
                    <h2 className="text-2xl font-bold text-charcoal-900">{step.title}</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {step.content.map((paragraph, i) => (
                    <p key={i} className="text-charcoal-600 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-4">
              Contact pour les réclamations
            </h2>
            <div className="space-y-2 text-charcoal-600 mb-6">
              <p>
                Pour toute réclamation :{' '}
                <a
                  href={`mailto:${companyIdentity.supportEmail}`}
                  className="text-primary-500 hover:underline"
                >
                  <strong>{companyIdentity.supportEmail}</strong>
                </a>
              </p>
              <p>
                Pour toute autre question :{' '}
                <a
                  href={`mailto:${companyIdentity.email}`}
                  className="text-primary-500 hover:underline"
                >
                  <strong>{companyIdentity.email}</strong>
                </a>
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
            >
              Page de contact
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-charcoal-900 mb-6 text-center">Pages associées</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link
              href="/notre-processus-de-verification"
              className="bg-white rounded-xl shadow-sm p-6 border border-sand-200 hover:shadow-md transition-shadow group"
            >
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2 group-hover:text-primary-500 transition-colors">
                Notre processus de vérification
              </h3>
              <p className="text-charcoal-600 text-sm">
                Comment nous référençons les artisans avant leur référencement sur la plateforme.
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
      </section>
    </div>
  )
}
