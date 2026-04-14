/**
 * Submit hooks — Simulateur aides rénovation
 *
 * Fire-and-forget hook called by /api/simulateur/submit after the estimation
 * row has been persisted. Calls Pipedrive; on failure, inserts a row in
 * simulateur_pipedrive_failures (DLQ) so the cron retry can replay it.
 *
 * Never throws — fully isolated from the main submit flow.
 */

import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createSimulateurDeal,
  isSimulateurPipedriveConfigured,
  type SimulateurLeadInput,
} from './pipedrive'

interface RunPipedriveHookArgs {
  estimationId: string // uuid PK of simulateur_estimations
  input: SimulateurLeadInput
}

/**
 * Runs the Pipedrive sync in fire-and-forget mode.
 * On success: updates simulateur_estimations.pipedrive_deal_id.
 * On failure: inserts into simulateur_pipedrive_failures (DLQ).
 * Never throws.
 */
export async function runPipedriveHook(args: RunPipedriveHookArgs): Promise<void> {
  const { estimationId, input } = args

  if (!isSimulateurPipedriveConfigured()) {
    logger.warn('simulateur-pipedrive: skipped — not configured', {
      estimationId,
      publicId: input.publicId,
    })
    return
  }

  const supabase = createAdminClient()

  try {
    const result = await createSimulateurDeal(input)
    await supabase
      .from('simulateur_estimations')
      .update({ pipedrive_deal_id: String(result.dealId) })
      .eq('id', estimationId)
    logger.info('simulateur-pipedrive: synced', {
      estimationId,
      publicId: input.publicId,
      dealId: result.dealId,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    logger.error('simulateur-pipedrive: sync failed, inserting DLQ', {
      estimationId,
      publicId: input.publicId,
      message,
    })
    try {
      // RGPD: ne pas stocker de PII dans le payload JSONB de la DLQ. Le cron
      // retry rehydratera prenom/nom/email/telephone depuis simulateur_estimations
      // via estimation_id. On conserve uniquement le discriminator `kind`.
      await supabase.from('simulateur_pipedrive_failures').insert({
        estimation_id: estimationId,
        payload: { kind: 'submit' } as unknown as Record<string, unknown>,
        error: message.slice(0, 2000),
        retry_count: 0,
        next_retry_at: new Date().toISOString(),
      })
    } catch (dlqErr) {
      // Last resort: nothing else to do, just log loudly
      logger.error('simulateur-pipedrive: DLQ insert failed', {
        estimationId,
        publicId: input.publicId,
        err: dlqErr instanceof Error ? dlqErr.message : String(dlqErr),
      })
    }
  }
}
