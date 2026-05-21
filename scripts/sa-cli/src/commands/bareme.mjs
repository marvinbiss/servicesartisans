import { parseArgs } from 'node:util'
import { httpGet } from '../lib/http-client.mjs'
import { formatOutput } from '../lib/output.mjs'
import { formatHttpError } from '../lib/errors.mjs'

export async function baremeCommand(args) {
  const aide = args[0]
  if (aide !== 'mpr' && aide !== 'cee') {
    process.stderr.write('Error: bareme requires "mpr" or "cee" subcommand\n')
    return 2
  }
  const rest = args.slice(1)
  if (aide === 'mpr') return baremeMpr(rest)
  return baremeCee(rest)
}

async function baremeMpr(args) {
  const { values } = parseArgs({
    args,
    options: {
      geste: { type: 'string' },
      menage: { type: 'string' },
      zone: { type: 'string' },
      rfr: { type: 'string' },
      nb: { type: 'string' },
      output: { type: 'string', default: 'json' },
      'base-url': { type: 'string' },
    },
  })
  const result = await httpGet('/api/v1/aides/mpr-bareme', {
    baseUrl: values['base-url'],
    query: {
      geste: values.geste,
      menage_categorie: values.menage,
      zone: values.zone,
      rfr: values.rfr,
      nb_personnes: values.nb,
    },
  })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  process.stdout.write(formatOutput(result.body, values.output) + '\n')
  return 0
}

async function baremeCee(args) {
  const { values } = parseArgs({
    args,
    options: {
      geste: { type: 'string' },
      zone: { type: 'string' },
      type: { type: 'string' },
      menage: { type: 'string' },
      output: { type: 'string', default: 'json' },
      'base-url': { type: 'string' },
    },
  })
  const result = await httpGet('/api/v1/aides/cee-bareme', {
    baseUrl: values['base-url'],
    query: {
      geste: values.geste,
      zone_climatique: values.zone,
      type_logement: values.type,
      menage_categorie: values.menage,
    },
  })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  process.stdout.write(formatOutput(result.body, values.output) + '\n')
  return 0
}
