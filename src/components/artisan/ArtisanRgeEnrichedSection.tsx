'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'

import { matchQualifications, type RgeGuideSlug } from '@/lib/rge/qualification-matcher'
import { trackEvent } from '@/lib/analytics/tracking'

// Allowlist inlinée (duplique RGE_ALLOWED_SERVICES de `service-city-listings.ts`)
// pour ne pas embarquer `@/lib/supabase` dans le bundle client de la fiche artisan.
// Doit rester synchronisée avec cette source.
const RGE_ALLOWED_SERVICE_SLUGS: ReadonlySet<string> = new Set([
  'pompe-a-chaleur',
  'panneaux-solaires',
  'isolation-thermique',
  'chauffagiste',
  'electricien',
  'renovation-energetique',
  'menuisier',
  'couvreur',
  'plombier',
  'climaticien',
  'ramoneur',
  'zingueur',
  'facadier',
  'platrier',
])

/**
 * ArtisanRgeEnrichedSection — section éditoriale affichée sur la fiche
 * individuelle d'un artisan RGE. Transforme ses qualifications ADEME en
 * maillage interne vers :
 *
 *   - les guides `/rge/qualifications/[slug]` correspondants
 *   - les opérations CEE `/cee/[code]/guide` débloquées
 *   - la page méthodologie `/rge/sources`
 *
 * Rend null si l'artisan n'a pas de qualification active (no-op pour les
 * ~920k fiches non-RGE). Aucune donnée fabriquée : tout est dérivé du
 * champ `rge_qualifications` alimenté par la sync hebdo data.gouv.fr.
 */

interface Props {
  qualifications:
    | Array<{
        code: string
        nom: string
        organisme: string
        domaine: string | null
        meta_domaine: string | null
        date_debut: string
        date_fin: string
        url: string | null
      }>
    | null
    | undefined
  organismes: string[] | null | undefined
  validUntil: string | null | undefined
  /** Slug du département courant (si connu) — pour lien cross-dept */
  departementSlug?: string
  /** Slug du service RGE courant (si connu) — pour lien cross-dept */
  rgeServiceSlug?: string
  /** ID de l'artisan (pour tracking) */
  artisanId?: string
}

const GUIDE_META: Record<RgeGuideSlug, { name: string; organisme: string; description: string }> = {
  qualipac: {
    name: 'QualiPAC',
    organisme: "Qualit'EnR",
    description: 'Pompes à chaleur aérothermiques et géothermiques, chauffe-eau thermodynamiques.',
  },
  qualibois: {
    name: 'QualiBois',
    organisme: "Qualit'EnR",
    description: 'Chaudières, poêles et inserts bois bûche ou granulés (modules Air et Eau).',
  },
  qualisol: {
    name: 'QualiSol',
    organisme: "Qualit'EnR",
    description: 'Chauffe-eau solaire individuel (CESI) et système solaire combiné (SSC).',
  },
  qualipv: {
    name: 'QualiPV',
    organisme: "Qualit'EnR",
    description: 'Panneaux photovoltaïques en intégration simplifiée ou surimposition.',
  },
  qualifelec: {
    name: 'Qualifelec RGE',
    organisme: 'Qualifelec',
    description:
      'Électrotechnique ENR : photovoltaïque, bornes IRVE, pompes à chaleur électriques.',
  },
  'architecte-audit-energetique': {
    name: 'Architecte audit énergétique',
    organisme: 'CNOA / OPQIBI',
    description:
      "Audit énergétique réglementaire, porte d'entrée MaPrimeRénov' Parcours Accompagné.",
  },
  'qualibat-5911-thermique': {
    name: 'Qualibat 5911',
    organisme: 'Qualibat',
    description:
      'Installation de systèmes thermiques : chaudières gaz/fioul condensation, PAC haute performance, hybrides.',
  },
  'qualibat-7131-isolation': {
    name: 'Qualibat 7131',
    organisme: 'Qualibat',
    description:
      "Isolation thermique par l'intérieur : combles perdus, combles aménagés, rampants, planchers bas et murs intérieurs.",
  },
  'qualifelec-irve': {
    name: 'Qualifelec IRVE',
    organisme: 'Qualifelec',
    description:
      'Installation de bornes de recharge pour véhicules électriques (IRVE P1 et P2) en résidentiel et tertiaire.',
  },
}

