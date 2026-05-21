import { lookupCommand } from './commands/lookup.mjs'
import { searchCommand } from './commands/search.mjs'
import { baremeCommand } from './commands/bareme.mjs'
import { askCommand } from './commands/ask.mjs'
import { specCommand } from './commands/spec.mjs'

const VERSION = '0.1.0'

const HELP = `sa-rge-os v${VERSION} — ServicesArtisans RGE-OS CLI

Usage:
  sa-rge-os lookup <siret>
  sa-rge-os search <metier> <ville>
  sa-rge-os bareme mpr --geste <g> --menage <c> --zone <z> --rfr <n> --nb <n>
  sa-rge-os bareme cee --geste <g> --zone <H1|H2|H3> --type <maison|appartement> --menage <c>
  sa-rge-os ask "<query>"
  sa-rge-os spec [--version v1.0] [--output rge.json]
  sa-rge-os --help
  sa-rge-os --version

Global flags:
  --output <format>   json (default) | table | csv
  --base-url <url>    Override SA API base URL (default: https://servicesartisans.fr)

Environment:
  SA_API_BASE_URL     Same as --base-url

Docs:    https://servicesartisans.fr/developpeurs
License: MIT
`

export async function run(argv) {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === '-h') {
    process.stdout.write(HELP)
    return 0
  }
  if (argv[0] === '--version' || argv[0] === '-v') {
    process.stdout.write(`sa-rge-os v${VERSION}\n`)
    return 0
  }
  const subcommand = argv[0]
  const rest = argv.slice(1)
  switch (subcommand) {
    case 'lookup':
      return lookupCommand(rest)
    case 'search':
      return searchCommand(rest)
    case 'bareme':
      return baremeCommand(rest)
    case 'ask':
      return askCommand(rest)
    case 'spec':
      return specCommand(rest)
    default:
      process.stderr.write(`Unknown command: ${subcommand}\n${HELP}`)
      return 1
  }
}

export { VERSION, HELP }
