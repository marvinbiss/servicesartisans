export class CliError extends Error {
  constructor(message, exitCode = 1) {
    super(message)
    this.name = 'CliError'
    this.exitCode = exitCode
  }
}

export function formatHttpError(result) {
  const bodyText = typeof result.body === 'string' ? result.body : JSON.stringify(result.body)
  return `${result.status} ${bodyText}`
}
