import type { Metadata } from 'next'
import Link from 'next/link'
import { Cpu, ArrowRight, Phone } from 'lucide-react'
import JsonLd from '@/components/JsonLd'
import Breadcrumb from '@/components/Breadcrumb'
import { getBreadcrumbSchema, getFAQSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'

const SLUG = 'domotique-installation-smart-home'
const PAGE_URL = `${SITE_URL}/guides/${SLUG}`
const PUBLISHED = '2026-04-19'
const MODIFIED = '2026-04-19'
const AUTHOR_NAME = 'Marc Lefebvre'
const AUTHOR_SLUG = 'marc-lefebvre'

export const revalidate = 86400

const TITLE = 'Domotique 2026 : installation et prix'
const DESCRIPTION =
  'Domotique 2026 : prix 2 500-15 000 € TTC selon protocole (KNX, Zigbee, Z-Wave, Matter), pose par électricien spécialisé domotique, NF C 15-100.'

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
  'Prix 2026 TTC installé : maison 100 m² 5 000-9 000 € (Zigbee/Z-Wave/Matter) ou 10 000-18 000 € (KNX filaire haut de gamme).',
  'Protocoles : KNX (filaire, neuf, pérenne 20+ ans) / Zigbee (radio, mesh, Philips Hue, Ikea) / Z-Wave (radio longue portée) / Matter (standard universel 2023+).',
  'Fonctions gérables : éclairage, volets, chauffage, scénarios, sécurité (alarme, caméras, détecteurs), arrosage, ECS, multimédia.',
  'Installation = électricien qualifié domotique (Qualifelec DOM ou compétences KNX/Zigbee). NF C 15-100 A5 obligatoire.',
  'Pas d’aide directe MaPrimeRénov’. Éco-PTZ incluable si bouquet rénovation + pilotage chauffage CEE possible.',
]

const faqs = [
  {
    question: 'Quel prix pour installer la domotique dans une maison en 2026 ?',
    answer:
      'Prix 2026 TTC fourniture + pose selon surface et ambition : (1) Starter kit Zigbee/Matter DIY (box + 5 ampoules + 2 volets + thermostat) 400-800 € — bricolage ; (2) Maison 100 m² radio Zigbee/Z-Wave pilotage éclairage + volets + chauffage : 5 000-7 000 € installé par pro ; (3) Maison 100 m² complète (+ alarme + caméras + scénarios + vocal) : 7 000-9 000 € ; (4) Maison 150 m² KNX filaire (neuf ou rénovation lourde) : 12 000-18 000 € — pérennité 20+ ans, standard international ; (5) Rénovation 100 m² avec saignées murs : 8 000-12 000 € (hors saignées +2 000-4 000 €). Répartition coût typique (maison 100 m² Zigbee 7 000 €) : box centrale 300-600 €, périphériques éclairage 1 800 €, volets 1 200 €, thermostat 500 €, alarme 800 €, paramétrage pro 1 200 €, pose 1 500 €. Avantage radio = peu/pas de gros œuvre.',
  },
  {
    question: 'Quel protocole domotique choisir en 2026 ?',
    answer:
      'Comparatif protocoles 2026 : (1) KNX — standard filaire international, bus 2 fils, 20+ ans pérennité, CHER (×2,5-3 vs radio), installation neuf ou rénovation lourde exclusivement, pour maisons premium 150+ m² ; (2) ZIGBEE — radio mesh 2,4 GHz, standard ouvert, compatible Philips Hue, Ikea, Aqara, grand écosystème, portée 10-30 m + répéteurs, idéal rénovation ; (3) Z-WAVE — radio 868 MHz, portée supérieure (100 m), mais écosystème plus fermé + 30 % cher que Zigbee ; (4) MATTER — nouveau standard universel 2023+ porté par Apple/Google/Amazon/Samsung, compatible WiFi + Thread, interopérabilité maximale, avenir mais encore limité en 2026 ; (5) WIFI — évitez pour domotique sérieuse (sollicitation box + sécurité + consommation) ; (6) PROPRIÉTAIRE (Somfy TaHoma, Netatmo) — écosystèmes fermés, risque obsolescence. Recommandation 2026 : Zigbee ou Matter en rénovation, KNX en neuf premium.',
  },
  {
    question: 'Qui peut installer la domotique légalement ?',
    answer:
      '(1) Éléments BT (basse tension, 230 V — relais éclairage, volets motorisés, chauffage) : électricien titulaire habilitation électrique BR (indispensable art. R4544-9 Code travail). (2) Domotique KNX : requiert formation spécialisée constructeur (Siemens, Schneider, ABB) + certification Qualifelec DOM recommandée (certification complémentaire domotique). (3) Domotique radio (Zigbee, Z-Wave) : moins exigeante techniquement mais paramétrage box + intégration = compétence clé ; faire appel à un électricien intégrateur certifié. (4) BRICOLAGE DIY : légal pour équipements TBT (très basse tension, <50 V = télécommandes, capteurs sans fil, box) mais TOUT câblage 230 V en maison occupée ou louée doit être fait par pro (assurance habitation l’exige, Consuel Attestation de Conformité obligatoire neuf ou rénovation lourde). (5) Sanctions : défaut Consuel = raccordement Enedis refusé. Faux pro (Qualifelec non valide) = assurance refuse sinistre, MaPrimeRénov’ refusée si couplé chauffage piloté.',
  },
  {
    question: 'Quelles aides pour la domotique en 2026 ?',
    answer:
      'Aides limitées, domotique non éligible directement MaPrimeRénov’ : (1) CEE Pilotage chauffage : thermostat connecté programmable couplé chaudière/PAC ouvre CEE 200-400 € (bonification coup de pouce si énergies renouvelables) ; (2) TVA 10 % pose domotique résidence principale >2 ans (art. 279-0 bis CGI) ; (3) Éco-PTZ : pilotage chauffage + régulation intégrable dans bouquet rénovation énergétique (jusqu’à 30 000 €) ; (4) Crédit d’impôt autonomie 25 % art. 200 quater A CGI : équipements spéciaux handicap/maintien à domicile (commandes vocales, ouvertures assistées) plafonnés 5 000 € sur 5 ans ; (5) Aides locales : certaines régions (IDF, Bretagne) prime rénovation intelligente 200-800 € ; (6) Défiscalisation Denormandie/Pinel : domotique inclue dans travaux rénovation locatifs. Total aide ménage standard : 200-600 € = reste à charge 4 500-8 500 € sur maison 5 000-9 000 €.',
  },
  {
    question: 'La domotique est-elle sécurisée contre le piratage ?',
    answer:
      'Risques réels mais maîtrisables : (1) Protocoles radio chiffrés (AES-128 pour Zigbee 3.0, Z-Wave S2, Matter) — chiffrement robuste conforme RGPD + directive NIS2 ; (2) Box centrale = maillon faible : MAJ firmware régulières, changer mot de passe défaut, déconnecter accès WAN si pas de pilotage externe, VPN + double authentification ; (3) Caméras + micros smart home : respect RGPD (cadrage restreint, pas filmer voisinage, info visible). Sanction CNIL jusqu’à 20 M€ ou 4 % CA (art. 83 RGPD) ; (4) Cloud tiers (Google Home, Alexa) : data hébergée USA — CLOUD Act, privilégier solutions on-premise Home Assistant ou Jeedom ; (5) Panne internet = domotique cloud HS (scénarios, vocal). Solutions locales (KNX, Home Assistant local, Jeedom) fonctionnent sans internet ; (6) Obsolescence : ampoule Hue achetée 2017 fonctionne toujours 2026. Protocoles ouverts (Zigbee, Matter, KNX) = pérennité garantie. Éviter écosystèmes 100 % propriétaires.',
  },
]

