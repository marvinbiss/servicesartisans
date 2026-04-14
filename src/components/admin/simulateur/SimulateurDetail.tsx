'use client'

/**
 * Détail d'une estimation simulateur (admin).
 * Affiche situation, projet, résultats, bareme_ids, formule_debug (8 steps),
 * et bouton recompute pour reconstruire le résultat.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useAdminFetch, adminMutate } from '@/hooks/admin/useAdminFetch'

interface FormuleDebugStep {
  step: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  baremeIds?: string[]
  notes?: string
}

interface Geste {
  id: string
  label?: string
  forfait?: number
  baremeId?: string
}

interface Estimation {
  id: string
  public_id: string
  barometre_version: string
  created_at: string
  anonymized_at?: string | null

  type_logement: 'maison' | 'appartement'
  residence_principale: boolean
  anciennete: string
  surface_m2: number
  code_postal: string
  zone_climatique: 'H1' | 'H2' | 'H3'
  idf: boolean
  foyer_taille: number
  rfr: number
  categorie_anah: 'bleu' | 'jaune' | 'violet' | 'rose'

  parcours: 'geste' | 'accompagne'
  gestes: Geste[]
  coup_de_pouce: boolean
  equipement_actuel: string | null
  sauts_dpe: number | null

  mpr_total: number | null
  cee_fourchette_bas: number | null
  cee_fourchette_haut: number | null
  coup_pouce_estimation: number | null
  ecretement_pct: number | null
  reste_a_charge_bas: number | null
  reste_a_charge_haut: number | null

  bareme_ids: string[]
  formule_debug: FormuleDebugStep[]

  consent_rgpd: boolean
  consent_demarchage: boolean

  pipedrive_deal_id: string | null
}

interface Response {
  success: boolean
  data: Estimation
}

interface RecomputeResult {
  success: boolean
  match: boolean
  stored: Record<string, unknown>
  recomputed: Record<string, unknown>
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR')
}

function formatEuro(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-gray-100 last:border-0 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  )
}

export default function SimulateurDetail({ publicId }: { publicId: string }) {
  const { data, isLoading, error } = useAdminFetch<Response>(
    `/api/admin/simulateur/${encodeURIComponent(publicId)}`
  )

  const [recompute, setRecompute] = useState<RecomputeResult | null>(null)
  const [recomputing, setRecomputing] = useState(false)
  const [recomputeError, setRecomputeError] = useState<string | null>(null)

  const handleRecompute = async () => {
    setRecomputing(true)
    setRecomputeError(null)
    try {
      const res = (await adminMutate(
        `/api/admin/simulateur/${encodeURIComponent(publicId)}/recompute`,
        { method: 'POST' }
      )) as RecomputeResult
      setRecompute(res)
    } catch (e) {
      setRecomputeError(e instanceof Error ? e.message : 'Erreur recompute')
    } finally {
      setRecomputing(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-gray-500">Chargement…</div>
  }
  if (error || !data?.data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            {error?.message ?? 'Estimation introuvable'}
          </p>
        </div>
      </div>
    )
  }

  const est = data.data

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/simulateur"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour à la liste
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{est.public_id}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créé le {formatDate(est.created_at)} · Barèmes {est.barometre_version}
          </p>
          {est.anonymized_at && (
            <p className="text-xs text-amber-700 mt-1 bg-amber-50 inline-block px-2 py-1 rounded">
              Données anonymisées le {formatDate(est.anonymized_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecompute}
            disabled={recomputing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[#E07040] rounded-lg hover:bg-[#c9603a] disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {recomputing ? 'Calcul…' : 'Recalculer'}
          </button>
          {est.pipedrive_deal_id && (
            <a
              href={`https://servicesartisans.pipedrive.com/deal/${est.pipedrive_deal_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Pipedrive #{est.pipedrive_deal_id}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Recompute result */}
      {recompute && (
        <div
          className={`rounded-xl border p-4 ${
            recompute.match
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {recompute.match ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-green-800">
                  Reconstruction OK — résultat identique au snapshot
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <span className="text-amber-800">
                  Drift détecté — le recalcul diffère du snapshot stocké
                </span>
              </>
            )}
          </div>
          <details className="mt-3">
            <summary className="text-sm text-gray-600 cursor-pointer">Voir détail</summary>
            <pre className="mt-2 p-3 bg-white rounded text-xs overflow-auto border border-gray-200">
              {JSON.stringify({ stored: recompute.stored, recomputed: recompute.recomputed }, null, 2)}
            </pre>
          </details>
        </div>
      )}
      {recomputeError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {recomputeError}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Situation */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Situation logement</h2>
          <Row label="Type logement" value={est.type_logement} />
          <Row label="Résidence principale" value={est.residence_principale ? 'Oui' : 'Non'} />
          <Row label="Ancienneté" value={est.anciennete} />
          <Row label="Surface" value={`${est.surface_m2} m²`} />
          <Row label="Code postal" value={est.code_postal} />
          <Row label="Zone climatique" value={`${est.zone_climatique}${est.idf ? ' (IdF)' : ''}`} />
          <Row label="Foyer" value={`${est.foyer_taille} pers.`} />
          <Row
            label="RFR"
            value={
              est.anonymized_at
                ? `${Math.floor(est.rfr / 10_000) * 10_000}–${Math.floor(est.rfr / 10_000) * 10_000 + 9999} €`
                : formatEuro(est.rfr)
            }
          />
          <Row label="Catégorie ANAH" value={est.categorie_anah} />
        </section>

        {/* Projet */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Projet travaux</h2>
          <Row label="Parcours" value={est.parcours} />
          <Row label="Coup de Pouce" value={est.coup_de_pouce ? 'Oui' : 'Non'} />
          <Row label="Équipement actuel" value={est.equipement_actuel ?? '—'} />
          <Row label="Sauts DPE" value={est.sauts_dpe ?? '—'} />
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Gestes</p>
            <ul className="text-sm space-y-1">
              {est.gestes.map((g, i) => (
                <li key={i} className="flex justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{g.label ?? g.id}</span>
                  <span className="text-gray-400 font-mono text-xs">{g.baremeId ?? g.id}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Résultats */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-3">Résultats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">MPR Total</p>
              <p className="text-xl font-bold text-gray-900">{formatEuro(est.mpr_total)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CEE fourchette</p>
              <p className="text-sm font-medium text-gray-900">
                {formatEuro(est.cee_fourchette_bas)} – {formatEuro(est.cee_fourchette_haut)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Coup de Pouce</p>
              <p className="text-xl font-bold text-gray-900">{formatEuro(est.coup_pouce_estimation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Écrêtement</p>
              <p className="text-xl font-bold text-gray-900">
                {est.ecretement_pct ? `${est.ecretement_pct}%` : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Reste à charge</p>
              <p className="text-sm font-medium text-gray-900">
                {formatEuro(est.reste_a_charge_bas)} – {formatEuro(est.reste_a_charge_haut)}
              </p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <p className="text-xs text-gray-500">Consentement RGPD</p>
              <p className="text-sm font-medium text-gray-900">
                RGPD : {est.consent_rgpd ? 'Oui' : 'Non'} · Démarchage :{' '}
                {est.consent_demarchage ? 'Oui' : 'Non'}
              </p>
            </div>
          </div>
        </section>

        {/* Barème IDs */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-3">
            IDs barèmes utilisés ({est.bareme_ids?.length ?? 0})
          </h2>
          <div className="flex flex-wrap gap-2">
            {(est.bareme_ids ?? []).map((id) => (
              <code key={id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                {id}
              </code>
            ))}
          </div>
        </section>

        {/* Formule debug */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 md:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-3">
            Formule debug — pipeline ({est.formule_debug?.length ?? 0} étapes)
          </h2>
          <div className="space-y-3">
            {(est.formule_debug ?? []).map((step, i) => (
              <details key={i} className="border border-gray-200 rounded-lg">
                <summary className="px-3 py-2 cursor-pointer font-mono text-sm text-gray-800 bg-gray-50 rounded-t-lg">
                  {i + 1}. {step.step}
                  {step.baremeIds && step.baremeIds.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({step.baremeIds.length} barèmes)
                    </span>
                  )}
                </summary>
                <pre className="p-3 text-xs overflow-auto bg-white rounded-b-lg">
                  {JSON.stringify(step, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
