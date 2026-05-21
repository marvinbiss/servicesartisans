/**
 * Thin wrapper around globalThis.fetch that short-circuits when dry-run mode is
 * active. Sprint 1 is dry-run only: every store CLI passes { dryRun: true } so
 * no real HTTP request is fired. Sprint 2 will wire real submissions behind
 * --no-dry-run + env-gated tokens (none committed).
 */
export async function fetchOrDryRun(url, init = {}, { dryRun = true } = {}) {
  if (dryRun) {
    return {
      ok: true,
      status: 0,
      statusText: 'dry-run',
      dryRun: true,
      url,
      method: (init && init.method) || 'GET',
    }
  }
  const res = await fetch(url, init)
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    dryRun: false,
    url,
    method: (init && init.method) || 'GET',
  }
}
