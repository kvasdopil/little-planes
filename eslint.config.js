import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/no-unknown-property': ['error', { 
        ignore: [
          'args',
          'uniforms',
          'vertexShader',
          'fragmentShader',
          'transparent',
          'side',
          'blending',
          'depthWrite',
          'attach',
          'position',
          'rotation',
          'scale',
          'intensity',
          'castShadow',
          'receiveShadow',
          'dispose',
          'wireframe',
          'vertexColors',
          'sizeAttenuation'
        ] 
      }],
      'no-undef': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
]
