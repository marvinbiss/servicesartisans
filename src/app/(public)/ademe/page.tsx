import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ShieldCheck,
  Database,
  RefreshCw,
  FileCheck2,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import { SITE_URL, getAlternates } from '@/lib/seo/config'
import {
  getBreadcrumbSchema,
  getCollectionPageSchema,
  getFAQSchema,
  getOrganizationSchema,
} from '@/lib/seo/jsonld'
import { getRgeNationalStats } from '@/lib/rge/guide-stats'

// ISR — révalidation quotidienne. Contenu éditorial quasi-statique, les
// stats nationales évoluent avec la sync ADEME hebdomadaire.
export const revalidate = 86400

const PAGE_PATH = '/ademe'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`

// FAQ éditoriale 100% unique sur la fiabilité des données et la méthodologie.
// Vise la requête "d'où viennent les données RGE" / "comment vérifier RGE" /
// "source officielle artisan RGE" — requêtes high-trust, low-volume mais E-E-A-T++.
const FAQ: Array<{ question: string; answer: string }> = [
  {
    question: "Qu'est-ce que l'ADEME et quel est son rôle dans la rénovation énergétique ?",
    answer:
      "L'ADEME — Agence de la transition écologique (anciennement Agence de l'Environnement et de la Maîtrise de l'Énergie) — est l'établissement public à caractère industriel et commercial (EPIC) sous la tutelle conjointe des ministères de la Transition écologique et de la Recherche. Créée en 1991, elle pilote la politique nationale de transition énergétique et gère notamment le référentiel officiel des artisans RGE (Reconnu Garant de l'Environnement) consultable sur france-renov.gouv.fr. C'est l'unique source de vérité légale pour vérifier qu'une entreprise du bâtiment est bien qualifiée RGE et donc éligible aux aides publiques (MaPrimeRénov', CEE, TVA 5,5 %, Éco-PTZ).",
  },
  {
    question: "D'où viennent les données d'artisans RGE affichées sur ServicesArtisans ?",
    answer:
      "Nous synchronisons chaque semaine le référentiel officiel France Rénov' publié par l'ADEME en open data sur data.ademe.fr (jeu de données « Annuaire des entreprises RGE »). Ce fichier contient environ 165 000 qualifications actives correspondant à ~60 000 entreprises uniques (une entreprise pouvant cumuler plusieurs qualifications Qualibat, Qualit'EnR, Qualifelec, etc.). Notre pipeline de synchronisation (cron hebdomadaire) importe les nouvelles qualifications, met à jour les dates de validité et retire automatiquement les mentions expirées. Aucune donnée RGE n'est saisie manuellement par nos équipes ou par les artisans eux-mêmes.",
  },
  {
    question: 'À quelle fréquence les données RGE sont-elles mises à jour ?',
    answer:
      "Le référentiel ADEME est mis à jour quotidiennement sur data.ademe.fr au rythme des nouvelles qualifications délivrées et des révocations. ServicesArtisans synchronise ce référentiel chaque semaine (cron automatisé, pas d'intervention humaine) — un délai acceptable compte tenu des volumes (~165 000 lignes, plusieurs centaines de diffs par semaine). Une mention RGE expirée depuis moins de 7 jours peut donc encore apparaître temporairement sur nos pages avant la prochaine synchronisation. Pour une vérification en temps réel à la seconde, consultez directement france-renov.gouv.fr.",
  },
  {
    question: "Comment vérifier qu'un artisan est bien RGE en 2026 ?",
    answer:
      "Trois méthodes complémentaires. 1) Notre outil /verifier-artisan : saisissez le nom, le SIRET ou la ville, nous consultons notre base synchronisée ADEME et retournons le statut exact de la qualification (active, expirée, inexistante). 2) Le site officiel france-renov.gouv.fr : moteur de recherche de l'ADEME, mis à jour en temps réel, source légale en cas de litige. 3) Demander directement à l'entreprise son certificat de qualification signé et daté par l'organisme certificateur (Qualibat, Qualit'EnR, Qualifelec) — tout artisan RGE de bonne foi doit pouvoir le fournir en quelques minutes. Ne vous fiez JAMAIS à un simple logo RGE imprimé sur un devis : c'est la première fraude rencontrée sur le terrain.",
  },
  {
    question: 'Que faire si je détecte une erreur dans les données RGE affichées ?',
    answer:
      "Si vous êtes un particulier : vérifiez d'abord la donnée sur france-renov.gouv.fr (source officielle). Si l'erreur est confirmée, contactez-nous via le formulaire /contact en précisant le nom et le SIRET de l'entreprise concernée — nous forcerons une re-synchronisation manuelle dans les 24 h. Si vous êtes l'entreprise concernée et que votre qualification active n'apparaît pas ou apparaît à tort comme expirée, contactez d'abord votre organisme certificateur (Qualibat, Qualit'EnR, Qualifelec) pour qu'il mette à jour sa remontée vers l'ADEME — c'est la seule voie de correction à la source. Une fois le référentiel ADEME corrigé, la mise à jour sera répercutée chez nous sous 7 jours.",
  },
  {
    question: 'Pourquoi publier cette page de transparence sur les sources ?',
    answer:
      "Parce que la fiabilité des données RGE est une question de confiance publique. Les fraudes « éco-rénovation » ont coûté plusieurs centaines de millions d'euros aux ménages français entre 2018 et 2022, et la rigueur des annuaires en ligne est le premier filtre de sécurité avant signature d'un devis. En publiant notre méthodologie, la source exacte, la fréquence de mise à jour et les limites connues, nous vous donnons les éléments pour vérifier indépendamment nos affirmations — et pour choisir un autre annuaire si le nôtre ne vous paraît pas suffisamment rigoureux. Cette transparence est l'un des piliers de notre engagement éditorial.",
  },
]

export const metadata: Metadata = {
  title: 'Données ADEME — Méthodologie RGE',
  description:
    "Source de nos données RGE : référentiel officiel ADEME / France Rénov', synchronisation hebdomadaire. 165 000 qualifications recensées.",
  alternates: getAlternates('/ademe'),
  openGraph: {
    locale: 'fr_FR',
    title: 'Données ADEME — Sources officielles RGE & méthodologie',
    description:
      "Nos données RGE proviennent directement du référentiel officiel ADEME / France Rénov'. Synchronisation hebdomadaire, vérification gratuite, source open data.",
    url: PAGE_URL,
    siteName: 'ServicesArtisans',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Données ADEME & sources officielles RGE',
    description:
      'Transparence sur la source de nos données : référentiel ADEME officiel, synchronisation hebdomadaire.',
  },
}

export default async function AdemePage() {
  const stats = await getRgeNationalStats().catch(() => ({
    totalActive: 0,
    topCities: [],
  }))

  const totalActive = stats.totalActive || 0
  const hasStats = totalActive > 0

  const breadcrumbItems = [{ label: 'Accueil', href: '/' }, { label: 'Données ADEME' }]

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Données ADEME', url: PAGE_PATH },
  ])

  const collectionSchema = getCollectionPageSchema({
    name: 'Données ADEME — Sources officielles RGE',
    description:
      "Transparence sur la source de nos données d'artisans RGE : référentiel officiel France Rénov' de l'ADEME, synchronisé chaque semaine. 165 000 qualifications recensées en France.",
    url: PAGE_PATH,
    itemCount: totalActive,
  })

  const organizationSchema = getOrganizationSchema()
  const faqSchema = getFAQSchema(FAQ)

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      <JsonLd data={organizationSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <Breadcrumb items={breadcrumbItems} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-charcoal-800 via-charcoal-900 to-emerald-950 text-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 rounded-full px-4 py-1.5 mb-5">
            <Database className="w-4 h-4 text-emerald-300" />
            <span className="text-sm font-medium text-emerald-100">
              Source officielle — data.ademe.fr
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-extrabold leading-tight mb-5">
            Données ADEME & méthodologie RGE
          </h1>
          <p className="text-lg md:text-xl text-charcoal-200 max-w-3xl leading-relaxed">
            {hasStats ? (
              <>
                <strong className="text-white">
                  {totalActive.toLocaleString('fr-FR')} artisans RGE actifs
                </strong>{' '}
                référencés sur ServicesArtisans, synchronisés chaque semaine depuis le référentiel
                officiel France Rénov&apos; publié en open data par l&apos;ADEME.
              </>
            ) : (
              <>
                Toutes les données d&apos;artisans RGE affichées sur notre site proviennent
                directement du référentiel officiel France Rénov&apos; publié en open data par
                l&apos;ADEME, synchronisé chaque semaine.
              </>
            )}{' '}
            Aucune saisie manuelle, aucune donnée auto-déclarée.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-charcoal-900 font-semibold shadow-lg hover:bg-sand-200 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              <BookOpen className="w-5 h-5" aria-hidden="true" />
              Explorer l&apos;annuaire RGE
            </Link>
          </div>
        </div>
      </section>

      {/* Bloc chiffres clés */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">
              {hasStats ? totalActive.toLocaleString('fr-FR') : '~60 000'}
            </div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Entreprises RGE uniques recensées en France dans le référentiel ADEME.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">165 000</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Qualifications RGE actives (une entreprise peut en cumuler plusieurs).
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">7 j</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Fréquence de notre synchronisation avec le référentiel officiel ADEME.
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-extrabold text-emerald-700">4</div>
            <div className="text-sm text-charcoal-600 mt-2 leading-relaxed">
              Organismes certificateurs accrédités COFRAC : Qualibat, Qualit&apos;EnR, Qualifelec,
              Certibat.
            </div>
          </div>
        </div>
      </section>

      {/* Section 1 : Qu'est-ce que l'ADEME */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Qu&apos;est-ce que l&apos;ADEME ?
          </h2>
          <div className="space-y-5 text-charcoal-700 leading-relaxed">
            <p>
              L&apos;<strong>ADEME</strong> — Agence de l&apos;Environnement et de la Maîtrise de
              l&apos;Énergie — est un établissement public à caractère industriel et commercial
              (EPIC) placé sous la tutelle conjointe des ministères de la Transition écologique et
              de la Recherche. Créée en 1991 par la fusion de trois agences préexistantes, elle
              emploie environ 1 100 agents et dispose d&apos;un budget annuel de plusieurs milliards
              d&apos;euros dédiés à la transition énergétique.
            </p>
            <p>
              Son rôle en matière de rénovation énergétique résidentielle est central : elle pilote
              pour le compte de l&apos;État le référentiel officiel des entreprises titulaires
              d&apos;une qualification RGE (Reconnu Garant de l&apos;Environnement), qui conditionne
              l&apos;accès à l&apos;ensemble des aides publiques majeures —{' '}
              <strong>MaPrimeRénov&apos;</strong> (Anah),{' '}
              <strong>Certificats d&apos;Économies d&apos;Énergie (CEE)</strong>,{' '}
              <strong>TVA réduite à 5,5 %</strong>, <strong>Éco-PTZ</strong>. Ce référentiel est
              accessible au grand public sur{' '}
              <a
                href="https://france-renov.gouv.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-semibold"
              >
                france-renov.gouv.fr
              </a>{' '}
              et en open data intégral sur data.ademe.fr.
            </p>
            <p>
              Sans qualification RGE active à la date de signature du devis,{' '}
              <strong>aucune aide publique n&apos;est mobilisable</strong>. C&apos;est cette règle
              simple qui fait de la vérification RGE la première étape incontournable de tout projet
              de rénovation énergétique sérieux en France.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 : Le référentiel France Rénov' */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Le référentiel officiel France Rénov&apos;
          </h2>
          <div className="space-y-5 text-charcoal-700 leading-relaxed">
            <p>
              Le jeu de données « <strong>Annuaire des entreprises RGE</strong> » publié par
              l&apos;ADEME sur{' '}
              <a
                href="https://data.ademe.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-semibold"
              >
                data.ademe.fr
              </a>{' '}
              est la source légale unique pour vérifier qu&apos;une entreprise du bâtiment est bien
              titulaire d&apos;une qualification RGE active. Ce fichier contient environ{' '}
              <strong>165 000 lignes</strong> correspondant à ~60 000 entreprises uniques — une
              entreprise pouvant cumuler plusieurs qualifications (Qualibat + QualiPAC + Qualifelec
              par exemple).
            </p>
            <p>
              Chaque ligne du référentiel comprend : le SIRET de l&apos;entreprise, sa raison
              sociale, son adresse, le code de la qualification (ex. 7143 pour l&apos;ITE, 8611 pour
              les pompes à chaleur), le domaine de travaux couvert, la date de début et de fin de
              validité de la mention, et l&apos;organisme certificateur qui l&apos;a délivrée
              (Qualibat, Qualit&apos;EnR, Qualifelec, Certibat). L&apos;ADEME met ce fichier à jour
              quotidiennement au rythme des qualifications délivrées et révoquées.
            </p>
            <p>
              Le référentiel est publié sous <strong>Licence Ouverte 2.0 (Etalab)</strong>, ce qui
              autorise sa réutilisation libre à des fins commerciales ou non, à condition de
              mentionner la source. C&apos;est ce cadre légal qui permet à ServicesArtisans de
              construire son annuaire RGE en toute transparence juridique.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 : Méthodologie de synchronisation */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Notre méthodologie de synchronisation
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-8">
            Nous avons mis en place un pipeline de synchronisation automatique entre le référentiel
            ADEME et notre base de données, exécuté
            <strong> chaque semaine</strong> par un cron serveur sans aucune intervention manuelle.
            Voici les étapes du process :
          </p>
          <div className="space-y-5">
            {[
              {
                icon: RefreshCw,
                title: '1. Téléchargement du référentiel',
                detail:
                  "Chaque dimanche à 3 h du matin, notre cron télécharge le dernier export CSV du jeu de données « Annuaire des entreprises RGE » depuis l'API officielle data.ademe.fr.",
              },
              {
                icon: CheckCircle2,
                title: '2. Validation et parsing',
                detail:
                  'Chaque ligne est validée schémantiquement (SIRET à 14 chiffres, dates ISO, code qualification présent dans la nomenclature ADEME). Les lignes malformées sont logguées et rejetées.',
              },
              {
                icon: Database,
                title: '3. Matching entreprise',
                detail:
                  "Chaque SIRET est matché à un provider existant dans notre base (ou créé s'il n'existe pas encore). Les qualifications sont stockées dans les colonnes rge_qualifications, rge_valid_until, rge_organismes, rge_source_url.",
              },
              {
                icon: Clock,
                title: '4. Purge des qualifications expirées',
                detail:
                  "Toutes les qualifications dont la date rge_valid_until est dépassée sont automatiquement retirées de l'affichage public. La page passe alors en noindex si le provider n'a plus aucune qualification active.",
              },
              {
                icon: AlertTriangle,
                title: '5. Monitoring et alerting',
                detail:
                  "Un tableau de bord interne suit le volume de diffs hebdomadaires, les erreurs de parsing et la dérive entre notre count et celui publié par l'ADEME. Toute anomalie > 5 % déclenche une alerte.",
              },
            ].map((step, idx) => {
              const Icon = step.icon
              return (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-6 bg-sand-50 rounded-2xl border border-charcoal-100"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-emerald-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-charcoal-900 text-lg mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-charcoal-600 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 4 : Comment vérifier */}
      <section className="bg-emerald-50/40 border-y border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-6">
            Comment vérifier un artisan RGE en 3 minutes
          </h2>
          <p className="text-charcoal-700 leading-relaxed mb-8">
            Avant de signer un devis de rénovation énergétique, prenez systématiquement ces trois
            précautions. Aucune aide publique n&apos;est versée si la qualification RGE n&apos;est
            pas active à la date de signature.
          </p>
          <div className="space-y-5">
            <div className="p-6 bg-white rounded-2xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex-shrink-0">
                  1
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-charcoal-900 text-lg mb-2">
                    Vérifiez via notre outil gratuit
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                    Notre moteur de recherche consulte notre base synchronisée ADEME et retourne en
                    temps réel le statut exact de la qualification : active, expirée, ou
                    inexistante. Saisissez le nom de l&apos;entreprise, son SIRET, ou sa ville.
                  </p>
                  <Link
                    href="/verifier-artisan"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Lancer une vérification gratuite
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex-shrink-0">
                  2
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-charcoal-900 text-lg mb-2">
                    Consultez la source officielle
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed mb-3">
                    En cas de doute ou pour une vérification à la seconde (sans latence de 7 jours),
                    consultez directement le site officiel de l&apos;ADEME — c&apos;est la source
                    légale de référence en cas de litige.
                  </p>
                  <a
                    href="https://france-renov.gouv.fr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    france-renov.gouv.fr
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-emerald-200">
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex-shrink-0">
                  3
                </span>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-charcoal-900 text-lg mb-2">
                    Exigez le certificat de qualification
                  </h3>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    Tout artisan RGE de bonne foi dispose d&apos;un certificat daté et signé par son
                    organisme certificateur (Qualibat, Qualit&apos;EnR, Qualifelec). Demandez-le
                    avant signature du devis — un refus ou un délai suspect doit vous alerter. Ne
                    vous fiez jamais à un simple logo RGE imprimé sur un document commercial :
                    c&apos;est la première fraude rencontrée sur le terrain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 : Liens officiels */}
      <section className="bg-white border-b border-charcoal-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
            Ressources officielles et liens utiles
          </h2>
          <p className="text-charcoal-600 max-w-3xl mb-10 leading-relaxed">
            Les sources publiques que nous consultons et vous recommandons pour aller plus loin sur
            la transition énergétique résidentielle en France.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: 'France Rénov’',
                url: 'https://france-renov.gouv.fr',
                description:
                  "Portail officiel du service public de la rénovation de l'habitat. Annuaire RGE en temps réel, conseillers gratuits, simulateurs d'aides.",
              },
              {
                name: 'data.ademe.fr',
                url: 'https://data.ademe.fr',
                description:
                  "Plateforme open data de l'ADEME. Référentiel RGE, étiquettes énergétiques, bases carbone, données de consommation — toutes en Licence Ouverte.",
              },
              {
                name: 'MaPrimeRénov’ (Anah)',
                url: 'https://www.maprimerenov.gouv.fr',
                description:
                  "Portail officiel de l'Agence Nationale de l'Habitat. Dépôt de dossier, suivi d'avancement, barèmes 2026 et conditions d'éligibilité.",
              },
              {
                name: 'data.gouv.fr',
                url: 'https://www.data.gouv.fr',
                description:
                  "Plateforme ouverte des données publiques françaises. Héberge les jeux de données SIRENE, cadastre, DPE et bien d'autres sources utiles à la rénovation.",
              },
              {
                name: 'Qualibat',
                url: 'https://www.qualibat.com',
                description:
                  'Organisme certificateur principal pour les qualifications RGE isolation, maçonnerie, couverture et enveloppe du bâti.',
              },
              {
                name: 'Qualit’EnR',
                url: 'https://www.qualit-enr.org',
                description:
                  'Organisme certificateur des qualifications RGE énergies renouvelables : QualiPAC, QualiSol, QualiPV, QualiBois.',
              },
            ].map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-400 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-heading font-bold text-charcoal-900 text-lg group-hover:text-emerald-700 transition">
                    {resource.name}
                  </h3>
                  <ExternalLink
                    className="w-4 h-4 text-charcoal-400 group-hover:text-emerald-600 flex-shrink-0 mt-1"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-sm text-charcoal-600 leading-relaxed">{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Attribution légale */}
      <section className="bg-sand-50 border-y border-charcoal-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start gap-3 p-6 bg-white rounded-2xl border border-charcoal-200">
            <FileCheck2
              className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-heading font-bold text-charcoal-900 mb-2">
                Attribution et mention légale
              </h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Données issues du référentiel « Annuaire des entreprises RGE » publié par
                l&apos;ADEME sur data.ademe.fr, mis à disposition sous{' '}
                <a
                  href="https://www.etalab.gouv.fr/licence-ouverte-open-licence"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Licence Ouverte 2.0 (Etalab)
                </a>
                . ServicesArtisans est un réutilisateur indépendant de ces données ; nous ne sommes
                pas affiliés à l&apos;ADEME, à l&apos;Anah ou à aucun organisme certificateur. Pour
                toute correction à la source, contactez directement l&apos;organisme ayant délivré
                la qualification (Qualibat, Qualit&apos;EnR, Qualifelec, Certibat).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="font-heading text-2xl md:text-4xl font-extrabold text-charcoal-900 mb-3">
          Questions fréquentes sur nos données
        </h2>
        <p className="text-charcoal-600 mb-10 leading-relaxed">
          Tout ce que vous devez savoir sur la provenance, la fiabilité et la mise à jour de nos
          données d&apos;artisans RGE.
        </p>
        <div className="space-y-4">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-charcoal-200 hover:border-emerald-300 transition p-6"
            >
              <summary className="font-heading font-bold text-lg text-charcoal-900 cursor-pointer list-none flex items-start justify-between gap-4">
                <span>{item.question}</span>
                <span className="text-emerald-600 text-2xl leading-none flex-shrink-0 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-charcoal-700 mt-4 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-gradient-to-br from-charcoal-800 to-emerald-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-heading text-2xl md:text-4xl font-extrabold mb-4">
            Trouvez un artisan RGE vérifié en 3 minutes
          </h2>
          <p className="text-charcoal-200 max-w-2xl mx-auto mb-8 leading-relaxed">
            Notre annuaire est synchronisé chaque semaine avec le référentiel officiel ADEME. Aucune
            saisie manuelle, aucune donnée auto-déclarée — vous accédez à la source officielle,
            reformatée pour une recherche fluide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/verifier-artisan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-charcoal-900 font-semibold shadow-lg hover:bg-sand-200 transition"
            >
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              Vérifier un artisan
            </Link>
            <Link
              href="/rge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition"
            >
              Explorer l&apos;annuaire RGE
            </Link>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-300/60 text-white font-semibold hover:bg-emerald-600/30 transition"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
