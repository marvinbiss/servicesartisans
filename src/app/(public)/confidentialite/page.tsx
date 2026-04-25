import { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema } from '@/lib/seo/jsonld'
import { SITE_URL } from '@/lib/seo/config'
import { companyIdentity } from '@/lib/config/company-identity'
import { getPageContent } from '@/lib/cms'
import { CmsContent } from '@/components/CmsContent'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description:
    'Politique de confidentialité de ServicesArtisans - Comment nous collectons, utilisons et protégeons vos données personnelles.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/confidentialite`,
  },
  openGraph: {
    title: 'Politique de confidentialité',
    description: 'Comment nous collectons, utilisons et protégeons vos données personnelles.',
    url: `${SITE_URL}/confidentialite`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'ServicesArtisans — Confidentialité',
      },
    ],
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
      <div className="min-h-screen bg-sand-50">
        <JsonLd
          data={getBreadcrumbSchema([
            { name: 'Accueil', url: '/' },
            { name: 'Confidentialité', url: '/confidentialite' },
          ])}
        />
        <section className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Breadcrumb items={[{ label: 'Confidentialité' }]} className="mb-4" />
            <h1 className="font-heading text-3xl font-bold text-charcoal-900">{cmsPage.title}</h1>
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
    <div className="min-h-screen bg-sand-50">
      <JsonLd
        data={getBreadcrumbSchema([
          { name: 'Accueil', url: '/' },
          { name: 'Confidentialité', url: '/confidentialite' },
        ])}
      />
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb items={[{ label: 'Confidentialité' }]} className="mb-4" />
          <h1 className="font-heading text-3xl font-bold text-charcoal-900">
            Politique de confidentialité
          </h1>
          <p className="text-charcoal-600 mt-2">Dernière mise à jour : Avril 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
            <p className="lead">
              Chez ServicesArtisans, nous accordons une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité explique comment nous
              collectons, utilisons et protégeons vos informations. Le responsable de traitement est
              identifié dans nos{' '}
              <a href="/mentions-legales" className="text-primary-500 hover:underline">
                mentions légales
              </a>
              .
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
              <li>
                <strong>L'exécution du contrat :</strong> pour vous fournir nos services
              </li>
              <li>
                <strong>Votre consentement :</strong> pour l'envoi de newsletters
              </li>
              <li>
                <strong>L'intérêt légitime :</strong> pour améliorer nos services
              </li>
              <li>
                <strong>L'obligation légale :</strong> pour respecter la réglementation
              </li>
            </ul>

            <h2>4. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul>
              <li>Les artisans partenaires (uniquement pour répondre à vos demandes)</li>
              <li>Nos sous-traitants techniques (détaillés ci-dessous)</li>
              <li>Les autorités compétentes (en cas d'obligation légale)</li>
            </ul>
            <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>

            <h3>Liste des sous-traitants</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-sand-300 rounded-lg">
                <thead className="bg-sand-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal-700 border-b">
                      Sous-traitant
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal-700 border-b">
                      Finalité
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal-700 border-b">
                      Pays
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-charcoal-700 border-b">
                      Garanties
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Vercel Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Hébergement, CDN, edge computing
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">Data Privacy Framework, SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Supabase Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Base de données, authentification, stockage
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis (AWS eu-west)</td>
                    <td className="px-4 py-3 text-charcoal-600">SOC2 Type II, SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Stripe Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Traitement des paiements (sera utilisé pour les futurs services payants)
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      PCI DSS Level 1, Data Privacy Framework
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Resend Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">Envoi d'emails transactionnels</td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Google LLC</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Analytics (Google Analytics 4, Tag Manager)
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">Data Privacy Framework</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Microsoft Corp.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Analytics comportemental (Clarity)
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">Data Privacy Framework, SCCs</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Anthropic PBC</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Génération assistée des descriptions éditoriales d&apos;artisans (modèles
                      Claude). Aucune donnée personnelle n&apos;est envoyée : uniquement les données
                      publiques d&apos;annuaire (raison sociale, ville, qualifications RGE).
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">SCCs, no-training opt-out</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Yousign SAS</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Signature électronique qualifiée (eIDAS) des conventions de mandat CEE.
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">France (UE)</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      eIDAS QES, ISO 27001, hébergement UE
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Pipedrive OÜ</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      CRM commercial (suivi des demandes de devis et leads simulateur côté équipe
                      ServicesArtisans).
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">Estonie (UE)</td>
                    <td className="px-4 py-3 text-charcoal-600">RGPD natif UE, ISO 27001</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">
                      Functional Software, Inc. (Sentry)
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Monitoring des erreurs applicatives. Aucune PII envoyée — un filtre côté
                      logger masque emails, téléphones, IBAN avant transmission.
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">SCCs, SOC2 Type II</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">Upstash Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Cache et rate-limiting Redis (hashes IP éphémères, pas d&apos;identifiant
                      personnel persistant).
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">UE (eu-west-1)</td>
                    <td className="px-4 py-3 text-charcoal-600">RGPD, ISO 27001, hébergement UE</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-charcoal-900">PostHog Inc.</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      Analytics produit (clics, parcours). IP anonymisée, opt-out via bandeau
                      cookies.
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">États-Unis</td>
                    <td className="px-4 py-3 text-charcoal-600">SCCs, SOC2 Type II</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>5. Durée de conservation</h2>
            <p>
              Vos données sont conservées pour les durées suivantes, conformément aux
              recommandations de la CNIL :
            </p>
            <ul>
              <li>
                <strong>Demandes de devis :</strong> 3 ans à compter de la demande
              </li>
              <li>
                <strong>Avis et témoignages :</strong> 3 ans à compter de leur publication
              </li>
              <li>
                <strong>Données de compte :</strong> 3 ans après votre dernière activité
              </li>
              <li>
                <strong>Comptes inactifs :</strong> supprimés après 3 ans d&apos;inactivité
              </li>
              <li>
                <strong>Données analytiques anonymisées :</strong> 13 mois maximum (standard CNIL)
              </li>
              <li>
                <strong>Logs d&apos;audit :</strong> 1 an
              </li>
              <li>
                <strong>Données de transaction :</strong> 5 ans (obligations comptables)
              </li>
            </ul>
            <p>
              À l&apos;expiration de ces durées, vos données sont supprimées ou anonymisées de
              manière irréversible.
            </p>

            <h2>6. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li>
                <strong>Droit d'accès :</strong> obtenir une copie de vos données (
                <a href="/droit-acces" className="text-primary-500 hover:underline">
                  exercer ce droit
                </a>
                )
              </li>
              <li>
                <strong>Droit de rectification :</strong> corriger vos données inexactes (
                <a href="/droit-acces" className="text-primary-500 hover:underline">
                  exercer ce droit
                </a>
                )
              </li>
              <li>
                <strong>Droit à l'effacement :</strong> demander la suppression de vos données
              </li>
              <li>
                <strong>Droit à la portabilité :</strong> récupérer vos données dans un format
                standard
              </li>
              <li>
                <strong>Droit d'opposition :</strong> vous opposer à certains traitements (
                <a href="/droit-opposition" className="text-primary-500 hover:underline">
                  exercer votre droit d'opposition
                </a>
                )
              </li>
              <li>
                <strong>Droit à la limitation :</strong> limiter l'utilisation de vos données
              </li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à :{' '}
              <a
                href={`mailto:${companyIdentity.dpoEmail}`}
                className="text-primary-500 hover:underline"
              >
                <strong>{companyIdentity.dpoEmail}</strong>
              </a>
            </p>

            <h2>7. Cookies</h2>
            <p>Nous utilisons différents types de cookies :</p>
            <ul>
              <li>
                <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site
              </li>
              <li>
                <strong>Cookies analytiques :</strong> pour comprendre l'utilisation du site
              </li>
              <li>
                <strong>Cookies marketing :</strong> pour personnaliser les contenus (le cas
                échéant)
              </li>
            </ul>
            <p>
              Vous pouvez gérer vos préférences de cookies via le bandeau de consentement affiché
              lors de votre première visite.
            </p>

            <h2>8. Sécurité</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données contre tout accès non autorisé, modification, divulgation ou
              destruction. Nos serveurs sont sécurisés et les données sensibles sont chiffrées.
            </p>
            <p>
              En cas de violation de données, nous appliquons une procédure stricte de notification
              conformément aux articles 33 et 34 du RGPD (
              <a href="/violation-donnees" className="text-primary-500 hover:underline">
                notre procédure en cas de violation de données
              </a>
              ).
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
                <strong>Clauses Contractuelles Types (SCCs) :</strong> L'ensemble de nos
                sous-traitants (Vercel, Supabase, Stripe, Resend, Google, Microsoft) ont signé les
                Clauses Contractuelles Types adoptées par la Commission Européenne (décision
                2021/914), garantissant un niveau de protection équivalent au RGPD.
              </li>
              <li>
                <strong>Localisation des données Supabase :</strong> Notre base de données est
                hébergée sur AWS eu-west (Irlande), au sein de l'Union Européenne. Seuls les
                services d'administration de Supabase Inc. sont basés aux États-Unis.
              </li>
            </ul>
            <h3>Détail des données transférées</h3>
            <ul>
              <li>
                <strong>Vercel :</strong> Pages web, assets statiques, logs de requêtes (adresse IP,
                user-agent)
              </li>
              <li>
                <strong>Supabase :</strong> Données de compte, profils, demandes de devis, avis,
                messagerie
              </li>
              <li>
                <strong>Stripe :</strong> Données de paiement (nom, email, informations bancaires
                tokenisées)
              </li>
              <li>
                <strong>Resend :</strong> Adresse email, nom, contenu des emails transactionnels
              </li>
              <li>
                <strong>Google Analytics / Tag Manager :</strong> Données de navigation anonymisées
                (pages vues, durée, appareil)
              </li>
              <li>
                <strong>Microsoft Clarity :</strong> Données comportementales anonymisées (clics,
                scrolls, sessions)
              </li>
            </ul>

            <h2>10. Données issues de sources publiques — Prospection d&apos;artisans RGE</h2>
            <p>
              Dans le cadre du développement de notre plateforme de mise en relation et de la
              préparation de notre activité de mandataire CEE, ServicesArtisans contacte les
              artisans titulaires d&apos;une qualification RGE (Reconnu Garant de
              l&apos;Environnement) afin de leur proposer une inscription gratuite et la réception
              de demandes de devis qualifiées.
            </p>
            <p>
              <strong>Source des données.</strong> Les coordonnées utilisées proviennent
              exclusivement du jeu de données public{' '}
              <em>« Liste des entreprises titulaires d&apos;un signe de qualité RGE »</em>
              publié par l&apos;ADEME (Agence de l&apos;Environnement et de la Maîtrise de
              l&apos;Énergie) sur la plateforme gouvernementale data.gouv.fr sous Licence Ouverte
              Etalab 2.0. Ce jeu de données est diffusé en open data dans un objectif de
              transparence envers les particuliers souhaitant bénéficier des aides publiques à la
              rénovation énergétique (MaPrimeRénov&apos;, primes CEE, Coup de pouce). Il est
              accessible à l&apos;adresse suivante :{' '}
              <a
                href="https://www.data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                data.gouv.fr/fr/datasets/liste-des-entreprises-rge-2
              </a>
              .
            </p>
            <p>
              <strong>Base légale.</strong> Ce traitement repose sur l&apos;intérêt légitime de
              ServicesArtisans à constituer une base d&apos;artisans qualifiés pour opérer son
              activité de mise en relation (article 6.1.f du RGPD). Un test de mise en balance
              formalisé a été conduit : compte tenu du caractère exclusivement professionnel des
              données, de leur publication préalable par une autorité publique à des fins de mise en
              relation, de l&apos;attente raisonnable des personnes concernées et des garanties
              mises en place (opposition en un clic, information complète, absence de profilage, pas
              de cession à des tiers), l&apos;intérêt légitime prévaut sur les droits et libertés
              des personnes concernées. L&apos;analyse d&apos;impact complète est tenue à la
              disposition de la CNIL sur demande.
            </p>
            <p>
              <strong>Régime applicable à la prospection électronique B2B.</strong> Conformément à
              l&apos;article L.34-5 du Code des Postes et Communications Électroniques et à la
              doctrine de la CNIL, la prospection par voie électronique vers une adresse email
              professionnelle nominative, pour une offre en rapport avec la profession sollicitée,
              est autorisée sous régime d&apos;opposition (opt-out). Chaque message de prospection
              contient :
            </p>
            <ul>
              <li>l&apos;identité complète de l&apos;expéditeur,</li>
              <li>la finalité du traitement et sa base légale,</li>
              <li>la source précise des données (ADEME Open Data),</li>
              <li>un lien de désinscription en un clic, actif, gratuit et sans contrepartie,</li>
              <li>les coordonnées du DPO et un lien vers la présente politique.</li>
            </ul>
            <p>
              <strong>Durée de conservation.</strong> Les coordonnées sont conservées pendant 3 ans
              à compter du dernier contact positif (clic, réponse, inscription), conformément à la
              recommandation de la CNIL sur la prospection commerciale. Les demandes
              d&apos;opposition sont quant à elles conservées sans limitation de durée afin de
              garantir que la personne ne sera jamais à nouveau sollicitée.
            </p>
            <p>
              <strong>Destinataires.</strong> Vos coordonnées sont traitées par ServicesArtisans et
              ses sous-traitants techniques Resend Inc. (envoi d&apos;emails), Supabase Inc. (base
              de données hébergée en Irlande) et Vercel Inc. (hébergement du site). Elles ne sont ni
              cédées, ni louées, ni vendues à des tiers.
            </p>
            <p>
              <strong>Exercice de vos droits.</strong> Si vous êtes un artisan figurant dans la base
              ADEME et que vous ne souhaitez pas être contacté par ServicesArtisans, ou si vous
              souhaitez exercer l&apos;un des droits prévus par le RGPD (accès, rectification,
              effacement, opposition, limitation), plusieurs modalités vous sont offertes :
            </p>
            <ul>
              <li>
                <strong>Désinscription en un clic :</strong> cliquez sur le lien de désinscription
                présent au bas de chaque email de prospection — effet immédiat, aucun compte ou mot
                de passe requis.
              </li>
              <li>
                <strong>Email :</strong>{' '}
                <a
                  href={`mailto:${companyIdentity.dpoEmail}`}
                  className="text-primary-500 hover:underline"
                >
                  <strong>{companyIdentity.dpoEmail}</strong>
                </a>{' '}
                — réponse sous un délai maximal d&apos;un mois (article 12.3 du RGPD).
              </li>
              <li>
                <strong>Formulaires dédiés :</strong>{' '}
                <a href="/droit-opposition" className="text-primary-500 hover:underline">
                  droit d&apos;opposition
                </a>{' '}
                et{' '}
                <a href="/droit-acces" className="text-primary-500 hover:underline">
                  droit d&apos;accès
                </a>
                .
              </li>
            </ul>
            <p>
              Vous disposez également, à tout moment, du droit d&apos;introduire une réclamation
              auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                www.cnil.fr
              </a>
              ).
            </p>

            <h2>11. Mineurs</h2>
            <p>
              ServicesArtisans est destiné aux personnes de 18 ans et plus. Nous ne collectons pas
              sciemment les données de mineurs. Si nous apprenons que des données personnelles d'un
              mineur ont été collectées sans le consentement d'un parent ou tuteur, nous prendrons
              les mesures nécessaires pour les supprimer dans les meilleurs délais.
            </p>

            <h2>12. Modifications</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. La date de
              dernière mise à jour est indiquée en haut de cette page. Nous vous informerons de
              toute modification substantielle par email ou via le site.
            </p>

            <h2>13. Contact</h2>
            <p>Pour toute question concernant cette politique ou vos données personnelles :</p>
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
              <li>
                <strong>Courrier :</strong> Coordonnées du DPO disponibles sur demande via le
                formulaire de contact.
              </li>
            </ul>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
              >
                www.cnil.fr
              </a>
              ).
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
