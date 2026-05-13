#!/usr/bin/env node
/**
 * scripts/audit-unnecessary-use-client.mjs
 * ----------------------------------------
 * Identifie les fichiers `'use client'` qui n'utilisent AUCUNE API client.
 * Ces fichiers gagneraient à être convertis en server components :
 *   - Bundle JS réduit (Next 14 ne ship pas le code server au client).
 *   - Render plus rapide en SSR (pas de hydration).
 *
 * Heuristique conservative (rapports = candidats, à vérifier manuellement) :
 *   Marque le fichier comme candidat si AUCUN match parmi :
 *     - hooks React : useState, useEffect, useRef, useMemo, useCallback,
 *                    useReducer, useLayoutEffect, useContext, useId,
 *                    useTransition, useDeferredValue, useSyncExternalStore,
 *                    useImperativeHandle
 *     - Next hooks : usePathname, useRouter, useSearchParams, useParams,
 *                    useSelectedLayoutSegment, useFormState
 *     - SWR/data hooks : useSWR, useQuery, useMutation, useSubscription
 *     - Custom hooks : use[A-Z]\w+
 *     - Event handlers JSX : onClick=, onChange=, onSubmit=, onBlur=,
 *                            onFocus=, onKeyDown=, onMouseEnter=, etc.
 *     - APIs browser : window., document., localStorage, sessionStorage,
 *                      navigator., performance.
 *     - createContext, forwardRef (souvent obligent client)
 *
 * Usage :
 *   node scripts/audit-unnecessary-use-client.mjs            # human
 *   node scripts/audit-unnecessary-use-client.mjs --json     # JSON
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'

const args = new Set(process.argv.slice(2))
const jsonOut = args.has('--json')

const CLIENT_PATTERNS = [
  /\buse[A-Z]\w*\s*\(/,
  /\bonClick\s*=/,
  /\bonChange\s*=/,
  /\bonSubmit\s*=/,
  /\bonBlur\s*=/,
  /\bonFocus\s*=/,
  /\bonKey(Down|Up|Press)\s*=/,
  /\bonMouse(Enter|Leave|Down|Up|Over|Move)\s*=/,
  /\bonTouch(Start|End|Move)\s*=/,
  /\bonScroll\s*=/,
  /\bonInput\s*=/,
  /\bonContextMenu\s*=/,
  /\bonDoubleClick\s*=/,
  /\bonDrag/,
  /\bonDrop\s*=/,
  /\bwindow\./,
  /\bdocument\./,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bnavigator\./,
  /\bperformance\./,
  /\bcreateContext\s*\(/,
  /\bforwardRef\s*[<(]/,
  /\bIntersectionObserver\b/,
  /\bResizeObserver\b/,
  /\bMutationObserver\b/,
  /\bsetTimeout\s*\(/,
  /\bsetInterval\s*\(/,
  /\brequestAnimationFrame\b/,
]

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      walk(full, acc)
    } else if (/\.tsx$/.test(entry)) {
      acc.push(full)
    }
  }
  return acc
}

const root = process.cwd()
const files = walk(join(root, 'src'))

const candidates = []
let totalClient = 0

for (const file of files) {
  const src = readFileSync(file, 'utf8')
  const firstLine = src.split('\n').slice(0, 3).join('\n')
  if (!/^\s*['"]use client['"]/.test(firstLine)) continue
  totalClient++

  let hasClientApi = false
  for (const re of CLIENT_PATTERNS) {
    if (re.test(src)) {
      hasClientApi = true
      break
    }
  }
  if (!hasClientApi) {
    candidates.push(file.replace(root + sep, '').split(sep).join('/'))
  }
}

if (jsonOut) {
  console.log(JSON.stringify({ totalClient, candidates }, null, 2))
} else {
  console.log(`Files 'use client' : ${totalClient}`)
  console.log(`Candidats migration server : ${candidates.length}\n`)
  for (const c of candidates) console.log(`  ${c}`)
}
