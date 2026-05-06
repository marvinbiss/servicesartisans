/**
 * Page : /renovation-energetique/diagnostic/dpe/classes/f
 *
 * @kw-primary    dpe classe f
 * @kw-volume     600
 * @kw-kd         0
 * @kw-cpc        0.42
 * @intent        info
 * @cluster       reno-energetique-diagnostic-dpe-classes-f
 * @ahrefs-source docs/ahrefs-audit-2026-04/STRATEGIE-RENOVATION-ENERGETIQUE.md (Bloc 1 niche v3)
 * @snapshot      2026-05-06 (Bloc 1 + estimation snapshot — quota Ahrefs API restreint, à re-valider 18/05)
 * @backlog-item  Sprint 3 orphelin DPE classe F individuelle (urgence bailleur 2028)
 *
 * KW cibles (Bloc 1 + estimation longue traîne) :
 * - "dpe classe f"                 → ~600 vol, KD 0 ⭐⭐⭐⭐ PIVOT
 * - "classe f dpe"                 → ~250 vol, KD 0
 * - "logement classe f"            → ~150 vol, KD 0
 * - "dpe f"                        → ~200 vol, KD 1 (ambigu mais variant)
 * - "interdiction location dpe f"  → ~300 vol, KD 0 (bailleur urgence 2028)
 * - Famille cumulée pivot : ~1 500 vol/mois (KD 0-1)
 *
 * Easy win : OUI (KD 0, intent bailleurs panique 2028 = haute conversion vers
 * audit + travaux). Cluster pillar : Rénovation Énergétique → Diagnostic → DPE → Classes → F
 *
 * Anti-cannibalisation :
 *   - Hub /classes/ = recap A-G panorama
 *   - /classes/g/ = focus G (8K vol, conséquences vente)
 *   - /interdiction-location-g-f/ = focus loi bailleur G+F combiné
 *   - Cette page = focus CLASSE F isolée : caractéristiques techniques, % parc,
 *     URGENCE 2028 (vs G déjà interdite 2025), travaux saut F→E/D/C chiffrés.
 *     Angle ANTICIPATION : 33-mois pour sortir avant interdiction.
 *
 * E-E-A-T YMYL : sources officielles
 *   - Arrêté 31 mars 2021 (3CL-2021)
 *   - Loi Climat 2021 art. 160 (interdiction F au 1er jan 2028)
 *   - Décret 2022-510 (audit énergétique vente)
 *   - ADEME — bilan parc passoires
 *   - Notaires de France — décote DPE F
 */
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Calculator, Flame, Leaf, ShieldAlert } from 'lucide-react'

import Breadcrumb from '@/components/Breadcrumb'
import JsonLd from '@/components/JsonLd'
import LastUpdated from '@/components/seo/LastUpdated'
import TldrBlock from '@/components/flagship/TldrBlock'
import FlagshipFaq from '@/components/flagship/FlagshipFaq'
import FlagshipSources from '@/components/flagship/FlagshipSources'
import FlagshipAuthorCard from '@/components/flagship/FlagshipAuthorCard'
import { SITE_URL, SITE_NAME, getAlternates } from '@/lib/seo/config'
import { getBreadcrumbSchema, getFAQSchema, getGovernmentServiceSchema } from '@/lib/seo/jsonld'
import { getFlagshipArticleSchema } from '@/lib/seo/flagship-schema'

export const revalidate = 86400

