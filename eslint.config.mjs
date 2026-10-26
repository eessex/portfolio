import stylistic from '@stylistic/eslint-plugin'
import next from 'eslint-config-next'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import tseslint from 'typescript-eslint'

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '.next/**',
      'coverage/**',
      'migrations/**',
      '.claude/**'
    ]
  },

  ...next,
  ...tseslint.configs.recommended,

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      '@stylistic': stylistic
    },

    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports'
        }
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        {
          avoidEscape: true,
          allowTemplateLiterals: 'never'
        }
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error'
    }
  }
]

export default eslintConfig
