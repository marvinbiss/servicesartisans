/**
 * Pure response capture + formatting helpers.
 *
 * `captureResponse(res, startedAt)` reads the body once, classifies it
 * (`json` / `text` / `binary`), pretty-prints JSON when possible, and
 * captures headers + status + wall-clock duration into a single
 * `ResponseDisplay` object the UI can render synchronously.
 *
 * `statusBadgeClass(status)` maps the HTTP status into one of the four
 * Tailwind token combos allowed for this page (accent / yellow / red /
 * charcoal). Kept here rather than inline so it can be unit-tested without
 * spinning up a DOM.
 */

export type ResponseDisplay = {
  status: number
  statusText: string
  durationMs: number
  headers: Record<string, string>
  bodyText: string
  bodyKind: 'json' | 'text' | 'binary'
  bodyPretty: string
}

export async function captureResponse(res: Response, startedAt: number): Promise<ResponseDisplay> {
  const headersObj: Record<string, string> = {}
  res.headers.forEach((v, k) => {
    headersObj[k] = v
  })

  const contentType = res.headers.get('content-type') ?? ''
  const text = await res.text()

  let bodyKind: ResponseDisplay['bodyKind'] = 'text'
  let bodyPretty = text
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    bodyKind = 'json'
    try {
      bodyPretty = JSON.stringify(JSON.parse(text), null, 2)
    } catch {
      bodyPretty = text
    }
  } else if (contentType.includes('image/') || contentType.includes('application/octet-stream')) {
    bodyKind = 'binary'
    bodyPretty = `[binary content, ${text.length} bytes]`
  }

  return {
    status: res.status,
    statusText: res.statusText,
    durationMs: Date.now() - startedAt,
    headers: headersObj,
    bodyText: text,
    bodyKind,
    bodyPretty,
  }
}

export function statusBadgeClass(status: number): string {
  if (status >= 200 && status < 300) return 'bg-accent-100 text-accent-800'
  if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800'
  if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800'
  if (status >= 500) return 'bg-red-100 text-red-800'
  return 'bg-charcoal-100 text-charcoal-700'
}
