import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de ServicesArtisans - Comment nous collectons, utilisons et protégeons vos données personnelles.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/confidentialite`,
  },
  openGraph: {
    title: 'Politique de confidentialité',
    description: 'Comment nous collectons, utilisons et protégeons vos données personnelles.',
    url: `${SITE_URL}/confidentialite`,
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'ServicesArtisans — Confidentialité' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Politique de confidentialité',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

export default async function ConfidentialitePage() {
  const cmsPage = await getPageContent('confidentialite', 'static')

  if (cmsPage?.content_html) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JsonLd data={getBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Confidentialité', url: '/confidentialite' },
        ])} />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Confidentialité' }]} className="mb-4" />
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              {cmsPage.title}
            </h1>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={getBreadcrumbSchema([
        { name: 'Accueil', url: '/' },
        { name: 'Confidentialité', url: '/confidentialite' },
      ])} />
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: 'Confidentialité' }]} className="mb-4" />
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Politique de confidentialité
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

            <p className="lead">
              Chez ServicesArtisans, nous accordons une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité explique comment nous
              collectons, utilisons et protégeons vos informations.
            </p>

            <h2>1. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <h3>Données d'identification</h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse postale</li>
            </ul>

            <h3>Données de navigation</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li>
              <li>Durée de visite</li>
            </ul>

            <h3>Données de transaction</h3>
            <ul>
              <li>Historique des demandes de devis</li>
              <li>Échanges avec les artisans</li>
              <li>Avis et évaluations</li>
            </ul>

            <h2>2. Finalités du traitement</h2>
            <p>Vos données sont collectées pour :</p>
            <ul>
              <li>Vous mettre en relation avec des artisans qualifiés</li>
              <li>Gérer votre compte utilisateur</li>
              <li>Vous envoyer des devis et communications relatives à vos demandes</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Réaliser des statistiques anonymisées</li>
              <li>Vous envoyer notre newsletter (avec votre consentement)</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h2>3. Base légale</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li><strong>L'exécution du contrat :</strong> pour vous fournir nos services</li>
              <li><strong>Votre consentement :</strong> pour l'envoi de newsletters</li>
              <li><strong>L'intérêt légitime :</strong> pour améliorer nos services</li>
              <li><strong>L'obligation légale :</strong> pour respecter la réglementation</li>
            </ul>

            <h2>4. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul>
              <li>Les artisans partenaires (uniquement pour répondre à vos demandes)</li>
              <li>Nos sous-traitants techniques (détaillés ci-dessous)</li>
              <li>Les autorités compétentes (en cas d'obligation légale)</li>
            </ul>
            <p>
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>

            <h3>Liste des sous-traitants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Sous-traitant</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Finalité</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Pays</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Garanties</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Vercel Inc.</td>
                    <td className="px-4 py-3 text-gray-600">Hébergement, CDN, edge computing</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis</td>
                    <td className="px-4 py-3 text-gray-600">Data Privacy Framework, SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Supabase Inc.</td>
                    <td className="px-4 py-3 text-gray-600">Base de données, authentification, stockage</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis (AWS eu-west)</td>
                    <td className="px-4 py-3 text-gray-600">SOC2 Type II, SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Stripe Inc.</td>
                    <td className="px-4 py-3 text-gray-600">Traitement des paiements</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis</td>
                    <td className="px-4 py-3 text-gray-600">PCI DSS Level 1, Data Privacy Framework</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Resend Inc.</td>
                    <td className="px-4 py-3 text-gray-600">Envoi d'emails transactionnels</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis</td>
                    <td className="px-4 py-3 text-gray-600">SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Google LLC</td>
                    <td className="px-4 py-3 text-gray-600">Analytics (Google Analytics 4, Tag Manager)</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis</td>
                    <td className="px-4 py-3 text-gray-600">Data Privacy Framework</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Microsoft Corp.</td>
                    <td className="px-4 py-3 text-gray-600">Analytics comportemental (Clarity)</td>
                    <td className="px-4 py-3 text-gray-600">États-Unis</td>
                    <td className="px-4 py-3 text-gray-600">Data Privacy Framework, SCCs</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>5. Durée de conservation</h2>
            <p>Vos données sont conservées :</p>
            <ul>
              <li><strong>Données de compte :</strong> 3 ans après votre dernière activité</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum</li>
              <li><strong>Données de transaction :</strong> 5 ans (obligations comptables)</li>
            </ul>

            <h2>6. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données (<a href="/droit-acces" className="text-blue-600 hover:underline">exercer ce droit</a>)</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes (<a href="/droit-acces" className="text-blue-600 hover:underline">exercer ce droit</a>)</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format standard</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements (<a href="/droit-opposition" className="text-blue-600 hover:underline">en savoir plus</a>)</li>
              <li><strong>Droit à la limitation :</strong> limiter l'utilisation de vos données</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : <a href="mailto:dpo@servicesartisans.fr" className="text-blue-600 hover:underline"><strong>dpo@servicesartisans.fr</strong></a>
            </p>

            <h2>7. Cookies</h2>
            <p>Nous utilisons différents types de cookies :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies analytiques :</strong> pour comprendre l'utilisation du site</li>
              <li><strong>Cookies marketing :</strong> pour personnaliser les publicités</li>
            </ul>
            <p>
              Vous pouvez gérer vos préférences de cookies via le bandeau de consentement
              affiché lors de votre première visite.
            </p>

            <h2>8. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
              pour protéger vos données contre tout accès non autorisé, modification, divulgation
              ou destruction. Nos serveurs sont sécurisés et les données sensibles sont chiffrées.
            </p>
            <p>
              En cas de violation de données, nous appliquons une procédure stricte de notification
              conformément aux articles 33 et 34 du RGPD (<a href="/violation-donnees" className="text-blue-600 hover:underline">en savoir plus</a>).
            </p>

            <h2>9. Transferts internationaux</h2>
            <p>
              Certains de nos sous-traitants sont établis aux États-Unis, ce qui implique un
              transfert de données personnelles hors de l'Union Européenne. Ces transferts sont
              encadrés par les mécanismes suivants :
            </p>
            <ul>
              <li>
                <strong>EU-US Data Privacy Framework (DPF) :</strong> Vercel, Stripe, Google et
                Microsoft sont certifiés au titre du cadre de protection des données UE-États-Unis,
                reconnu adéquat par la Commission Européenne (décision du 10 juillet 2023).
              </li>
              <li>
                <strong>Clauses Contractuelles Types (SCCs) :</strong> L'ensemble de nos sous-traitants
                (Vercel, Supabase, Stripe, Resend, Google, Microsoft) ont signé les Clauses
                Contractuelles Types adoptées par la Commission Européenne (décision 2021/914),
                garantissant un niveau de protection équivalent au RGPD.
              </li>
              <li>
                <strong>Localisation des données Supabase :</strong> Notre base de données est
                hébergée sur AWS eu-west (Irlande), au sein de l'Union Européenne. Seuls les
                services d'administration de Supabase Inc. sont basés aux États-Unis.
              </li>
            </ul>
            <h3>Détail des données transférées</h3>
            <ul>
              <li><strong>Vercel :</strong> Pages web, assets statiques, logs de requêtes (adresse IP, user-agent)</li>
              <li><strong>Supabase :</strong> Données de compte, profils, demandes de devis, avis, messagerie</li>
              <li><strong>Stripe :</strong> Données de paiement (nom, email, informations bancaires tokenisées)</li>
              <li><strong>Resend :</strong> Adresse email, nom, contenu des emails transactionnels</li>
              <li><strong>Google Analytics / Tag Manager :</strong> Données de navigation anonymisées (pages vues, durée, appareil)</li>
              <li><strong>Microsoft Clarity :</strong> Données comportementales anonymisées (clics, scrolls, sessions)</li>
            </ul>

            <h2>10. Mineurs</h2>
            <p>
              ServicesArtisans est destiné aux personnes de 18 ans et plus. Nous ne collectons
              pas sciemment les données de mineurs. Si nous apprenons que des données personnelles
              d'un mineur ont été collectées sans le consentement d'un parent ou tuteur, nous
              prendrons les mesures nécessaires pour les supprimer dans les meilleurs délais.
            </p>

            <h2>11. Modifications</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment.
              La date de dernière mise à jour est indiquée en haut de cette page.
              Nous vous informerons de toute modification substantielle par email ou via le site.
            </p>

            <h2>12. Contact</h2>
            <p>
              Pour toute question concernant cette politique ou vos données personnelles :
            </p>
            <ul>
              <li><strong>Email :</strong> <a href="mailto:dpo@servicesartisans.fr" className="text-blue-600 hover:underline">dpo@servicesartisans.fr</a></li>
              <li><strong>Courrier :</strong> Coordonnées du DPO disponibles sur demande via le formulaire de contact.</li>
            </ul>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a>).
            </p>

          </div>
        </div>
      </section>
    </div>
  )
}
