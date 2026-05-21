const DEFAULT_BASE_URL_FALLBACK = 'https://servicesartisans.fr'
const DEFAULT_TIMEOUT_MS = 30_000

function resolveBaseUrl(explicit) {
  if (explicit) return explicit
  if (process.env.SA_API_BASE_URL) return process.env.SA_API_BASE_URL
  return DEFAULT_BASE_URL_FALLBACK
}

export async function httpGet(path, { baseUrl, query, timeoutMs } = {}) {
  const url = new URL(path, resolveBaseUrl(baseUrl))
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return doRequest(url, { method: 'GET', timeoutMs })
}

export async function httpPost(path, body, { baseUrl, timeoutMs } = {}) {
  const url = new URL(path, resolveBaseUrl(baseUrl))
  return doRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    timeoutMs,
  })
}

async function doRequest(url, { method, body, headers, timeoutMs }) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs ?? DEFAULT_TIMEOUT_MS)
  try {
    const response = await fetch(url.toString(), {
      method,
      body,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'sa-rge-os/0.1.0',
        ...(headers ?? {}),
      },
      signal: controller.signal,
    })
    const text = await response.text()
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = { _raw: text }
    }
    let headersOut = {}
    if (response.headers && typeof response.headers.entries === 'function') {
      headersOut = Object.fromEntries(response.headers.entries())
    } else if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((value, key) => {
        headersOut[key] = value
      })
    }
    return { status: response.status, body: parsed, headers: headersOut }
  } finally {
    clearTimeout(timer)
  }
}