const sources = [
  {
    label: 'NF C 15-100 A5 — Installation BT',
    url: 'https://www.afnor.org',
  },
  { label: 'Qualifelec DOM — Certification', url: 'https://www.qualifelec.fr' },
  { label: 'Alliance KNX — Standard filaire', url: 'https://www.knx.org' },
  { label: 'Matter CSA — Smart Home 2023+', url: 'https://csa-iot.org' },
  { label: 'CNIL — Objets connectés RGPD', url: 'https://www.cnil.fr' },
]

const relatedGuides = [
  { label: 'Normes électriques NF C 15-100', href: '/guides/normes-electriques' },
  {
    label: 'Tableau électrique aux normes 2026',
    href: '/guides/tableau-electrique-aux-normes-2026',
  },
  { label: 'Prix électricien heure 2026', href: '/guides/prix-electricien-heure-2026' },
  {
    label: 'Qualibat Qualipac Qualifelec',
    href: '/guides/qualibat-qualipac-qualifelec-qui-choisir',
  },
]

export default function Page() {
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: SLUG,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Électricité',
    keywords: [
      'domotique prix installation',
      'smart home maison connectée',
      'KNX Zigbee Matter',
      'électricien domotique KNX',
    ],
  })
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: 'Domotique smart home', url: `/guides/${SLUG}` },
  ])
  const faqSchema = getFAQSchema(faqs)
  const schemas = [articleSchema, breadcrumbSchema, faqSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )
  return (
    <>
      <JsonLd data={schemas} />
      <div className="bg-sand-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Breadcrumb
            items={[{ label: 'Guides', href: '/guides' }, { label: 'Domotique smart home' }]}
            className="mb-6"
          />
          <header className="mb-8">
            <div className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full mb-4">
              <Cpu className="w-3.5 h-3.5" aria-hidden />
              Électricité · Guide vérifié
            </div>
            <h1
              data-speakable="true"
              className="font-heading text-3xl md:text-4xl font-bold text-sand-900 mb-4"
            >
              Domotique : installation smart home 2026
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Installer la domotique dans une maison de 100 m² coûte 5 000-9 000 € en radio (Zigbee,
              Matter) ou 12 000-18 000 € en KNX filaire. Voici les protocoles, les fonctions, les
              coûts et les exigences légales 2026.
            </p>
          </header>
          <TldrBlock bullets={tldr} />
          <article className="prose prose-sand max-w-none prose-headings:font-heading prose-headings:text-sand-900 prose-a:text-primary-700 prose-a:no-underline hover:prose-a:underline">
            <h2>Comparatif protocoles domotiques 2026</h2>
            <div className="not-prose bg-white border border-sand-200 rounded-xl my-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-sand-50 text-sand-900 text-left">
                  <tr>
                    <th className="p-3 border-b border-sand-200">Protocole</th>
                    <th className="p-3 border-b border-sand-200">Type</th>
                    <th className="p-3 border-b border-sand-200">Usage recommandé</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['KNX', 'Filaire bus 2 fils', 'Neuf premium 150+ m²'],
                    ['Zigbee', 'Radio mesh 2,4 GHz', 'Rénovation grand public'],
                    ['Z-Wave', 'Radio 868 MHz', 'Grande maison radio longue portée'],
                    ['Matter', 'Radio WiFi + Thread', 'Standard universel 2023+'],
                    ['WiFi', 'Radio 2,4/5 GHz', 'Évitez (sollicitation box)'],
                  ].map(([p, t, u]) => (
                    <tr key={p} className="border-b border-sand-100 last:border-0">
                      <td className="p-3 font-medium">{p}</td>
                      <td className="p-3">{t}</td>
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
              href="/services/electricien"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Trouver un électricien (domotique) <Phone className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
