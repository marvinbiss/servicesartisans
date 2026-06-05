'use client'

/**
 * Client Component — Tableau éditable des délégataires CEE.
 * Toggle `actif` : bascule le champ `statut` entre 'actif' et 'inactif'.
 * Édition : SIRET (14 chiffres) + notes via inline form.
 */

import { Fragment, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Pencil,
  Save,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export type DelegataireType = 'obligated' | 'delegated' | 'mandataire'
export type DelegataireStatut = 'partenaire' | 'prospect' | 'actif' | 'inactif'

export interface Delegataire {
  id: string
  slug: string
  nom_commercial: string
  raison_sociale: string
  siret: string | null
  type: DelegataireType
  vague_priorite: number
  statut: DelegataireStatut
  url_site: string | null
  operations_supportees: string[]
  notes: string | null
  updated_at: string | null
}

interface Props {
  initialData: Delegataire[]
}

const TYPE_LABEL: Record<DelegataireType, string> = {
  obligated: 'Obligé',
  delegated: 'Délégataire',
  mandataire: 'Mandataire',
}

const STATUT_LABEL: Record<DelegataireStatut, string> = {
  partenaire: 'Partenaire',
  prospect: 'Prospect',
  actif: 'Actif',
  inactif: 'Inactif',
}

const STATUT_CLASS: Record<DelegataireStatut, string> = {
  partenaire: 'bg-sand-100 text-charcoal-700 border-sand-300',
  prospect: 'bg-sand-50 text-charcoal-600 border-sand-200',
  actif: 'bg-green-50 text-green-700 border-green-200',
  inactif: 'bg-red-50 text-red-700 border-red-200',
}

function isActiveStatut(statut: DelegataireStatut): boolean {
  return statut === 'actif' || statut === 'partenaire'
}

export function DelegatairesTable({ initialData }: Props) {
  const [rows, setRows] = useState<Delegataire[]>(initialData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSiret, setEditSiret] = useState<string>('')
  const [editNotes, setEditNotes] = useState<string>('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const patch = async (
    id: string,
    body: { statut?: DelegataireStatut; siret?: string | null; notes?: string | null }
  ): Promise<Delegataire | null> => {
    const res = await fetch(`/api/admin/cee-delegataires/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as {
        error?: { message?: string }
      }
      throw new Error(payload.error?.message ?? 'Erreur lors de la mise à jour')
    }
    const payload = (await res.json()) as { delegataire: Delegataire }
    return payload.delegataire ?? null
  }

  const handleToggleActif = async (row: Delegataire) => {
    setBusyId(row.id)
    setError(null)
    try {
      const next: DelegataireStatut = isActiveStatut(row.statut) ? 'inactif' : 'actif'
      const updated = await patch(row.id, { statut: next })
      if (updated) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (row: Delegataire) => {
    setEditingId(row.id)
    setEditSiret(row.siret ?? '')
    setEditNotes(row.notes ?? '')
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditSiret('')
    setEditNotes('')
  }

  const saveEdit = async (row: Delegataire) => {
    setBusyId(row.id)
    setError(null)
    try {
      const trimmedSiret = editSiret.trim()
      const trimmedNotes = editNotes.trim()
      const updated = await patch(row.id, {
        siret: trimmedSiret.length > 0 ? trimmedSiret : null,
        notes: trimmedNotes.length > 0 ? trimmedNotes : null,
      })
      if (updated) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      }
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-sand-200 bg-white p-12 text-center">
          <p className="text-sm text-charcoal-500">Aucun délégataire enregistré.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-sand-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sand-200">
              <thead className="bg-sand-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Dénomination
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    SIRET
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Vague
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Actif
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Opérations
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Site
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100 bg-white">
                {rows.map((row) => {
                  const isEditing = editingId === row.id
                  const busy = busyId === row.id
                  const active = isActiveStatut(row.statut)
                  return (
                    <Fragment key={row.id}>
                      <tr className="hover:bg-sand-50">
                        <td className="px-4 py-3 text-sm font-mono text-charcoal-700">
                          {row.slug}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium text-charcoal-900">{row.nom_commercial}</div>
                          <div className="text-xs text-charcoal-500">{row.raison_sociale}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-charcoal-700">
                          {row.siret ?? <span className="text-charcoal-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-700">
                          {TYPE_LABEL[row.type]}
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-700">
                          {row.vague_priorite}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUT_CLASS[row.statut]}`}
                          >
                            {STATUT_LABEL[row.statut]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => handleToggleActif(row)}
                            disabled={busy}
                            role="switch"
                            aria-checked={active}
                            aria-label={`Basculer le statut actif de ${row.nom_commercial}`}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              active ? 'bg-green-600' : 'bg-sand-300'
                            } ${busy ? 'opacity-50' : ''}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-charcoal-700">
                          {row.operations_supportees.length}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.url_site ? (
                            <a
                              href={row.url_site}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Site
                            </a>
                          ) : (
                            <span className="text-charcoal-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {!isEditing && (
                            <button
                              type="button"
                              onClick={() => startEdit(row)}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-lg border border-sand-200 px-2.5 py-1.5 text-xs font-medium text-charcoal-700 hover:bg-sand-50 disabled:opacity-50"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Éditer
                            </button>
                          )}
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="bg-sand-100/40">
                          <td colSpan={10} className="px-4 py-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                                  SIRET (14 chiffres, vide pour retirer)
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={editSiret}
                                  onChange={(e) => setEditSiret(e.target.value)}
                                  maxLength={14}
                                  placeholder="14 chiffres"
                                  className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                              <div className="flex-[2]">
                                <label className="block text-xs font-medium text-charcoal-700 mb-1">
                                  Notes
                                </label>
                                <textarea
                                  value={editNotes}
                                  onChange={(e) => setEditNotes(e.target.value)}
                                  rows={2}
                                  maxLength={2000}
                                  className="w-full rounded-lg border border-sand-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                                />
                              </div>
                              <div className="flex gap-2 md:mt-5">
                                <button
                                  type="button"
                                  onClick={() => saveEdit(row)}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 rounded-lg bg-primary-500 px-3 py-2 text-xs font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                                >
                                  {busy ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Save className="w-3.5 h-3.5" />
                                  )}
                                  Enregistrer
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  disabled={busy}
                                  className="inline-flex items-center gap-1 rounded-lg border border-sand-200 px-3 py-2 text-xs font-medium text-charcoal-700 hover:bg-sand-50 disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Annuler
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-charcoal-500">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          Actif = statut 'actif' ou 'partenaire'
        </span>
        <span className="inline-flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Inactif = statut 'inactif' ou 'prospect'
        </span>
      </div>
    </div>
  )
}
