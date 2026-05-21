/**
 * Default Critic config.
 *
 * `blockThreshold` deliberately set high enough that a single block-severity
 * reason from the rubric collapses the verdict — YMYL outputs are fail-closed.
 * Bump `criticVersion` whenever the prompt or rubric changes so downstream
 * audit logs can correlate verdicts with the exact reviewer behavior.
 */

import type { CriticConfig } from './types'

export const DEFAULT_CRITIC_CONFIG: CriticConfig = {
  blockThreshold: 0.5,
  reviseThreshold: 0.85,
  criticVersion: 'v0.1.0',
  timeoutMs: 15_000,
}
