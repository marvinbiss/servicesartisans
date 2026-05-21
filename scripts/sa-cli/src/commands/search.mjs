import { parseArgs } from 'node:util'
import { httpGet } from '../lib/http-client.mjs'
import { formatOutput } from '../lib/output.mjs'
import { formatHttpError } from '../lib/errors.mjs'

export async function searchCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', default: 'json' },
      'base-url': { type: 'string' },
      limit: { type: 'string' },
    },
    allowPositionals: true,
  })
  const metier = positionals[0]
  const ville = positionals[1]
  if (!metier || !ville) {
    process.stderr.write('Error: search requires <metier> and <ville> positional arguments\n')
    return 2
  }
  const result = await httpGet('/api/v1/rge/search', {
    baseUrl: values['base-url'],
    query: {
      metier,
      ville,
      limit: values.limit,
    },
  })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  process.stdout.write(formatOutput(result.body, values.output) + '\n')
  return 0
}
