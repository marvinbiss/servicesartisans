import type { Metadata } from 'next'
import Link from 'next/link'
import { Wind, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema, getHowToSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'climatisation-reversible-prix-pose'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Jean-Pierre Duval'

export const revalidate = 86400

const TITLE = 'Climatisation réversible 2026 : prix'
const AUTHOR_SLUG = 'jean-pierre-duval'
const DESCRIPTION =
  'Climatisation réversible 2026 : prix 1 800-8 500 € TTC mono/multi-split, COP 3,5-4,5, aides CEE 100-300 €, pose RGE QualiPAC obligatoire pour prime.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(`/guides/${SLUG}`),
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'article',
    siteName: SITE_NAME,
    publishedTime: PUBLISHED,
    modifiedTime: MODIFIED,
    authors: [`${SITE_URL}/equipe/${AUTHOR_SLUG}`],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const tldr = [
  'Clim réversible = PAC air/air : refroidit l’été, chauffe l’hiver avec COP 3,5-4,5 (3,5 kWh chaleur pour 1 kWh électrique).',
  'Prix 2026 TTC posée : monosplit 1 800-3 500 €, bisplit 3 000-5 000 €, multisplit 3+ unités 4 500-8 500 €.',
  'Aides : CEE 100-300 € via Coup de pouce, PAS éligible MaPrimeRénov’ (réservée air/eau + géothermie). TVA 10 % résidence principale >2 ans.',
  'Installation obligatoire par frigoriste attesté F-gaz (art. R543-76 Code env.) + QualiPAC pour prime CEE.',
  'Entretien biennal obligatoire >4 kW (décret 2020-912) : 100-180 € HT/an chez Qualibat ou fabricant.',
]

const howToSteps = [
  {
    name: 'Dimensionner la puissance thermique',
    text: 'Calcul bilan thermique pièce : ~100 W/m² isolation correcte, 120 W/m² BBC, 60-80 W/m² RT2012. Salon 30 m² = 2,5-3 kW minimum. Surdimensionnement = cycles courts + consommation. Sous-dimensionnement = compresseur tourne en continu. Faire faire bilan par frigoriste avant devis.',
  },
  {
    name: 'Choisir type mono/bi/multi-split',
    text: 'Monosplit = 1 unité int. + 1 unité ext. — 1 pièce principale (salon), 1 800-3 500 € TTC. Bisplit = 2 int. + 1 ext. — salon + chambre, 3 000-5 000 €. Multisplit = 3 à 5 int. + 1 ext. — multi-pièces, 4 500-8 500 €. Gainable centralisé (dans faux-plafond) = 6 000-12 000 € mais discrétion esthétique max.',
  },
  {
    name: 'Vérifier RGE QualiPAC + attestation F-gaz',
    text: 'Prime CEE Coup de pouce = obligatoirement QualiPAC (pompe à chaleur, pas seulement climaticien). Installation manipulation fluide frigorigène R32 = attestation F-gaz catégorie I ou II obligatoire (arrêté 30 juin 2008). Vérifier sur qualit-enr.org + demander copie attestation F-gaz avant signature devis.',
  },
  {
    name: 'Demander 3 devis détaillés',
    text: 'Devis doit préciser : marque + modèle + puissance kW froid ET chaud, COP/SCOP nominal, puissance absorbée, liaisons frigorifiques (longueur, unités), fluide (R32 actuel, R410A obsolète), pose support ext. (plots anti-vibration), mise en service + attestation fluide, contrat entretien inclus/optionnel. Écart >20 % entre devis = alerte.',
  },
  {
    name: 'Déclaration urbanisme si nécessaire',
    text: 'Unité extérieure visible depuis rue = déclaration préalable mairie (art. R421-17 Code urba.) si modifie l’aspect extérieur. Copropriétés = autorisation AG vote majorité + respect règlement (souvent interdit façade rue). Ignorer = procédure retrait + amende 6 000 €/m² (art. L480-4 Code urba.). Penser rails + plots caoutchouc anti-vibration pour voisinage.',
  },
  {
    name: 'Planifier entretien biennal',
    text: 'Obligation décret 2020-912 : entretien tous les 2 ans pour équipements 4-70 kW froid (quasi-tous les résidentiels). Contrôles : étanchéité circuit, filtres, pression, rendement, attestation remise au client. Coût 100-180 € HT. Défaut entretien = responsabilité locataire ou propriétaire-occupant, assurance peut refuser sinistre si causé par défaut maintenance.',
  },
]

const faqs = [
  {
    question: 'Quel prix pour une climatisation réversible en 2026 ?',
    answer:
      'Prix 2026 TTC posée : (1) Monosplit 2,5 kW (studio, 25 m²) : 1 800-2 500 € — salon unique ; (2) Monosplit 3,5-5 kW (salon 30-50 m²) : 2 500-3 500 € ; (3) Bisplit 2x2,5 kW : 3 000-4 500 € — salon + chambre ; (4) Multisplit 3 unités (salon + 2 chambres) : 4 500-6 500 € ; (5) Multisplit 4-5 unités T4/T5 complet : 6 500-8 500 € ; (6) Gainable centralisé T4 : 8 000-12 000 € (gaines + grilles + diffusion homogène). Tarif dépend fortement du constructeur : entrée de gamme asiatique (Hisense, TCL) = -30 % vs haut de gamme européen (Daikin Emura, Mitsubishi Kirigamine). Frais cachés fréquents : support mural ou plots ext. 80-200 €, trémies 50-150 €, disjoncteur dédié 80-150 €, mise en service + attestation fluide 150-250 €.',
  },
  {
    question: 'Clim réversible ou pompe à chaleur air/eau : que choisir ?',
    answer:
      'Clim réversible (air/air) = investissement plus faible (2 000-8 000 €) + climatisation été + chauffage d’appoint hiver. MAIS : PAS éligible MaPrimeRénov’, COP chute fortement <-5°C (0,5-1 dans grand froid), ne produit pas ECS, ne remplace pas vraiment chauffage principal en zone H1 (nord) mal isolée. PAC air/eau = investissement 10 000-16 000 € MAIS MaPrimeRénov’ jusqu’à 5 000 € + CEE 4 000-5 000 € = 6 000-10 000 € net, remplace chaudière complètement (radiateurs + plancher chauffant), produit ECS, idéale maison individuelle 80-200 m². Règle : clim réversible = appoint + rafraîchissement ; PAC air/eau = chauffage principal rénovation énergétique sérieuse.',
  },
  {
    question: 'Quelles aides pour installer une clim réversible ?',
    answer:
      'Aides 2026 très limitées vs PAC air/eau : (1) Prime CEE Coup de pouce chauffage PAC air/air : 100-300 € si COP ≥3,9 installée par RGE QualiPAC — tous ménages ; (2) TVA 10 % (pas 5,5 % car air/air pas considéré chauffage principal réno énergétique) en résidence principale >2 ans ; (3) Éco-PTZ exclu ; (4) MaPrimeRénov’ EXCLUE (décret 2022-1649 réserve à air/eau + géothermie + solaire thermique) ; (5) Aides locales ponctuelles (région Occitanie, Île-de-France) : 200-500 €. Total ménage standard : 100-500 € aides sur 3 500 € monosplit = reste à charge 3 000-3 400 €. Pour maximiser aides, privilégier PAC air/eau si habitat le permet.',
  },
  {
    question: 'L’installation par un frigoriste F-gaz est-elle obligatoire ?',
    answer:
      'OUI strictement. (1) Tout système contenant fluide frigorigène fluoré (R32, R410A, R454B) = manipulation réservée aux entreprises attestées F-gaz (art. R543-76 à R543-81 Code environnement, arrêté 30 juin 2008). (2) 2 catégories : Cat I (tous équipements) pour frigoriste complet, Cat II (≤3 kg charge) suffisant pour résidentiel ≤4 unités. (3) Non-respect = amende 1 500 € (personne physique) ou 7 500 € (personne morale), + fabricant refuse garantie, + assurance habitation refuse sinistre. (4) Prime CEE Coup de pouce exige en plus QualiPAC (différent de F-gaz) : double certification. Demander systématiquement copie attestation F-gaz + QualiPAC avant signature devis. Vérifier validité sur datafluides.developpement-durable.gouv.fr.',
  },
  {
    question: 'Quel entretien pour une climatisation réversible ?',
    answer:
      'Obligations légales : (1) Décret 2020-912 du 28 juillet 2020 : entretien tous les 2 ans obligatoire pour équipements 4-70 kW froid (quasi-tous les résidentiels > studio). Tous les ans à titre préventif. (2) Réalisé par entreprise attestée F-gaz. Coût 100-180 € HT/an. (3) Contrôle étanchéité circuit, nettoyage filtres (tous 3 mois par usager), dépoussiérage évaporateur/condenseur, mesure COP réel, vérif pressions, attestation d’entretien remise au client (à conserver 5 ans). (4) Responsabilité : propriétaire en résidence principale, locataire si bail précise charges entretien (art. 7 loi 6 juillet 1989). (5) Non-entretien = perte garantie constructeur + assurance peut refuser indemnisation en cas de sinistre (fuite eau condensats, incendie circuit électrique, panne compresseur).',
  },
]

const sources = [
  {
    label: 'Art. R543-76 Code env. — Fluide frigorigène',
    url: 'https://www.legifrance.gouv.fr',
  },
  { label: 'Décret 2020-912 — Entretien clim', url: 'https://www.legifrance.gouv.fr' },
  { label: 'Qualit’ENR — QualiPAC', url: 'https://www.qualit-enr.org' },
  { label: 'ADEME — Clim réversible', url: 'https://www.ademe.fr' },
  { label: 'France Rénov — Chauffage', url: 'https://france-renov.gouv.fr' },
]

const relatedGuides = [
  {
    label: 'Pompe à chaleur air/eau : prix installée',
    href: '/guides/prix-pompe-chaleur-air-eau-installee',
  },
  {
    label: 'Installation pompe à chaleur étapes',
    href: '/guides/installation-pompe-chaleur-etapes',
  },
  { label: 'QualiPAC : signification, obtenir', href: '/guides/qualipac-signification-obtenir' },
  { label: 'Chauffe-eau thermodynamique prix', href: '/guides/chauffe-eau-thermodynamique-prix' },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Chauffage',
    keywords: [
      'climatisation réversible prix',
      'clim réversible pose',
      'PAC air air aides',
      'QualiPAC F-gaz',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Climatisation réversible', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const howToSchema = getHowToSchema(howToSteps, {
    name: 'Installer une climatisation réversible',
    description:
      'Méthode complète pour dimensionner, choisir, installer et entretenir une clim réversible conforme F-gaz + QualiPAC.',
    totalTime: 'P7D',
  })
  const schemas = [articleSchema, breadcrumbSchema, faqSchema, howToSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Clim réversible' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Wind className="w-3.5 h-3.5" aria-hidden />
              Chauffage · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Climatisation réversible : prix et pose 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Une clim réversible coûte 1 800-8 500 € TTC posée selon le nombre d’unités et ne
              bénéficie pas de MaPrimeRénov’. Voici les prix 2026, les aides CEE, les obligations
              F-gaz + QualiPAC et comment bien dimensionner la puissance.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Prix clim réversible TTC posée 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Configuration</th>
                    <th className="p-3 border-b border-sand-200">Prix posé TTC</th>
                    <th className="p-3 border-b border-sand-200">Usage type</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Monosplit 2,5 kW', '1 800-2 500 €', 'Studio / 1 pièce 25 m²'],
                    ['Monosplit 3,5-5 kW', '2 500-3 500 €', 'Salon 30-50 m²'],
                    ['Bisplit 2×2,5 kW', '3 000-4 500 €', 'Salon + chambre'],
                    ['Multisplit 3 unités', '4 500-6 500 €', 'T3-T4'],
                    ['Multisplit 4-5 unités', '6 500-8 500 €', 'T4-T5 complet'],
                    ['Gainable centralisé', '8 000-12 000 €', 'T4 haut de gamme'],
                  ].map(([c, p, u]) => (
                    <tr key={c} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{c}</td>
                      <td className="p-3 font-semibold">{p}</td>
                      <td className="p-3">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />
          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">À lire aussi</h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {relatedGuides.map((g) => (
                <li key={g.href}>
                  <Link
                    href={g.href}
                    className="flex items-center justify-between gap-2 bg-white border border-sand-200 rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all text-sand-800"
                  >
                    <span className="text-sm font-medium">{g.label}</span>
                    <ArrowRight className="w-4 h-4 text-sand-400 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <FlagshipAuthorCard
            authorName={AUTHOR_NAME}
            datePublished={PUBLISHED}
            dateModified={MODIFIED}
          />
          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4">
            <Link href="/guides" className="inline-flex items-center gap-1 hover:text-primary-700">
              ← Tous les guides
            </Link>
            <Link
              href="/services/chauffagiste"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un frigoriste QualiPAC <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
