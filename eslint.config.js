import arcEslintConfig from '@architect/eslint-config'

export default [
  ...arcEslintConfig,
  {
    languageOptions: {
      sourceType: 'module',
    },
    ignores: [
      'scratch',
    ],
  },
]
