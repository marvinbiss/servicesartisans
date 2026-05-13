import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'
import GdprAccessForm from '@/components/gdpr/GdprAccessForm'
import { PageHeroH1 } from '@/components/ui/PageHeroH1'

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Droit d'accès et de rectification - ServicesArtisans",
  description:
    "Exercez votre droit d'accès (Art. 15 RGPD) ou de rectification (Art. 16 RGPD). Demandez une copie de vos données ou la correction d'informations inexactes.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/droit-acces`,
  },
  openGraph: {
    title: "Droit d'accès et de rectification - ServicesArtisans",
    description: "Exercez votre droit d'accès ou de rectification RGPD sur ServicesArtisans.",
    url: `${SITE_URL}/droit-acces`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "ServicesArtisans — Droit d'accès",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Droit d'accès et de rectification - ServicesArtisans",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function DroitAccesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: "Droit d'accès et de rectification", url: '/droit-acces' },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Droit d'accès et de rectification" }]} className="mb-4" />
          <PageHeroH1 size="article">Droit d&apos;accès et de rectification</PageHeroH1>
          <p className="text-charcoal-600 mt-2">Dernière mise à jour : Avril 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
            <p className="lead">
              Chez {companyIdentity.name}, nous respectons pleinement vos droits en matière de
              protection des données personnelles. Cette page vous explique comment exercer votre
              droit d&apos;accès et de rectification.
            </p>

            <h2>1. Vos droits</h2>
            <ul>
              <li>
                <strong>Droit d&apos;accès (Art. 15 RGPD) :</strong> Vous avez le droit de savoir si
                nous traitons vos données personnelles et d&apos;en obtenir une copie.
              </li>
              <li>
                <strong>Droit de rectification (Art. 16 RGPD) :</strong> Vous pouvez demander la
                correction de données inexactes ou incomplètes vous concernant.
              </li>
            </ul>

            <h2>2. Qui peut en bénéficier</h2>
            <ul>
              <li>Tout utilisateur inscrit (client ou artisan)</li>
              <li>
                Tout professionnel dont les données apparaissent sur la plateforme (même sans
                compte)
              </li>
            </ul>

            <h2>3. Comment exercer votre droit</h2>
            <p>Trois options s&apos;offrent à vous :</p>

            <h3>Option 1 — Formulaire ci-dessous</h3>
            <p>
              Utilisez le formulaire de demande en bas de cette page pour soumettre votre demande
              directement.
            </p>

            <h3>Option 2 — Par email</h3>
            <p>
              Envoyez un email à{' '}
              <a
                href={`mailto:${companyIdentity.dpoEmail}`}
                className="text-primary-500 hover:underline"
              >
                <strong>{companyIdentity.dpoEmail}</strong>
              </a>{' '}
              en précisant votre demande.
            </p>

            <h3>Option 3 — Par courrier postal</h3>
            {companyIdentity.address ? (
              <p>
                <strong>{companyIdentity.name}</strong>
                <br />
                Service DPO
                <br />
                {companyIdentity.address}
              </p>
            ) : (
              <p>
                <strong>{companyIdentity.name}</strong>
                <br />
                Service DPO
                <br />
                Adresse disponible sur demande via{' '}
                <a
                  href={`mailto:${companyIdentity.dpoEmail}`}
                  className="text-primary-500 hover:underline"
                >
                  {companyIdentity.dpoEmail}
                </a>
              </p>
            )}

            <h2>4. Délais de traitement</h2>
            <ul>
              <li>
                <strong>Accusé de réception :</strong> sous 48 heures ouvrées à compter de la
                réception de votre demande.
              </li>
              <li>
                <strong>Réponse complète :</strong> sous 30 jours maximum, conformément à
                l&apos;article 12.3 du RGPD.
              </li>
              <li>
                <strong>Prolongation :</strong> en cas de demande complexe, ce délai peut être
                prolongé de 2 mois supplémentaires. Vous en serez informé(e) dans le délai initial
                de 30 jours.
              </li>
            </ul>

            <h2>5. Recours</h2>
            <p>
              Si vous estimez que votre demande n&apos;a pas été traitée de manière satisfaisante,
              vous pouvez introduire une réclamation auprès de la Commission Nationale de
              l&apos;Informatique et des Libertés (CNIL) :
            </p>
            <ul>
              <li>
                <strong>En ligne :</strong>{' '}
                <a
                  href="https://www.cnil.fr/fr/plaintes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  www.cnil.fr/fr/plaintes
                </a>
              </li>
              <li>
                <strong>Par courrier :</strong> CNIL — 3 Place de Fontenoy, TSA 80715, 75334 Paris
                Cedex 07
              </li>
            </ul>

            <h2>6. Formulaire de demande</h2>
          </div>

          {/* Interactive form (client component) */}
          <div className="bg-white rounded-xl shadow-sm p-8 mt-6">
            <GdprAccessForm />
          </div>

          {/* Contact DPO */}
          <div className="bg-white rounded-xl shadow-sm p-8 mt-6 prose prose-gray max-w-none">
            <h2>7. Contact DPO</h2>
            <p>Pour toute question relative à la protection de vos données personnelles :</p>
            <ul>
              <li>
                <strong>Email :</strong>{' '}
                <a
                  href={`mailto:${companyIdentity.dpoEmail}`}
                  className="text-primary-500 hover:underline"
                >
                  {companyIdentity.dpoEmail}
                </a>
              </li>
              {companyIdentity.address && (
                <li>
                  <strong>Courrier :</strong> {companyIdentity.name} — Service DPO —{' '}
                  {companyIdentity.address}
                </li>
              )}
            </ul>
            <p>
              Consultez également notre{' '}
              <Link href="/confidentialite" className="text-primary-500 hover:underline">
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
