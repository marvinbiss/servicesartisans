/**
 * /espace-artisan/cee/[dossierId] — détail d'un dossier CEE artisan.
 *
 * Server Component :
 *   - Auth obligatoire (redirect /connexion sinon)
 *   - Vérifie que le dossier appartient au provider lié au user (`user_id`)
 *   - Affiche : données engagement, pastille statut, gap justificatifs,
 *     timeline `cee_dossier_events`, liste des justificatifs déjà fournis,
 *     formulaire d'upload (Client Component).
 */

import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Euro, FileCheck2, MapPin, ThermometerSun, Hash } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { createClient } from '@/lib/supabase/server'
import { getCeeDossierById } from '@/lib/cee/dossiers'
import { getJustificatifsGap, getJustificatifsRequisForOperation } from '@/lib/cee/justificatifs'
import type { CeeDossierEvent } from '@/lib/cee/dossier-types'
import StatusBadge from '@/components/cee-artisan/StatusBadge'
import JustificatifGapBadge from '@/components/cee-artisan/JustificatifGapBadge'
import DossierTimeline from '@/components/cee-artisan/DossierTimeline'
import JustificatifUploadForm from '@/components/cee-artisan/JustificatifUploadForm'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Détail dossier CEE — Espace artisan',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ dossierId: string }>
}

function formatEuros(value: number | null): string {
  if (value === null || value === undefined) return '—'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })
}

async function fetchDossierEvents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string
): Promise<CeeDossierEvent[]> {
  const { data, error } = await supabase
    .from('cee_dossier_events')
    .select(
      'id, dossier_id, event_type, from_status, to_status, actor_type, actor_id, payload, created_at'
    )
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []
  return data as unknown as CeeDossierEvent[]
}

export default async function CeeDossierDetailPage({ params }: PageProps) {
  const { dossierId } = await params
  const supabase = await createClient()

  // --- Auth ---------------------------------------------------------------
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(`/connexion?redirect=/espace-artisan/cee/${dossierId}`)
  }

  // --- Dossier ------------------------------------------------------------
  const dossier = await getCeeDossierById(supabase, dossierId)
  if (!dossier) notFound()

  // --- Ownership check ----------------------------------------------------
  const { data: provider } = await supabase
    .from('providers')
    .select('id, user_id')
    .eq('id', dossier.provider_id)
    .maybeSingle()

  const providerRow = provider as { id: string; user_id: string | null } | null
  if (!providerRow || providerRow.user_id !== user.id) {
    // On masque volontairement l'existence du dossier — 404 plutôt que 403
    notFound()
  }

  // --- Data auxiliaire en parallèle ---------------------------------------
  const [gap, requis, events] = await Promise.all([
    getJustificatifsGap(supabase, dossier.id),
    getJustificatifsRequisForOperation(supabase, dossier.operation_code),
    fetchDossierEvents(supabase, dossier.id),
  ])

  const infoItems: Array<{ icon: typeof Hash; label: string; value: string }> = [
    { icon: Hash, label: 'Code opération', value: dossier.operation_code },
    {
      icon: Euro,
      label: 'Prime estimée',
      value: formatEuros(dossier.prime_estimee_eur),
    },
    {
      icon: Calendar,
      label: 'Engagement',
      value: formatDate(dossier.date_engagement),
    },
    {
      icon: Calendar,
      label: 'Pré-visite',
      value: formatDate(dossier.date_pre_visite),
    },
    {
      icon: Calendar,
      label: 'Début travaux',
      value: formatDate(dossier.date_debut_travaux),
    },
    {
      icon: Calendar,
      label: 'Fin travaux',
      value: formatDate(dossier.date_fin_travaux),
    },
    {
      icon: MapPin,
      label: 'Code postal',
      value: dossier.postal_code ?? '—',
    },
    {
      icon: ThermometerSun,
      label: 'Zone climatique',
      value: dossier.zone_climatique ?? '—',
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: 'Espace Artisan', href: '/espace-artisan' },
              { label: 'Dossiers CEE', href: '/espace-artisan/cee' },
              { label: dossier.operation_code },
            ]}
          />
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/espace-artisan/cee"
            className="mb-3 inline-flex items-center gap-1 text-sm text-primary-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à la liste
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Dossier CEE {dossier.operation_code}</h1>
            <StatusBadge
              status={dossier.status}
              className="!bg-white/15 !text-white !border-white/20"
            />
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="space-y-6 lg:col-span-2">
            {/* Infos engagement */}
            <section
              aria-label="Informations d'engagement"
              className="rounded-xl border border-sand-300 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-charcoal-900">
                Informations du dossier
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {infoItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <Icon
                        className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-400"
                        aria-hidden="true"
                      />
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-charcoal-500">
                          {item.label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold text-charcoal-900">
                          {item.value}
                        </dd>
                      </div>
                    </div>
                  )
                })}
              </dl>
            </section>

            {/* Justificatifs fournis */}
            <section
              aria-label="Pièces justificatives fournies"
              className="rounded-xl border border-sand-300 bg-white p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-charcoal-900">Pièces fournies</h2>
                <JustificatifGapBadge gap={gap} />
              </div>
              {dossier.justificatifs.length === 0 ? (
                <p className="text-sm text-charcoal-500">
                  Aucune pièce enregistrée pour le moment.
                </p>
              ) : (
                <ul className="space-y-2" role="list">
                  {dossier.justificatifs.map((j, idx) => (
                    <li
                      key={`${j.code}-${idx}`}
                      className="flex items-start gap-3 rounded-lg border border-sand-200 bg-sand-50 p-3"
                    >
                      <FileCheck2
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-charcoal-900">{j.label}</p>
                        <p className="text-xs text-charcoal-500">
                          Déposée le {formatDate(j.uploaded_at)}
                          {j.verified_at && ' · vérifiée'}
                          {j.exif_geotag_verified && ' · EXIF validé'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Timeline */}
            <section
              aria-label="Chronologie du dossier"
              className="rounded-xl border border-sand-300 bg-white p-6"
            >
              <h2 className="mb-4 text-lg font-semibold text-charcoal-900">Historique</h2>
              <DossierTimeline events={events} />
            </section>
          </div>

          {/* Colonne droite — upload */}
          <aside className="space-y-6" aria-label="Ajouter une pièce">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-600">
                Envoyer une pièce
              </h2>
              <JustificatifUploadForm
                dossierId={dossier.id}
                requis={requis}
                missing={gap.missing}
              />
            </section>
          </aside>
        </div>
      </main>
    </div>
  )
}
