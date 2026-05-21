/**
 * Server-rendered cards for the AsyncAPI explorer.
 *
 * `ChannelBlock` renders the channel header (id + address + title +
 * description), then a list of `OperationView` cards (one per operation
 * attached to the channel), each of which renders its `MessageView`
 * children with payload field table + JSON example pre block.
 *
 * Zero client JS — every interactive affordance is a plain `<a href="#">`
 * anchor or static markup. The component is split from `page.tsx` so
 * the renderer can be unit tested directly via `renderToStaticMarkup`.
 */

import type { ChannelLite, MessageLite, OperationLite, ServerLite } from './_types'

function actionBadgeClass(action: 'send' | 'receive'): string {
  return action === 'send' ? 'bg-accent-100 text-accent-800' : 'bg-yellow-100 text-yellow-800'
}

export function ServerRow({ s }: { s: ServerLite }) {
  return (
    <li className="font-mono text-xs">
      <span className="font-semibold text-charcoal-900">{s.name}</span>
      {s.protocol ? <span className="ml-2 text-charcoal-600">{s.protocol}</span> : null}
      {s.host ? <span className="ml-2 text-charcoal-700">{s.host}</span> : null}
      {s.description ? <span className="ml-2 text-charcoal-600">— {s.description}</span> : null}
    </li>
  )
}

function MessageView({ msg }: { msg: MessageLite }) {
  return (
    <article className="rounded border border-charcoal-200 bg-white p-3">
      <header className="flex flex-wrap items-baseline gap-x-3">
        <span className="font-mono text-sm font-semibold text-charcoal-900">
          {msg.title ?? msg.name}
        </span>
        {msg.contentType ? (
          <span className="font-mono text-xs text-charcoal-600">{msg.contentType}</span>
        ) : null}
      </header>
      {msg.summary ? <p className="mt-1 text-xs text-charcoal-700">{msg.summary}</p> : null}
      {msg.payloadProperties.length > 0 ? (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-charcoal-600">
                <th className="text-left font-medium pr-3 py-1">Field</th>
                <th className="text-left font-medium pr-3 py-1">Type</th>
                <th className="text-left font-medium pr-3 py-1">Required</th>
                <th className="text-left font-medium pr-3 py-1">Description</th>
              </tr>
            </thead>
            <tbody>
              {msg.payloadProperties.map((p) => (
                <tr key={p.name} className="border-t border-charcoal-100">
                  <td className="font-mono pr-3 py-1 text-charcoal-900">
                    {p.name}
                    {p.required ? <span className="text-red-700">*</span> : null}
                  </td>
                  <td className="font-mono pr-3 py-1 text-charcoal-700">{p.type}</td>
                  <td className="pr-3 py-1 text-charcoal-600">{p.required ? 'yes' : 'no'}</td>
                  <td className="pr-3 py-1 text-charcoal-700">{p.description ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {msg.payloadExample !== undefined && msg.payloadExample !== null ? (
        <div className="mt-2">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Example payload
          </h5>
          <pre className="mt-1 overflow-x-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
            {JSON.stringify(msg.payloadExample, null, 2)}
          </pre>
        </div>
      ) : null}
    </article>
  )
}

export function OperationView({ op }: { op: OperationLite }) {
  return (
    <section className="rounded-lg border border-charcoal-200 bg-white p-3" id={`op-${op.id}`}>
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className={`inline-flex rounded px-2 py-0.5 text-xs font-mono font-semibold ${actionBadgeClass(op.action)}`}
        >
          {op.action.toUpperCase()}
        </span>
        <span className="font-mono text-sm text-charcoal-900">{op.id}</span>
      </header>
      {op.summary ? (
        <p className="mt-1 text-sm font-medium text-charcoal-900">{op.summary}</p>
      ) : null}
      {op.description ? <p className="mt-1 text-sm text-charcoal-700">{op.description}</p> : null}
      {op.messages.length > 0 ? (
        <div className="mt-2 space-y-2">
          {op.messages.map((m) => (
            <MessageView key={m.name} msg={m} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function ChannelBlock({ ch }: { ch: ChannelLite }) {
  return (
    <article
      id={`channel-${ch.id}`}
      className="rounded-lg border border-charcoal-200 bg-white p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-mono text-lg font-semibold text-charcoal-900">{ch.id}</h3>
        {ch.address && ch.address !== ch.id ? (
          <code className="font-mono text-xs text-charcoal-600">{ch.address}</code>
        ) : null}
      </header>
      {ch.title ? <p className="mt-1 text-sm font-medium text-charcoal-900">{ch.title}</p> : null}
      {ch.description ? <p className="mt-1 text-sm text-charcoal-700">{ch.description}</p> : null}
      {ch.operations.length > 0 ? (
        <div className="mt-3 space-y-3">
          {ch.operations.map((op) => (
            <OperationView key={op.id} op={op} />
          ))}
        </div>
      ) : ch.messages.length > 0 ? (
        <div className="mt-3 space-y-3">
          {ch.messages.map((m) => (
            <MessageView key={m.name} msg={m} />
          ))}
        </div>
      ) : null}
    </article>
  )
}
