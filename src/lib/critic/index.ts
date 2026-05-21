/**
 * Public surface of the Critic.
 *
 * Agents import from `@/lib/critic` only — never from a subpath. The Critic
 * has exactly two entrypoints for callers: `isYMYL()` for gating, and
 * `critique()` for the actual second-pass verification.
 */

export { critique } from './critic'
export { isYMYL } from './classifier'
export type { IsYMYLInput, IsYMYLResult } from './classifier'
export { YMYL_CRITIC_VERSION } from './prompts/ymyl-critic-system'
export { DEFAULT_CRITIC_CONFIG } from './config'
export type {
  YMYLContext,
  CriticInput,
  CriticDimension,
  CriticSeverity,
  CriticReason,
  CriticDecision,
  CriticApprove,
  CriticRevise,
  CriticBlock,
  CriticVerdict,
  CriticConfig,
} from './types'
