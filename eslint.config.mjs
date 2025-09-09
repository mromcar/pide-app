import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
  { ignores: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**', 'next-env.d.ts'] },

  // JS (browser, ESM)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.browser },
    rules: { ...js.configs.recommended.rules }
  },

  // TS
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      ...tseslint.configs.recommended.rules,
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },

  // Archivos de config Node en CJS
  {
    files: ['next.config.js', 'tailwind.config.js', 'postcss.config.js', 'prisma-models-check.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'script', globals: globals.node },
    rules: { 'no-undef': 'off' }
  },

  // Archivos de config Node en ESM (.mjs)
  {
    files: ['next.config.mjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.node },
    rules: { 'no-undef': 'off' }
  }
]
