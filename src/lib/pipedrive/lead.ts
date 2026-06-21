/**
 * Intégration Pipedrive — pousse les leads de la landing d'acquisition
 * dans le CRM (Person + Lead + Note).
 *
 * Server-only. Best-effort : toute erreur est loggée mais ne casse jamais
 * la capture du lead (email + réponse à l'artisan restent prioritaires).
 *
 * Config (env, jamais en dur) :
 * - PIPEDRIVE_API_TOKEN : token API perso (Settings → API)
 * - PIPEDRIVE_DOMAIN    : sous-domaine de la société (ex: "servicesartisans"
 *                          pour servicesartisans.pipedrive.com)
 */
import { logger } from '@/lib/logger'

export interface PipedriveLeadInput {
  prenom: string
  metier: string
  ville: string
  codePostal?: string
  telephone: string
  email?: string
  utm?: Record<string, string>
}

interface PipedriveResponse<T> {
  success: boolean
  data?: T
}

export async function pushLeadToPipedrive(input: PipedriveLeadInput): Promise<void> {
  const token = process.env.PIPEDRIVE_API_TOKEN
  const domain = process.env.PIPEDRIVE_DOMAIN
  if (!token || !domain) return // non configuré → no-op silencieux

  const base = `https://${encodeURIComponent(domain)}.pipedrive.com/api/v1`

  const post = async <T>(path: string, body: unknown): Promise<T | null> => {
    try {
      const res = await fetch(`${base}${path}?api_token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = (await res.json()) as PipedriveResponse<T>
      if (!res.ok || !json.success) {
        logger.error('Pipedrive API non-OK', { path, status: res.status })
        return null
      }
      return json.data ?? null
    } catch (err) {
      logger.error('Pipedrive API fetch failed', { path, err })
      return null
    }
  }

  try {
    // 1) Person
    const person = await post<{ id: number }>('/persons', {
      name: `${input.prenom} — ${input.metier}`,
      phone: [{ value: input.telephone, primary: true, label: 'mobile' }],
      ...(input.email
        ? { email: [{ value: input.email, primary: true, label: 'work' }] }
        : {}),
    })

    // 2) Lead (rattaché à la person si créée)
    const lead = await post<{ id: string }>('/leads', {
      title: `Artisan — ${input.metier} à ${input.ville}`,
      ...(person?.id ? { person_id: person.id } : {}),
    })

    // 3) Note avec le détail (utm, localisation)
    if (lead?.id) {
      const utmLine = input.utm
        ? Object.entries(input.utm)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join(' · ')
        : ''
      const content = [
        `Prénom : ${input.prenom}`,
        `Métier : ${input.metier}`,
        `Zone : ${input.codePostal ?? ''} ${input.ville}`.trim(),
        `Téléphone : ${input.telephone}`,
        `Email : ${input.email || 'non fourni'}`,
        utmLine ? `Attribution : ${utmLine}` : '',
        'Source : landing publicitaire /artisans/rejoindre',
      ]
        .filter(Boolean)
        .join('\n')

      await post('/notes', { content, lead_id: lead.id })
    }
  } catch (err) {
    logger.error('pushLeadToPipedrive failed', err)
  }
}
