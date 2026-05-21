import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Slugifies a free-form title into a safe filename component.
 */
export function slugify(input) {
  return String(input)
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'untitled'
}

/**
 * Writes `content` to `<outDir>/<filename>`, creating the directory if needed.
 * Returns the absolute path.
 */
export async function writeManifest(outDir, filename, content) {
  await mkdir(outDir, { recursive: true })
  const target = path.join(outDir, filename)
  const body =
    typeof content === 'string'
      ? content
      : JSON.stringify(content, null, 2) + '\n'
  await writeFile(target, body, 'utf8')
  return target
}
