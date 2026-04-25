import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    // Test files : non-null assertions sont la norme après expect-not-null
    // ou après setup de mocks contrôlés. Désactiver la règle dans le scope test
    // pour ne pas pousser à des `as NonNullable<...>` ou `?? throw` artificiels.
    files: ['**/__tests__/**', '**/tests/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    // Service workers ship with both browser and serviceworker globals.
    // Without this, eslint reports `self`, `console`, `caches`, `fetch`, etc. as undefined.
    files: ['**/sw.js', '**/service-worker.js'],
    languageOptions: {
      globals: {
        self: 'readonly',
        caches: 'readonly',
        clients: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        URL: 'readonly',
        addEventListener: 'readonly',
        skipWaiting: 'readonly',
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'public/**',
      '*.config.js',
      '*.config.ts',
      'scripts/**',
      // Claude Code worktrees: full repo copies created by background agents.
      // Without this ignore, eslint re-lints every worktree and reports
      // ~4000 phantom errors against duplicated source files.
      '.claude/worktrees/**',
      // Bundled debug assets (non-source, vendored)
      'src/assets/debug/**',
      // Capacitor / Android build intermediates (Gradle generated)
      'android/**',
      // Root-level analysis scripts (one-shot, not part of the app)
      '_*.mjs',
    ],
  }
)