const CEE_SHORT_LABELS: Record<string, string> = {
  'BAR-TH-171': 'Pompe à chaleur air/eau haute performance',
  'BAR-TH-172': 'PAC eau/eau haute performance',
  'BAR-TH-112': 'Appareil indépendant de chauffage au bois',
  'BAR-TH-113': 'Chaudière biomasse individuelle',
  'BAR-TH-125': 'Ventilation mécanique double flux',
  'BAR-TH-129': 'Pompe à chaleur air/air',
  'BAR-TH-148': 'Chauffe-eau thermodynamique',
  'BAR-TH-174': 'Rénovation d’ampleur maison individuelle',
  'BAR-EN-101': 'Isolation des combles ou toitures',
  'BAR-EN-102': 'Isolation des murs',
  'BAR-EN-103': 'Isolation des planchers bas',
  'BAR-EN-104': 'Fenêtres ou baies vitrées',
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch {
    return null
  }
}

export function ArtisanRgeEnrichedSection({
  qualifications,
  organismes,
  validUntil,
  departementSlug,
  rgeServiceSlug,
  artisanId,
}: Props) {
  const hasAnyQualification = !!(qualifications && qualifications.length > 0)
  const match = matchQualifications(qualifications ?? null, organismes ?? null)

  // Fire rge_section_view exactly once per mount (guarded ref).
  // We intentionally run the effect before the early-return below by
  // checking `hasAnyQualification` inside the effect.
  const viewTrackedRef = useRef(false)
  useEffect(() => {
    if (viewTrackedRef.current) return
    if (!hasAnyQualification) return
    viewTrackedRef.current = true
    const hasFallback = match.guideSlugs.length === 0 && match.ceeOpCodes.length === 0
    trackEvent('rge_section_view', {
      artisanId: artisanId ?? null,
      qualifCount: qualifications?.length ?? 0,
      ceeCount: match.ceeOpCodes.length,
      guideCount: match.guideSlugs.length,
      hasFallback,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aucune qualification du tout → no-op complet (fiche non-RGE)
  if (!hasAnyQualification) {
    return null
  }

  // Fallback universel : l'artisan EST RGE mais ses qualifs ne matchent
  // aucun guide/CEE du catalogue interne (ex: chaudières gaz anciennes,
  // Eco Artisan sans catégorie identifiable, études ACV/géothermie
  // sans guide dédié). On rend un bloc minimaliste trust-only pour
  // garantir la couverture 100% des artisans RGE.
  const fallback = match.guideSlugs.length === 0 && match.ceeOpCodes.length === 0

  const validUntilLabel = formatDate(validUntil)
  const guides = match.guideSlugs.map((slug) => ({ slug, ...GUIDE_META[slug] }))
  const canLinkToDept =
    !!departementSlug && !!rgeServiceSlug && RGE_ALLOWED_SERVICE_SLUGS.has(rgeServiceSlug)

  const handleClick = (target: 'guide' | 'cee' | 'footer', slug: string) => {
    trackEvent('rge_section_click', {
      artisanId: artisanId ?? null,
      target,
      slug,
    })
  }

  return (
    <section
      aria-labelledby="rge-enriched-heading"
      className="bg-white rounded-2xl shadow-soft border border-emerald-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-charcoal-900 text-white px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-white/15 border border-white/25 p-2">
            <ShieldCheck className="w-5 h-5 text-emerald-100" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="rge-enriched-heading"
              className="font-heading text-xl md:text-2xl font-extrabold leading-tight"
            >
              {fallback
                ? 'Artisan reconnu RGE par l’ADEME'
                : 'Qualifications RGE & aides débloquées'}
            </h2>
            <p className="text-sm text-emerald-50/90 mt-1 leading-relaxed">
              Certifications officielles issues de l’annuaire ADEME.{' '}
              {validUntilLabel ? (
                <>
                  Valables jusqu’au <strong>{validUntilLabel}</strong>.
                </>
              ) : null}
            </p>
          </div>
        </div>
      </div>

      {/* Guides RGE détectés */}
      {guides.length > 0 && (
        <div className="px-6 pt-6">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            Comprendre ces qualifications
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/rge/qualifications/${g.slug}`}
                data-testid={`rge-guide-link-${g.slug}`}
                onClick={() => handleClick('guide', g.slug)}
                className="group block rounded-xl border border-emerald-100 bg-emerald-50/40 hover:border-emerald-300 hover:bg-emerald-50 transition p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-heading font-extrabold text-charcoal-900 text-base leading-tight">
                      {g.name}
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                      Délivrée par {g.organisme}
                    </div>
                    <p className="text-sm text-charcoal-700 mt-2 leading-relaxed">
                      {g.description}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Primes CEE débloquées */}
      {match.ceeOpCodes.length > 0 && (
        <div className="px-6 pt-6">
          <h3 className="text-xs font-bold text-primary-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Primes CEE mobilisables grâce à ces qualifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {match.ceeOpCodes.map((code) => (
              <Link
                key={code}
                href={`/cee/${code.toLowerCase()}/guide`}
                data-testid={`rge-cee-link-${code}`}
                onClick={() => handleClick('cee', code)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/60 hover:border-primary-300 hover:bg-primary-50 transition px-3 py-2 text-sm"
              >
                <span className="font-mono font-bold text-primary-800 text-xs">{code}</span>
                <span className="text-charcoal-700">{CEE_SHORT_LABELS[code]}</span>
                <ArrowRight className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-charcoal-900 mt-3 leading-relaxed">
            Les primes CEE sont cumulables avec MaPrimeRénov’. Le montant exact dépend de vos
            revenus et de la performance des équipements posés.
          </p>
        </div>
      )}

      {/* Fallback universel — qualifs actives mais pas de guide interne disponible */}
      {fallback && (
        <div className="px-6 pt-6">
          <p className="text-sm text-charcoal-700 leading-relaxed">
            Cet artisan est référencé dans l’annuaire RGE officiel avec au moins une qualification
            active
            {validUntilLabel ? <> jusqu’au {validUntilLabel}</> : null}. Son périmètre de
            reconnaissance sort du cadre de nos guides éditoriaux (architecture, audit énergétique,
            bureau d’études, énergies fossiles historiques…). Consultez directement l’annuaire
            officiel pour voir le détail exact de sa qualification et les travaux couverts.
          </p>
        </div>
      )}

      {/* Footer — trust + cross-links */}
      <div className="px-6 py-5 mt-6 bg-sand-50 border-t border-charcoal-100 text-sm text-charcoal-600">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link
            href="/rge/sources"
            data-testid="rge-footer-sources"
            onClick={() => handleClick('footer', 'sources')}
            className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-900 underline underline-offset-2"
          >
            Sources &amp; méthodologie
          </Link>
          {canLinkToDept && (
            <Link
              href={`/rge/${rgeServiceSlug}/departement/${departementSlug}`}
              data-testid="rge-footer-dept"
              onClick={() => handleClick('footer', `dept-${rgeServiceSlug}`)}
              className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-900 underline underline-offset-2"
            >
              Autres artisans RGE dans ce département
            </Link>
          )}
          <Link
            href="/cee/guides"
            data-testid="rge-footer-cee-guides"
            onClick={() => handleClick('footer', 'cee-guides')}
            className="inline-flex items-center gap-1 text-emerald-700 font-semibold hover:text-emerald-900 underline underline-offset-2"
          >
            Tous les guides CEE
          </Link>
        </div>
        <p className="text-xs text-charcoal-900 mt-2 leading-relaxed">
          Données issues du dataset public <em>liste-des-entreprises-rge-2</em> (data.gouv.fr /
          ADEME) — Licence Ouverte Etalab 2.0. Synchronisation hebdomadaire. Vérifiez toujours la
          validité sur{' '}
          <a
            href="https://france-renov.gouv.fr/annuaire-rge"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-charcoal-700"
          >
            france-renov.gouv.fr
          </a>
          .
        </p>
      </div>
    </section>
  )
}
