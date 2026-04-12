import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Droit d'opposition - ServicesArtisans",
  description:
    "Exercez votre droit d'opposition RGPD (Art. 21) ou votre droit à l'effacement (Art. 17). Demandez la suppression de votre fiche artisan sur ServicesArtisans.",
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/droit-opposition`,
  },
  openGraph: {
    title: "Droit d'opposition - ServicesArtisans",
    description:
      "Exercez votre droit d'opposition RGPD. Demandez la suppression de votre fiche artisan.",
    url: `${SITE_URL}/droit-opposition`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "ServicesArtisans — Droit d'opposition",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Droit d'opposition - ServicesArtisans",
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default function DroitOppositionPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: "Droit d'opposition", url: '/droit-opposition' },
  ])

  return (
    <div className="min-h-screen bg-sand-50">
      <JsonLd data={breadcrumbSchema} />

      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: "Droit d'opposition" }]} className="mb-4" />
          <h1 className="font-heading text-3xl font-bold text-charcoal-900">
            Droit d&apos;opposition et suppression de fiche
          </h1>
          <p className="text-charcoal-600 mt-2">Dernière mise à jour : Avril 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
            <p className="lead">
              Chez {companyIdentity.name}, nous respectons pleinement les droits des professionnels
              dont les données apparaissent sur notre plateforme. Cette page vous explique comment
              exercer votre droit d&apos;opposition ou demander la suppression de votre fiche.
            </p>

            <h2>1. Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
              notamment :
            </p>
            <ul>
              <li>
                <strong>Droit d&apos;opposition (Art. 21 RGPD) :</strong> vous pouvez vous opposer à
                tout moment au traitement de vos données personnelles lorsque ce traitement est
                fondé sur l&apos;intérêt légitime.
              </li>
              <li>
                <strong>Droit à l&apos;effacement (Art. 17 RGPD) :</strong> vous pouvez demander la
                suppression de vos données personnelles.
              </li>
            </ul>
            <p>
              <strong>Qui peut en bénéficier :</strong> tout professionnel (artisan, entreprise)
              dont les données apparaissent sur la plateforme {companyIdentity.name}.
            </p>
            <p>
              <strong>Base légale du traitement :</strong> le référencement des fiches artisans
              repose sur notre intérêt légitime (Art. 6.1.f du RGPD). Les données proviennent de
              sources publiques, notamment les registres professionnels officiels (répertoire
              SIREN/SIRET) et la base ADEME des entreprises RGE (open data). Vous pouvez vous
              opposer à ce traitement à tout moment.
            </p>

            <h2>2. Comment exercer votre droit</h2>
            <p>Trois options s&apos;offrent à vous :</p>

            <h3>Option 1 — Depuis votre fiche artisan</h3>
            <p>
              Rendez-vous sur votre fiche artisan sur {companyIdentity.name} et cliquez sur le
              bouton <strong>«&nbsp;Demander la suppression de cette fiche&nbsp;»</strong>. Un
              formulaire vous permettra de soumettre votre demande directement.
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
              en précisant :
            </p>
            <ul>
              <li>Votre nom ou la raison sociale de votre entreprise</li>
              <li>Votre numéro SIRET</li>
              <li>L&apos;URL de la fiche concernée (si vous la connaissez)</li>
              <li>Votre demande (opposition au traitement et/ou suppression de la fiche)</li>
            </ul>

            <h3>Option 3 — Par courrier postal</h3>
            <p>Adressez votre demande par courrier à :</p>
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

            <h2>3. Délais de traitement</h2>
            <ul>
              <li>
                <strong>Accusé de réception :</strong> sous 48 heures ouvrées à compter de la
                réception de votre demande.
              </li>
              <li>
                <strong>Traitement :</strong> sous 30 jours maximum, conformément à l&apos;article
                12.3 du RGPD.
              </li>
              <li>
                <strong>Désindexation :</strong> dès réception de votre demande, nous ajoutons une
                directive <code>noindex</code> sur votre fiche pour demander aux moteurs de
                recherche de la retirer de leurs résultats.
              </li>
            </ul>

            <h2>4. Ce qui se passe après votre demande</h2>
            <ol>
              <li>
                <strong>Désindexation immédiate :</strong> votre fiche est marquée{' '}
                <code>noindex</code> dès réception de la demande. Les moteurs de recherche cessent
                de l&apos;afficher dans leurs résultats.
              </li>
              <li>
                <strong>Désactivation de la fiche :</strong> après validation de votre identité, la
                fiche est désactivée et n&apos;apparaît plus sur le site.
              </li>
              <li>
                <strong>Conservation légale :</strong> conformément à nos obligations légales, les
                données sont conservées pendant 1 an après la suppression de la fiche à des fins de
                preuve, puis définitivement supprimées. La durée générale de conservation des
                données actives est de 3 ans (cf. notre{' '}
                <Link href="/confidentialite" className="text-primary-500 hover:underline">
                  politique de confidentialité
                </Link>
                ).
              </li>
            </ol>

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

            <h2>6. Contact DPO</h2>
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
