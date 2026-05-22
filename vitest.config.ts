import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Default 'node' (rapide). Les tests qui ont besoin du DOM s'opt-in
    // explicitement via `// @vitest-environment jsdom` en haut du fichier.
    // Tous les .test.tsx ont été annotés (37 fichiers) + 1 test .ts qui
    // utilise renderHook (useDevisForm). Vitest 4 ne supporte plus
    // environmentMatchGlobs — l'annotation par fichier est la voie idiomatique.
    // Gain mesuré : 105s → 55s (1.9x speedup, fix dette technique #7 2026-05-05).
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.test.{ts,tsx}',
      '__tests__/**/*.test.{ts,tsx}',
      'scripts/**/*.test.{ts,tsx}',
    ],
    // Exclu : test charge dynamiquement scripts/generate-bruno-collection.mjs
    // qui ouvre _spec.snapshot.json. Vite transformer plante avec "SyntaxError:
    // Invalid or unexpected token" sur certaines versions Node/Vite. Le
    // script lui-même tourne propre via `node -e "import(...)"` direct.
    // À ré-activer post-upgrade vitest 5 ou vite 6.
    exclude: ['node_modules/**', '__tests__/scripts/generate-bruno-collection.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 55,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/test/server-only-stub.ts'),
    },
  },
})
