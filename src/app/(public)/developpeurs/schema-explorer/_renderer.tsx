/**
 * Server-rendered card for one schema.
 *
 * `SchemaBlock` renders the schema header (name + type + required count +
 * description), its property table with $ref auto-anchors, the
 * auto-generated minimal example pre block, and the reverse used-by list
 * with method badges that match the api-explorer palette.
 *
 * Zero client JS — the table is plain HTML, the example is server-stringified,
 * and the used-by list is just <li>s with anchors. The component is split
 * from `page.tsx` so the renderer can be unit tested directly via
 * `renderToStaticMarkup`.
 */

import type { PropertyLite, SchemaLite } from './_types'

function methodBadgeBg(method: string): string {
  switch (method) {
    case 'get':
      return 'bg-accent-100 text-accent-800'
    case 'post':
    case 'put':
    case 'patch':
      return 'bg-yellow-100 text-yellow-800'
    case 'delete':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-charcoal-100 text-charcoal-700'
  }
}

function PropertyRow({ p }: { p: PropertyLite }) {
  return (
    <tr className="border-t border-charcoal-100 align-top">
      <td className="font-mono pr-3 py-1 text-charcoal-900">
        {p.name}
        {p.required ? <span className="text-red-700">*</span> : null}
      </td>
      <td className="font-mono pr-3 py-1 text-charcoal-700">
        {p.refTo ? (
          <a href={`#schema-${p.refTo}`} className="text-accent-700 underline">
            {p.refTo}
          </a>
        ) : (
          <>
            {p.type}
            {p.format ? <span className="text-charcoal-500"> · {p.format}</span> : null}
          </>
        )}
      </td>
      <td className="pr-3 py-1 text-charcoal-700">{p.description ?? ''}</td>
      <td className="pr-3 py-1 font-mono text-charcoal-600">
        {p.enum
          ? p.enum
              .slice(0, 5)
              .map((v) => String(v))
              .join(' | ') + (p.enum.length > 5 ? '…' : '')
          : ''}
      </td>
    </tr>
  )
}

export function SchemaBlock({ schema, example }: { schema: SchemaLite; example: unknown }) {
  return (
    <article
      id={`schema-${schema.name}`}
      className="rounded-lg border border-charcoal-200 bg-white p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-mono text-lg font-semibold text-charcoal-900">{schema.name}</h3>
        <span className="text-xs text-charcoal-500">{schema.type}</span>
        {schema.required.length > 0 ? (
          <span className="text-xs text-red-700">{schema.required.length} required</span>
        ) : null}
      </header>
      {schema.description ? (
        <p className="mt-1 text-sm text-charcoal-700">{schema.description}</p>
      ) : null}

      {schema.properties.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-charcoal-600">
                <th className="text-left font-medium pr-3 py-1">Name</th>
                <th className="text-left font-medium pr-3 py-1">Type</th>
                <th className="text-left font-medium pr-3 py-1">Description</th>
                <th className="text-left font-medium pr-3 py-1">Enum</th>
              </tr>
            </thead>
            <tbody>
              {schema.properties.map((p) => (
                <PropertyRow key={p.name} p={p} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {example !== null && example !== undefined ? (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Example
          </h4>
          <pre className="mt-1 overflow-x-auto rounded bg-charcoal-50 p-2 font-mono text-xs text-charcoal-800">
            {JSON.stringify(example, null, 2)}
          </pre>
        </div>
      ) : null}

      {schema.usedBy.length > 0 ? (
        <div className="mt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Used by
          </h4>
          <ul className="mt-1 space-y-0.5 text-xs">
            {schema.usedBy.slice(0, 8).map((u) => (
              <li key={`${u.method}-${u.path}`} className="text-charcoal-700">
                <span
                  className={`mr-2 inline-flex rounded px-1.5 py-0.5 font-mono font-semibold ${methodBadgeBg(u.method)}`}
                >
                  {u.method.toUpperCase()}
                </span>
                <code className="font-mono">{u.path}</code>
              </li>
            ))}
            {schema.usedBy.length > 8 ? (
              <li className="text-charcoal-500">… and {schema.usedBy.length - 8} more</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </article>
  )
}
