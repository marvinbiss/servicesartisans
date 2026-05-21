/**
 * Barrel export for webhooks library — RGE-OS pillar 8.
 *
 * Consumers should import from `@/lib/webhooks` (not from sub-paths)
 * so refactors of internal file layout don't ripple outward.
 */

export {
  deliverWebhook,
  signPayload,
  verifyPayloadSignature,
  generateSecret,
  generateApiKey,
  hashApiKey,
  type DeliveryResult,
} from './delivery'

export {
  ALL_EVENTS,
  isValidEvent,
  mockPayloadFor,
  type WebhookEvent,
  type WebhookPayloadByEvent,
} from './events'

export { validateWebhookUrl, validateEmail, type ValidationResult } from './validation'
