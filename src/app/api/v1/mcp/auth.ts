import { logger } from '@/lib/logger'

/**
 * Bearer token check pour MCP server.
 *
 * v0 : token optionnel via env `MCP_BEARER_TOKEN`. Si défini, le header
 * `Authorization: Bearer <token>` est requis. Sinon endpoint public
 * (rate-limited en amont par middleware).
 *
 * v0.2 : multi-tenant tokens via DB table `mcp_clients` (1 token =
 * 1 partenaire, audit log par tenant, quota personnalisé).
 *
 * Comparison timing-safe : on évite `===` qui retournerait early sur
 * le premier byte différent, ce qui leak la longueur via timing
 * (CWE-208). On compare octet par octet sur la même longueur.
 */
export type AuthResult = { authorized: true } | { authorized: false; reason: string }

export function checkMCPAuth(authHeader: string | null): AuthResult {
  const expectedToken = process.env.MCP_BEARER_TOKEN
  if (!expectedToken || expectedToken.length === 0) {
    // Public mode — no token configured.
    return { authorized: true }
  }
  if (!authHeader) {
    return { authorized: false, reason: 'missing_authorization_header' }
  }
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return { authorized: false, reason: 'invalid_authorization_scheme' }
  }
  const providedRaw = match[1].trim()
  if (providedRaw.length === 0) {
    return { authorized: false, reason: 'empty_token' }
  }

  const provided = Buffer.from(providedRaw, 'utf8')
  const expected = Buffer.from(expectedToken, 'utf8')
  if (provided.length !== expected.length) {
    return { authorized: false, reason: 'token_mismatch' }
  }
  let diff = 0
  for (let i = 0; i < provided.length; i++) {
    diff |= provided[i] ^ expected[i]
  }
  if (diff !== 0) {
    logger.warn('mcp.auth.token_mismatch')
    return { authorized: false, reason: 'token_mismatch' }
  }
  return { authorized: true }
}
