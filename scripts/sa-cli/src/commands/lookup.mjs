import { parseArgs } from 'node:util'
import { httpGet } from '../lib/http-client.mjs'
import { formatOutput } from '../lib/output.mjs'
import { formatHttpError } from '../lib/errors.mjs'

export async function lookupCommand(args) {
  const { values, positionals } = parseArgs({
    args,
    options: {
      output: { type: 'string', default: 'json' },
      'base-url': { type: 'string' },
    },
    allowPositionals: true,
  })
  const siret = positionals[0]
  if (!siret || !/^[0-9]{14}$/.test(siret)) {
    process.stderr.write('Error: lookup requires a 14-digit SIRET\n')
    return 2
  }
  const result = await httpGet('/api/v1/rge/lookup', {
    baseUrl: values['base-url'],
    query: { siret },
  })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  process.stdout.write(formatOutput(result.body, values.output) + '\n')
  return 0
}
