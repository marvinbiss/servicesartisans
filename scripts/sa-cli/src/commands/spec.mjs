import { writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { httpGet } from '../lib/http-client.mjs'
import { formatHttpError } from '../lib/errors.mjs'

export async function specCommand(args) {
  const { values } = parseArgs({
    args,
    options: {
      version: { type: 'string', default: 'v1.0' },
      output: { type: 'string' },
      'base-url': { type: 'string' },
    },
  })
  const path = `/spec/rge/${values.version}/rge.schema.json`
  const result = await httpGet(path, { baseUrl: values['base-url'] })
  if (result.status >= 400) {
    process.stderr.write(`Error: ${formatHttpError(result)}\n`)
    return 1
  }
  const json = JSON.stringify(result.body, null, 2)
  if (values.output) {
    await writeFile(values.output, json + '\n', 'utf8')
    process.stdout.write(`Wrote ${values.output}\n`)
  } else {
    process.stdout.write(json + '\n')
  }
  return 0
}