const PAGE_PATH = '/renovation-energetique/diagnostic/dpe/classes/f'
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`
const PUBLISHED = '2026-05-06'
const MODIFIED = '2026-05-06'
const AUTHOR_SLUG = 'sophie-martin'
const AUTHOR_NAME = 'Sophie Martin'

const TITLE = 'DPE classe F 2026 : interdiction location 2028, sauts F→E/D/C'
const DESCRIPTION =
  'DPE classe F en 2026 : 331-420 kWh/m²/an, 71-100 kg CO₂/m². Location interdite 1er janvier 2028 (33 mois) — urgence bailleurs. 4 sauts F→E/D/C/B chiffrés avec aides MPR.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: getAlternates(PAGE_PATH),
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
  'DPE classe F : 331 → 420 kWh/m²/an OU 71 → 100 kg CO₂/m²/an (méthode 3CL-2021).',
  'Représente ~3,3 millions de logements en France, soit 11 % du parc résidentiel principal (INSEE / ADEME 2024).',
  'Interdiction de mise en location au 1er janvier 2028 (loi Climat 2021 art. 160) — 33 mois pour anticiper.',
  'Bail en cours signé avant 2028 non rompu, mais nouveau bail / renouvellement = INTERDIT à partir de cette date.',
  'Saut F → E (~ 12-18 K€) sécurise jusqu’en 2034. Saut F → D (~ 22-30 K€) recommandé : sortie passoire complète.',
  'Aides 2026 : MaPrimeRénov’ Parcours accompagné jusqu’à 70 K€ + bonus passoire +10 % + sortie passoire 1 500 € (saut ≥ 2 classes).',
]

const SEUILS_F = [
  {
    indicateur: 'Consommation énergie primaire',
    seuil: '331 → 420 kWh/m²/an',
    detail:
      '5 usages réglementaires (chauffage + ECS + refroidissement + éclairage + auxiliaires).',
  },
  {
    indicateur: 'Émissions CO₂',
    seuil: '71 → 100 kg CO₂/m²/an',
    detail:
      'Si dépassé seul (chauffage fioul typiquement) → bascule possible en F même si conso < 331.',
  },
  {
    indicateur: 'Facture énergétique',
    seuil: '~ 1 800 - 2 800 €/an',
    detail:
      'Pour 100 m². Souvent maisons des années 1948-1974 mal isolées avec chauffage fioul/gaz.',
  },
]

const URGENCE_2028 = {
  echeance: '1er janvier 2028',
  moisRestants: 33,
  mesures: [
    {
      titre: 'Bail en cours conclu avant 2028',
      detail:
        'Pas rompu. Le bailleur peut continuer à percevoir le loyer. Mais à l’échéance triennale (bail vide) ou annuelle (meublé), tout RENOUVELLEMENT après le 1er janvier 2028 sera interdit si le DPE reste F.',
    },
    {
      titre: 'Nouveau bail signé en 2028',
      detail:
        'INTERDIT. Le bailleur s’expose à un bail réputé non opposable, à des injonctions sous astreinte (50-500 €/jour) et à des baisses de loyer judiciaires (10-30 %).',
    },
    {
      titre: 'Vente en 2026-2027 (anticipation)',
      detail:
        'Reste autorisée mais audit énergétique obligatoire (décret 2022-510) + décote 7-12 % vs équivalent classe D (Notaires de France). Anticiper avant que la décote s’aggrave en 2028.',
    },
    {
      titre: 'Gel des loyers',
      detail:
        'Depuis le 24 août 2022 : loyer NON révisable annuellement et NON augmentable au renouvellement pour tout F (et G). Mesure permanente jusqu’à la sortie de classe F.',
    },
  ],
}

const SAUTS_F = [
  {
    saut: 'F → E',
    cout: '12 - 18 K€',
    aides: '5 - 10 K€',
    reste: '7 - 8 K€',
    travaux: 'Isolation combles 30 cm + remplacement chaudière fioul/gaz énergivore → PAC air/eau.',
    impact: '~ 1 200 €/an économies. Sortie passoire mais reste interdit location en 2034.',
    rentabilite: 'ROI 6-7 ans. Solution MINIMUM pour éviter l’interdiction 2028.',
  },
  {
    saut: 'F → D',
    cout: '22 - 30 K€',
    aides: '10 - 16 K€',
    reste: '12 - 14 K€',
    travaux: 'Combles + ITE 14 cm + PAC + ballon thermodynamique. Audit énergétique obligatoire.',
    impact: '~ 1 800 €/an économies. Bonus sortie passoire 1 500 € (saut ≥ 2 classes).',
    rentabilite: 'ROI 7-8 ans. Solution RECOMMANDÉE long terme — pas de relimitation prévue.',
  },
  {
    saut: 'F → C',
    cout: '32 - 45 K€',
    aides: '16 - 24 K€',
    reste: '16 - 21 K€',
    travaux: 'Rénovation BBC : combles 40 cm + ITE 20 cm + PAC + VMC double flux + menuiseries.',
    impact:
      '~ 2 200 €/an économies. Valorisation +5-10 % à la revente (étude Notaires de France 2024).',
    rentabilite: 'ROI 9-10 ans. Recommandé bailleur long terme + résidence principale.',
  },
  {
    saut: 'F → B',
    cout: '55 - 80 K€',
    aides: '25 - 38 K€',
    reste: '30 - 42 K€',
    travaux: 'Rénovation BBC complète + photovoltaïque autoconsommation 3-6 kWc.',
    impact: '~ 2 800 €/an économies + production solaire 800-1 800 €/an.',
    rentabilite: 'ROI 14-18 ans. Justifié uniquement résidence principale 15+ ans.',
  },
]

const sources = [
  {
    label: 'Arrêté du 31 mars 2021 — méthode 3CL-2021 (seuils DPE)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043301471',
  },
  {
    label: 'Loi Climat et Résilience n° 2021-1104 (interdiction F au 1er jan 2028)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924',
  },
  {
    label: 'Décret 2022-510 du 8 avril 2022 — audit énergétique vente',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045541907',
  },
  {
    label: 'Observatoire DPE-Audit ADEME — vérification numéro DPE',
    url: 'https://observatoire-dpe-audit.ademe.fr',
  },
  {
    label: 'Notaires de France — Étude valeur verte 2024',
    url: 'https://www.notaires.fr',
  },
  {
    label: 'France Rénov’ — MaPrimeRénov’ Parcours accompagné',
    url: 'https://france-renov.gouv.fr',
  },
  {
    label: 'ANAH — Bonus passoire et sortie passoire 2026',
    url: 'https://www.anah.gouv.fr',
  },
  {
    label: 'INSEE — Recensement parc logements 2024',
    url: 'https://www.insee.fr',
  },
]

const faqs = [
  {
    question: 'Combien de mois reste-t-il avant l’interdiction de location d’un DPE F ?',
    answer:
      'L’interdiction tombe le 1er janvier 2028. Au 6 mai 2026, il reste donc environ 33 mois pour réaliser les travaux + nouveau DPE attestant une classe E ou meilleure. Comme une rénovation Parcours accompagné prend en moyenne 8-14 mois (audit + dépôt MPR + travaux + DPE post-travaux), il faut idéalement déposer le dossier MaPrimeRénov’ avant fin 2026 pour avoir une marge de sécurité.',
  },
  {
    question: 'Mon DPE F doit-il être refait avant 2028 ?',
    answer:
      'OUI dans deux cas : 1) DPE réalisé avant le 1er juillet 2021 → caduc depuis le 1er janvier 2025, à refaire avant location/vente. 2) Travaux d’économie d’énergie significatifs réalisés → un nouveau DPE post-travaux peut faire passer en E/D/C. Dans tous les autres cas, le DPE reste valide 10 ans à compter de sa date de réalisation (méthode 3CL-2021).',
  },
  {
    question: 'Quelle différence entre classe F et classe G en 2026 ?',
    answer:
      'Classe G = >420 kWh/m²/an OU >100 kg CO₂/m². Location déjà INTERDITE depuis le 1er janvier 2025. Vente : audit énergétique obligatoire + décote 10-15 %. Classe F = 331-420 kWh/m²/an. Location encore AUTORISÉE jusqu’au 31 décembre 2027 (33 mois). Vente : audit obligatoire + décote 7-12 %. Les deux classes sont juridiquement appelées "passoires thermiques" mais l’urgence diffère.',
  },
  {
    question: 'Existe-t-il des dérogations à l’interdiction location F en 2028 ?',
    answer:
      'OUI, trois dérogations principales prévues par décret 2025 (en cours de finalisation) : 1) Copropriétés où l’AG refuse les travaux malgré une mise en demeure documentée. 2) Bâtiments classés ou protégés (ABF) où les travaux sont techniquement impossibles ou coûteux à plus de 50 % de la valeur du bien. 3) Contraintes techniques majeures attestées par avis d’architecte (effondrement, mitoyenneté, structure). Dans ces cas, la location reste autorisée mais l’audit énergétique annexé au bail reste obligatoire.',
  },
  {
    question: 'Combien coûte le minimum pour sortir un F (saut F → E) ?',
    answer:
      '12-18 K€ HT pour 100 m² typique avec : isolation combles 30 cm (3-6 K€) + remplacement chaudière énergivore par PAC air/eau (8-12 K€). Aides MaPrimeRénov’ Parcours accompagné + CEE Coup de pouce + éco-PTZ peuvent couvrir 5-10 K€ pour ménage modeste. Reste à charge moyen 7-8 K€. Ce saut sécurise jusqu’en 2034 (interdiction E à venir), puis nécessitera un second cycle de travaux. Beaucoup de bailleurs préfèrent viser directement F → D pour sécurité long terme.',
  },
  {
    question: 'Le saut F → C est-il pertinent ou over-engineering ?',
    answer:
      'Il est pertinent dans 3 cas : 1) Résidence principale long terme (15+ ans) où le confort + facture cumulée justifie l’investissement. 2) Bailleur souhaitant maximiser la valeur verte à la revente (+5-10 % vs F + sortie passoire pérenne). 3) Bâti propice (façade rénovable ITE + combles aménageables) qui permet d’économiser 20-30 % sur les coûts par effet rénovation globale. Sinon, F → D suffit largement et offre un meilleur ROI à 7-8 ans.',
  },
  {
    question: 'Quelle aide peut être perçue pour rénover un F en 2026 ?',
    answer:
      'MaPrimeRénov’ Parcours accompagné jusqu’à 70 000 € HT (90 % très modestes, 50 % intermédiaires) + bonus passoire +10 % automatique pour F → E/D/C/B/A + bonus sortie passoire 1 500 € (saut ≥ 2 classes hors G). Cumulables avec : CEE Coup de pouce 3-5 K€ chauffage, éco-PTZ 50 K€ taux 0 sur 20 ans, TVA 5,5 %, exonération taxe foncière 3-5 ans (selon commune). Total moyen 50-65 % du devis HT couvert par aides pour ménage modeste.',
  },
  {
    question: 'Vendre un F en 2026-2027 : avantage ou retard ?',
    answer:
      'Vendre AVANT 2028 = avantageux pour deux raisons. 1) Décote actuelle 7-12 % (Notaires de France 2024) pourrait s’aggraver à 12-18 % début 2028 par effet panique bailleurs forcés à vendre. 2) Délai de vente moyen F = 95 jours en 2024, mais les transactions devraient ralentir en 2027-2028 par sur-offre passoires. Audit énergétique obligatoire (~ 500-1 200 €) doit déjà figurer au compromis. Anticiper la mise en vente début 2026 est donc fiscalement et financièrement rationnel.',
  },
]

export default function DpeClasseFPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Rénovation énergétique', url: '/renovation-energetique' },
    { name: 'Diagnostic', url: '/renovation-energetique/diagnostic' },
    { name: 'DPE', url: '/renovation-energetique/diagnostic/dpe' },
    { name: 'Classes A à G', url: '/renovation-energetique/diagnostic/dpe/classes' },
    { name: 'Classe F', url: PAGE_PATH },
  ])
  const faqSchema = getFAQSchema(faqs)
  const articleSchema = getFlagshipArticleSchema({
    title: TITLE,
    description: DESCRIPTION,
    slug: PAGE_PATH,
    datePublished: PUBLISHED,
    dateModified: MODIFIED,
    author: { type: 'person', name: AUTHOR_NAME },
    section: 'Diagnostic — DPE — Classe F',
    keywords: [
      'dpe classe f',
      'classe f dpe',
      'logement classe f',
      'dpe f',
      'interdiction location dpe f',
      'passoire f',
      'sortir classe f',
    ],
  })
  const govSchema = getGovernmentServiceSchema({
    name: 'Interdiction location DPE F au 1er janvier 2028',
    description:
      'Loi Climat et Résilience 2021 (art. 160) : interdiction de mise en location et de renouvellement de bail pour tout logement classé F à compter du 1er janvier 2028.',
    url: PAGE_URL,
    serviceType: 'Réglementation logement — interdiction location passoires F',
    serviceOperator: {
      name: 'Ministère de la Transition écologique',
      url: 'https://www.ecologie.gouv.fr',
    },
  })

  const schemas = [articleSchema, breadcrumbSchema, faqSchema, govSchema].filter(
    (s): s is Record<string, unknown> => s !== null
  )

  return (
    <>
      <JsonLd data={schemas} />

      <main className="bg-sand-50 min-h-screen">
        <Breadcrumb
          items={[
            { label: 'Rénovation énergétique', href: '/renovation-energetique' },
            { label: 'Diagnostic', href: '/renovation-energetique/diagnostic' },
            { label: 'DPE', href: '/renovation-energetique/diagnostic/dpe' },
            { label: 'Classes A à G', href: '/renovation-energetique/diagnostic/dpe/classes' },
            { label: 'Classe F' },
          ]}
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-6"
        />

        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <header className="mb-8">
            <p className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              <Flame className="w-3.5 h-3.5" aria-hidden /> Passoire thermique — interdite 2028
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-sand-900 mt-3 mb-3 leading-tight">
              DPE classe F en 2026 : interdiction location 2028 et sauts F→E/D/C
            </h1>
            <p className="text-lg text-sand-700 leading-relaxed">
              Tout sur la classe F du DPE : seuils 3CL-2021, 11 % du parc résidentiel français,
              interdiction de mise en location dès le 1er janvier 2028 (33 mois pour anticiper), et
              4 sauts de rénovation chiffrés (F→E, F→D, F→C, F→B) avec aides 2026.
            </p>
            <LastUpdated date={MODIFIED} label="Mis à jour le" className="mt-3 text-sm" />
          </header>

          <TldrBlock bullets={tldr} />

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Définition technique de la classe F (méthode 3CL-2021)
            </h2>
            <p className="text-sand-700 mb-6">
              Depuis l’arrêté du 31 mars 2021, la méthode 3CL-2021 unifiée s’applique. Un logement
              est classé F si l’une des deux notes suivantes est dépassée — la pire des deux est
              retenue.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {SEUILS_F.map((s) => (
                <div
                  key={s.indicateur}
                  className="bg-white border-2 border-orange-200 rounded-xl p-5 shadow-sm"
                >
                  <p className="font-semibold text-orange-700 text-sm uppercase tracking-wide">
                    {s.indicateur}
                  </p>
                  <p className="font-heading text-2xl font-bold text-sand-900 mt-2 mb-3">
                    {s.seuil}
                  </p>
                  <p className="text-sm text-sand-600 leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              Échéance 1er janvier 2028 — urgence bailleurs
            </h2>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <Calendar className="w-8 h-8 text-orange-600 shrink-0" aria-hidden />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">
                    Interdiction de mise en location au {URGENCE_2028.echeance}
                  </p>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    Loi Climat et Résilience 2021 (article 160). Au 6 mai 2026, il reste{' '}
                    <strong>{URGENCE_2028.moisRestants} mois</strong> pour réaliser audit + dépôt
                    MaPrimeRénov’ Parcours accompagné + travaux + DPE post-travaux. Délai moyen
                    Parcours accompagné : 8-14 mois.
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {URGENCE_2028.mesures.map((m) => (
                <div
                  key={m.titre}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <h3 className="font-semibold text-sand-900 mb-1">{m.titre}</h3>
                  <p className="text-sm text-sand-600 leading-relaxed">{m.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10">
            <h2 className="font-heading text-2xl font-bold text-sand-900 mb-4">
              4 sauts de classe pour sortir d’un DPE F
            </h2>
            <p className="text-sand-700 mb-6">
              Quatre scénarios standards selon votre horizon (échapper à 2028, sécuriser 2034 ou
              maximiser la valeur verte). Coûts indicatifs HT pour 100 m² SHAB hors zone tendue.
              Aides moyennes pour ménage modeste (Parcours accompagné MaPrimeRénov’ + CEE).
            </p>
            <div className="space-y-4">
              {SAUTS_F.map((s) => (
                <div
                  key={s.saut}
                  className="bg-white border border-sand-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="font-heading text-2xl font-bold text-emerald-700 shrink-0">
                      {s.saut}
                    </div>
                    <div className="flex-1 min-w-[280px]">
                      <p className="text-sand-700 leading-relaxed mb-3">
                        <strong>Travaux : </strong>
                        {s.travaux}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Coût HT</p>
                          <p className="font-semibold text-sand-900">{s.cout}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Aides</p>
                          <p className="font-semibold text-emerald-700">{s.aides}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Reste à charge</p>
                          <p className="font-semibold text-sand-900">{s.reste}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-sand-500 mb-0.5">Rentabilité</p>
                          <p className="font-semibold text-sand-700 text-xs leading-snug">
                            {s.rentabilite}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-sand-600 mt-3 border-t border-sand-100 pt-3">
                        <Leaf className="inline w-4 h-4 text-emerald-600 mr-1" aria-hidden />
                        {s.impact}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="my-10 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
            <h2 className="font-heading text-xl font-bold text-emerald-900 mb-3">
              <Calculator className="inline w-5 h-5 mr-2" aria-hidden />
              Estimer mes aides en 2 minutes
            </h2>
            <p className="text-sm text-emerald-800 mb-4 leading-relaxed">
              Le simulateur officiel France Rénov’ calcule MaPrimeRénov’ + CEE + éco-PTZ selon votre
              revenu fiscal de référence et la classe DPE de départ (bonus passoire +10 % + sortie
              passoire 1 500 €).
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/simulateur-aides-renovation"
                className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-800 transition-colors"
              >
                Simulateur aides
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <Link
                href="/renovation-energetique/passoires-thermiques/interdiction-location-g-f"
                className="inline-flex items-center gap-2 bg-white border border-emerald-300 text-emerald-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Détail interdiction location G+F
                <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
          </section>

          <FlagshipFaq items={faqs} />
          <FlagshipSources sources={sources} />

          <section className="my-10">
            <h2 className="font-heading text-xl font-semibold text-sand-900 mb-4">
              Pour aller plus loin
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {[
                {
                  label: 'Hub Classes DPE A à G',
                  href: '/renovation-energetique/diagnostic/dpe/classes',
                },
                {
                  label: 'DPE classe G — déjà interdite location 2025',
                  href: '/renovation-energetique/diagnostic/dpe/classes/g',
                },
                {
                  label: 'Hub Passoires thermiques',
                  href: '/renovation-energetique/passoires-thermiques',
                },
                {
                  label: 'Calendrier passoires 2025-2034',
                  href: '/renovation-energetique/passoires-thermiques/calendrier-2025-2028-2034',
                },
                {
                  label: 'MaPrimeRénov’ Parcours accompagné',
                  href: '/renovation-energetique/aides/maprimerenov-2026/parcours-accompagne',
                },
                {
                  label: 'Pompe à chaleur — guide complet',
                  href: '/renovation-energetique/travaux/pompe-a-chaleur',
                },
              ].map((g) => (
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

          <div className="flex items-center justify-between text-sm text-sand-600 border-t border-sand-200 pt-4 mt-6">
            <Link
              href="/renovation-energetique/diagnostic/dpe/classes"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              ← Hub Classes DPE A à G
            </Link>
            <Link
              href="/renovation-energetique/diagnostic/dpe/classes/g"
              className="inline-flex items-center gap-1 hover:text-primary-700"
            >
              Classe G → <ShieldAlert className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}
