import { FlatCompat } from '@eslint/eslintrc'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default [
  { ignores: ['out/**', '.next/**', 'node_modules/**', 'scripts/generated-agents/**'] },
  ...compat.extends('next/core-web-vitals'),
  { rules: { 'react/no-unescaped-entities': 'warn' } },
]
