export function formatOutput(data, format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2)
    case 'table':
      return formatTable(data)
    case 'csv':
      return formatCsv(data)
    default:
      throw new Error(`Unknown output format: ${format}`)
  }
}

function formatTable(data) {
  if (Array.isArray(data)) {
    if (data.length === 0) return '(empty)'
    const keys = Array.from(new Set(data.flatMap((row) => Object.keys(row ?? {}))))
    const header = keys.join(' | ')
    const sep = keys.map((k) => '-'.repeat(Math.max(1, k.length))).join('-+-')
    const rows = data.map((row) => keys.map((k) => formatCell(row?.[k])).join(' | '))
    return [header, sep, ...rows].join('\n')
  }
  if (data === null || data === undefined) return '(empty)'
  if (typeof data !== 'object') return String(data)
  const lines = []
  for (const [k, v] of Object.entries(data)) {
    lines.push(`${k}: ${formatCell(v)}`)
  }
  return lines.join('\n')
}

function formatCell(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function formatCsv(data) {
  const rows = Array.isArray(data) ? data : [data]
  if (rows.length === 0) return ''
  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r ?? {}))))
  const header = keys.map(csvEscape).join(',')
  const lines = rows.map((row) => keys.map((k) => csvEscape(formatCell(row?.[k]))).join(','))
  return [header, ...lines].join('\n')
}

function csvEscape(value) {
  const str = String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}
