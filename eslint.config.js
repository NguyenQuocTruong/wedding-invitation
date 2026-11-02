import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default ts.config(
  { ignores: ['dist/**', 'node_modules/**', '.vercel/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    rules: { 'no-undef': 'off' }, // TypeScript checks identifiers in script setup, including DOM types.
    languageOptions: { parserOptions: { parser: ts.parser } },
  },
  prettier,
)
