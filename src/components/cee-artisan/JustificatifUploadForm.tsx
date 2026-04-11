'use client'

/**
 * JustificatifUploadForm — formulaire artisan d'upload d'une pièce justificative
 * CEE. Client Component (state + fetch multipart). Utilise l'API route
 * `POST /api/cee/dossiers/[id]/justificatifs`.
 *
 * Le formulaire affiche la liste des pièces requises (`requis`) et propose
 * en priorité celles qui sont encore manquantes (`missing`).
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import type { JustificatifRequis } from '@/lib/cee/justificatifs'

interface JustificatifUploadFormProps {
  dossierId: string
  requis: JustificatifRequis[]
  missing: string[]
}

type FormState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }

const ERROR_MESSAGES: Record<string, string> = {
  invalid_input: 'Données invalides.',
  invalid_file: 'Fichier invalide.',
  mime_type_rejected: 'Type de fichier non accepté (JPG, PNG, WebP, HEIC, PDF).',
  empty_file: 'Le fichier est vide.',
  file_too_large: 'Fichier trop volumineux (25 Mo maximum).',
  exif_geotag_missing:
    'La photo doit contenir un géotag GPS et un horodatage EXIF (obligation légale).',
  storage_upload_failed: 'Échec de l’envoi vers le stockage.',
  dossier_update_failed: 'Échec de la mise à jour du dossier.',
  unauthorized: 'Session expirée, reconnectez-vous.',
  forbidden: 'Vous n’avez pas accès à ce dossier.',
  not_found: 'Dossier introuvable.',
}

function humanizeError(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Une erreur est survenue lors de l’envoi.'
}

export default function JustificatifUploadForm({
  dossierId,
  requis,
  missing,
}: JustificatifUploadFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<FormState>({ kind: 'idle' })

  // Pré-sélectionner la première pièce manquante si disponible.
  const defaultCode = missing[0] ?? requis[0]?.code ?? ''
  const [code, setCode] = useState<string>(defaultCode)
  const [file, setFile] = useState<File | null>(null)

  const selectedRequis = requis.find((r) => r.code === code)
  const label = selectedRequis?.label ?? ''

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file || !code) {
      setState({ kind: 'error', message: 'Sélectionnez une pièce et un fichier.' })
      return
    }
    setState({ kind: 'submitting' })

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('code', code)
      formData.append('label', label || code)

      const res = await fetch(`/api/cee/dossiers/${dossierId}/justificatifs`, {
        method: 'POST',
        body: formData,
      })

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
      }

      if (!res.ok || json.ok === false) {
        let errorCode = json.error ?? 'unknown_error'
        if (res.status === 401) errorCode = 'unauthorized'
        else if (res.status === 403) errorCode = 'forbidden'
        else if (res.status === 404) errorCode = 'not_found'
        setState({ kind: 'error', message: humanizeError(errorCode) })
        return
      }

      setState({ kind: 'success', message: 'Pièce envoyée avec succès.' })
      setFile(null)
      // Force refresh server component (liste + gap)
      startTransition(() => {
        router.refresh()
      })
    } catch {
      setState({ kind: 'error', message: 'Erreur réseau, réessayez.' })
    }
  }

  const submitting = state.kind === 'submitting' || isPending

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-5"
      aria-label="Envoyer une pièce justificative"
    >
      <div>
        <label htmlFor="cee-just-code" className="mb-1 block text-sm font-medium text-gray-900">
          Type de pièce
        </label>
        <select
          id="cee-just-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={submitting || requis.length === 0}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {requis.length === 0 && <option value="">Aucune pièce requise pour ce dossier</option>}
          {requis.map((r) => (
            <option key={r.code} value={r.code}>
              {r.label}
              {missing.includes(r.code) ? ' — manquante' : ''}
              {r.obligatoire ? ' (obligatoire)' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cee-just-file" className="mb-1 block text-sm font-medium text-gray-900">
          Fichier (JPG, PNG, HEIC, PDF — 25 Mo max)
        </label>
        <input
          id="cee-just-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={submitting}
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          required
        />
      </div>

      {state.kind === 'error' && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      {state.kind === 'success' && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !file || !code}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" aria-hidden="true" />
            Envoyer la pièce
          </>
        )}
      </button>
    </form>
  )
}
