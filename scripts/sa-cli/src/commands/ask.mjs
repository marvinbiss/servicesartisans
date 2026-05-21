import { parseArgs } from 'node:util'
import { httpPost } from '../lib/http-client.mjs'
import { formatOutput } from '../lib/output.mjs'
import { formatHttpError } from '../lib/errors.mjs'

export async function askCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      'aides-geste': { type: 'string' },
      'aides-menage': { type: 'string' },
      'aides-zone': { type: 'string' },
      'aides-rfr': { type: 'string' },
      'aides-nb': { type: 'string' },
      output: { type: 'string', default: 'json' },
      'base-url': { type: 'string' },
    },
    allowPositionals: true,
  })
  const query = positionals[0]
  if (!query) {
    process.stderr.write('Error: ask requires a query string\n')
    return 2
  }
  const body = { query }
  if (values['aides-geste']) {
    body.aidesContext = {
      geste: values['aides-geste'],
      menageCategorie: values['aides-menage'],
      zone: values['aides-zone'],
      rfr: values['aides-rfr'] ? Number(values['aides-rfr']) : undefined,
      nbPersonnes: values['aides-nb'] ? Number(values['aides-nb']) : undefined,
    }
  }
  const result = await httpPost('/api/v1/ask', body, { baseUrl: values['base-url'] })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  process.stdout.write(formatOutput(result.body, values.output) + '\n')
  return 0
}
