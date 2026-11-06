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
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: { projectService: true }
    },
    rules: {
      '@typescript-eslint/naming-convention': [
        'error',
        {
          // object literal keys are mostly set by outside APIs
          selector: ['variable', 'parameter', 'typeProperty'],
          types: ['boolean'],
          // FormResponse's ok, _ discards, snake_case DB rows
          filter: { regex: '^ok$|_', match: false },
          format: ['camelCase', 'PascalCase'],
          prefix: ['is']
        }
      ]
    }
  }
]

export default eslintConfig
