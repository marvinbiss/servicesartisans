import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Notification de violation de données',
  description: 'Procédure de notification de violation de données personnelles conforme aux articles 33 et 34 du RGPD.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/violation-donnees`,
  },
  openGraph: {
    title: 'Notification de violation de données',
    description: 'Procédure de notification de violation de données personnelles conforme au RGPD.',
    url: `${SITE_URL}/violation-donnees`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Violation de données' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notification de violation de données',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function ViolationDonneesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Notification de violation de données', url: '/violation-donnees' },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: 'Notification de violation de données' }]} className="mb-4" />
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Notification de violation de données
          </h1>
          <p className="text-gray-600 mt-2">
            Dernière mise à jour : Avril 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

            <h2>1. Notre engagement</h2>
            <p>
              {companyIdentity.name} s&apos;engage à protéger vos données personnelles. En cas de
              violation de données (accès non autorisé, perte, destruction), nous appliquons une
              procédure stricte conformément aux articles 33 et 34 du RGPD.
            </p>

            <h2>2. Qu&apos;est-ce qu&apos;une violation de données ?</h2>
            <p>
              Tout incident de sécurité entraînant la destruction, la perte, l&apos;altération,
              la divulgation non autorisée ou l&apos;accès non autorisé à des données personnelles.
            </p>

            <h2>3. Notre procédure</h2>
            <ol>
              <li>
                <strong>Détection et évaluation (0-24h) :</strong> Identification de la violation,
                évaluation de la gravité, isolation du système affecté.
              </li>
              <li>
                <strong>Notification CNIL (sous 72h) :</strong> Si la violation présente un risque
                pour les droits et libertés des personnes, notification à la CNIL via le téléservice
                dédié.
              </li>
              <li>
                <strong>Notification des personnes (sans délai injustifié) :</strong> Si le risque
                est élevé, information directe des personnes concernées par email avec : nature de
                la violation, données concernées, conséquences probables, mesures prises.
              </li>
              <li>
                <strong>Remédiation :</strong> Correction de la faille, renforcement des mesures
                de sécurité, documentation complète de l&apos;incident.
              </li>
            </ol>

            <h2>4. Signaler une faille de sécurité</h2>
            <p>
              Si vous découvrez une faille de sécurité ou suspectez une violation de données :
            </p>
            <ul>
              <li>
                <strong>Email :</strong>{' '}
                <a href={`mailto:${companyIdentity.dpoEmail}`} className="text-blue-600 hover:underline">
                  <strong>{companyIdentity.dpoEmail}</strong>
                </a>
              </li>
              <li>
                <strong>Objet :</strong> [SECURITE] Description de la faille
              </li>
            </ul>
            <p>
              Nous nous engageons à accuser réception de votre signalement sous 24 heures.
            </p>

            <h2>5. Registre des violations</h2>
            <p>
              Conformément à l&apos;article 33.5 du RGPD, nous tenons un registre interne de
              toutes les violations de données, qu&apos;elles aient ou non été notifiées à la CNIL.
            </p>

            <h2>6. Contact CNIL</h2>
            <p>
              Commission Nationale de l&apos;Informatique et des Libertés
            </p>
            <ul>
              <li>3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
              <li>
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.cnil.fr
                </a>
              </li>
            </ul>

            <h2>7. Contact DPO</h2>
            <p>
              Pour toute question relative à cette procédure ou à la protection de vos données :
            </p>
            <ul>
              <li>
                <strong>Email :</strong>{' '}
                <a href={`mailto:${companyIdentity.dpoEmail}`} className="text-blue-600 hover:underline">
                  {companyIdentity.dpoEmail}
                </a>
              </li>
              {companyIdentity.address && (
                <li>
                  <strong>Courrier :</strong> {companyIdentity.name} — Service DPO — {companyIdentity.address}
                </li>
              )}
            </ul>
            <p>
              Consultez également notre{' '}
              <Link href="/confidentialite" className="text-blue-600 hover:underline">
                politique de confidentialité
              </Link>{' '}
              pour plus d&apos;informations sur le traitement de vos données.
            </p>

          </div>
        </div>
      </section>
    </div>
  )
}
