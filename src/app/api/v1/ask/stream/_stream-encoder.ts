/**
 * SSE 1.x encoder (W3C HTML Living Standard, EventStream interpretation).
 *
 * Format wire :
 *   id: <uuid>
 *   event: <eventName>
 *   data: <JSON-stringified payload>
 *   \n\n
 *
 * Garantit : 1 event = 1 ligne data: (pas de newlines dans le JSON, donc safe).
 * Si jamais le payload sérialisé contenait `\n`, il faudrait emettre plusieurs
 * `data:` lines successives. Notre payload est JSON pur → pas de risque.
 *
 * Comments are emitted as `: <comment>\n\n`. Standard SSE keepalive idiom :
 * EventSource ignores them but proxies / browsers reset their idle timer.
 *
 * Ref : https://html.spec.whatwg.org/multipage/server-sent-events.html
 */

export type SseEvent = {
  event: string
  data: Record<string, unknown>
  id?: string
}

export function encodeSseEvent(evt: SseEvent): string {
  const lines: string[] = []
  if (evt.id !== undefined) lines.push(`id: ${evt.id}`)
  lines.push(`event: ${evt.event}`)
  // Each data: line cannot contain raw \n; JSON.stringify produces
  // single-line output for any JSON-serialisable value, so safe.
  const json = JSON.stringify(evt.data)
  lines.push(`data: ${json}`)
  return lines.join('\n') + '\n\n'
}

export function encodeSseComment(comment: string): string {
  // SSE comments start with `:` and act as keepalives — proxies that
  // would otherwise close an idle long-poll connection reset their
  // timer when they see ANY byte from the origin.
  const safe = comment.replace(/[\r\n]/g, ' ')
  return `: ${safe}\n\n`
}
