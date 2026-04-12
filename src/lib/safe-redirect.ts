/**
 * Validate that a redirect path is safe (relative, no open redirect).
 * Handles URL-encoded slashes (%2F), backslash tricks (\/\/), and protocol schemes.
 */
export function isSafeRedirectPath(path: string): boolean {
  if (!path || typeof path !== 'string') return false

  let decoded: string
  try {
    decoded = decodeURIComponent(path)
  } catch {
    return false
  }

  if (!decoded.startsWith('/')) return false

  const normalized = decoded.replace(/\\/g, '/')

  if (normalized.startsWith('//')) return false

  if (/^\/\w+:/.test(normalized)) return false

  return true
}

export function getSafeRedirectPath(path: string | null | undefined, fallback = '/'): string {
  if (!path) return fallback
  return isSafeRedirectPath(path) ? path : fallback
}
