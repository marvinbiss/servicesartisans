import { logger } from '@/lib/logger'

export async function pingHeartbeat(name: string): Promise<void> {
  const url = process.env[`BETTERSTACK_HEARTBEAT_${name.toUpperCase().replace(/-/g, '_')}`]
  if (!url) return
  try {
    await fetch(url, { method: 'GET', signal: AbortSignal.timeout(5000) })
  } catch (error) {
    logger.warn(`Heartbeat ping failed for ${name}`, { error })
  }
}
