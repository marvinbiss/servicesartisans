/**
 * Client Component — interactive Try-it-now console.
 *
 * Reads the OpenAPI 3.1 const at hydration, builds an ordered operation
 * list, and renders a two-column layout : request editor on the left
 * (endpoint select, base URL, parameters form, JSON body textarea, custom
 * headers, Send button) and response viewer on the right (status badge,
 * timing, headers, pretty body). Below the response: a
 * `localStorage`-backed history list (capped at 20).
 *
 * The Send button fires a regular `fetch()` straight from the browser to
 * the public API — no SA backend route in the loop. We never persist the
 * request body server-side either. The history is local to the browser.
 *
 * Companion to:
 *  - `/developpeurs/api-catalog` (Ralph 33) — one-line panorama
 *  - `/developpeurs/api-explorer` (Ralph 36) — read-only operation cards
 *  - `/developpeurs/schema-explorer` (Ralph 38) — schema browser
 */

'use client'
import { useEffect, useMemo, useState } from 'react'

import { flattenSpec } from './_flatten-spec'
import { clearHistory, loadHistory, pushHistory } from './_local-storage'
import { buildCurl, buildRequest } from './_request-builder'
import { captureResponse, statusBadgeClass, type ResponseDisplay } from './_response-formatter'
import type { FormState, HistoryEntry, OpLite } from './_types'

const DEFAULT_BASE_URL = 'https://servicesartisans.fr'

export function TryClient({ spec }: { spec: unknown }) {
  const operations = useMemo(() => flattenSpec(spec), [spec])
  const [opId, setOpId] = useState<string>(operations[0]?.id ?? '')
  const op: OpLite | null = operations.find((o) => o.id === opId) ?? null

  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL)
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [bodyText, setBodyText] = useState('')
  const [customHeaders, setCustomHeaders] = useState('')
  const [response, setResponse] = useState<ResponseDisplay | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory())

  useEffect(() => {
    if (!op) return
    setBodyText(op.bodySample)
    setParamValues(Object.fromEntries(op.parameters.map((p) => [p.name, p.example ?? ''])))
    setResponse(null)
    setError(null)
  }, [op])

  const form: FormState = { opId, baseUrl, paramValues, bodyText, customHeaders }
  const built = op ? buildRequest(op, form) : null
  const curl = built ? buildCurl(built) : ''

  async function onSend() {
    if (!op || !built) return
    if (built.error) {
      setError(built.error)
      return
    }
    setError(null)
    setSending(true)
    const startedAt = Date.now()
    try {
      const init: RequestInit = {
        method: built.method,
        headers: built.headers,
        mode: 'cors',
      }
      if (built.body !== null) init.body = built.body
      const res = await fetch(built.url, init)
      const display = await captureResponse(res, startedAt)
      setResponse(display)
      const entry: HistoryEntry = {
        ts: Date.now(),
        opId: op.id,
        method: op.method,
        url: built.url,
        status: display.status,
        durationMs: display.durationMs,
        responseExcerpt: display.bodyPretty.slice(0, 240),
      }
      pushHistory(entry)
      setHistory(loadHistory())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSending(false)
    }
  }

  function onClearHistory() {
    clearHistory()
    setHistory([])
  }

  if (operations.length === 0) {
    return <p className="text-sm text-charcoal-700">Aucune opération chargée.</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section aria-label="Requête" className="space-y-4">
        <div>
          <label
            htmlFor="try-opId"
            className="block text-xs font-semibold uppercase tracking-wide text-charcoal-600"
          >
            Endpoint
          </label>
          <select
            id="try-opId"
            value={opId}
            onChange={(e) => setOpId(e.target.value)}
            className="mt-1 w-full rounded border border-charcoal-200 bg-white px-2 py-1.5 font-mono text-sm"
          >
            {operations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.method} {o.path} — {o.summary}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="try-baseUrl"
            className="block text-xs font-semibold uppercase tracking-wide text-charcoal-600"
          >
            Base URL
          </label>
          <input
            id="try-baseUrl"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="mt-1 w-full rounded border border-charcoal-200 bg-white px-2 py-1.5 font-mono text-sm"
          />
        </div>

        {op && op.parameters.length > 0 ? (
          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
              Parameters
            </legend>
            {op.parameters.map((p) => (
              <div key={`${p.in}-${p.name}`}>
                <label htmlFor={`try-p-${p.name}`} className="block text-xs text-charcoal-700">
                  <span className="font-mono">{p.name}</span>
                  <span className="ml-2 text-charcoal-500">
                    {p.in} · {p.type}
                    {p.required ? ' · required' : ''}
                  </span>
                </label>
                {p.enum ? (
                  <select
                    id={`try-p-${p.name}`}
                    value={paramValues[p.name] ?? ''}
                    onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                    className="mt-1 w-full rounded border border-charcoal-200 bg-white px-2 py-1 font-mono text-xs"
                  >
                    <option value="">(none)</option>
                    {p.enum.map((v) => (
                      <option key={String(v)} value={String(v)}>
                        {String(v)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`try-p-${p.name}`}
                    value={paramValues[p.name] ?? ''}
                    placeholder={p.example}
                    onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                    className="mt-1 w-full rounded border border-charcoal-200 bg-white px-2 py-1 font-mono text-xs"
                  />
                )}
              </div>
            ))}
          </fieldset>
        ) : null}

        {op && op.hasJsonBody ? (
          <div>
            <label
              htmlFor="try-body"
              className="block text-xs font-semibold uppercase tracking-wide text-charcoal-600"
            >
              Body (JSON)
            </label>
            <textarea
              id="try-body"
              rows={8}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="mt-1 w-full rounded border border-charcoal-200 bg-white p-2 font-mono text-xs"
            />
          </div>
        ) : null}

        <details>
          <summary className="cursor-pointer text-xs text-charcoal-600">
            Custom headers (one per line, Name: Value)
          </summary>
          <textarea
            rows={3}
            value={customHeaders}
            onChange={(e) => setCustomHeaders(e.target.value)}
            className="mt-1 w-full rounded border border-charcoal-200 bg-white p-2 font-mono text-xs"
          />
        </details>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSend}
            disabled={sending}
            className="rounded bg-accent-600 px-3 py-1.5 text-sm font-medium text-white disabled:bg-charcoal-300"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        {curl ? (
          <details>
            <summary className="cursor-pointer text-xs text-charcoal-600">Equivalent curl</summary>
            <pre className="mt-1 overflow-x-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
              {curl}
            </pre>
          </details>
        ) : null}
      </section>

      <section aria-label="Réponse" className="space-y-4">
        {response ? (
          <>
            <header className="flex flex-wrap items-baseline gap-2">
              <span
                className={`inline-flex rounded px-2 py-0.5 text-xs font-mono font-semibold ${statusBadgeClass(response.status)}`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-xs text-charcoal-600">{response.durationMs} ms</span>
            </header>
            <details open>
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-charcoal-600">
                Headers ({Object.keys(response.headers).length})
              </summary>
              <ul className="mt-1 space-y-0.5 text-xs">
                {Object.entries(response.headers).map(([k, v]) => (
                  <li key={k} className="font-mono">
                    <span className="text-charcoal-600">{k}</span>:{' '}
                    <span className="text-charcoal-900">{v}</span>
                  </li>
                ))}
              </ul>
            </details>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
                Body ({response.bodyKind})
              </h4>
              <pre className="mt-1 max-h-96 overflow-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
                {response.bodyPretty}
              </pre>
            </div>
          </>
        ) : (
          <p className="text-sm text-charcoal-600">Cliquer Send pour envoyer la requête.</p>
        )}

        {history.length > 0 ? (
          <details>
            <summary className="cursor-pointer text-xs text-charcoal-600">
              Historique ({history.length}) — local seulement
            </summary>
            <button
              type="button"
              onClick={onClearHistory}
              className="mt-1 text-xs text-red-700 underline"
            >
              Effacer l&apos;historique
            </button>
            <ul className="mt-2 space-y-1 text-xs">
              {history.map((h) => (
                <li key={h.ts} className="border-l-2 border-charcoal-200 pl-2">
                  <span
                    className={`inline-flex rounded px-1.5 py-0.5 font-mono font-semibold ${statusBadgeClass(h.status)}`}
                  >
                    {h.status}
                  </span>
                  <span className="ml-2 font-mono">{h.method}</span>
                  <span className="ml-1 text-charcoal-700">{h.url}</span>
                  <span className="ml-2 text-charcoal-500">{h.durationMs} ms</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </div>
  )
}
