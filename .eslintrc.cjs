module.exports = {
  root: true,

  env: {
    es6: true,
    node: true,
    commonjs: true,
    browser: true
  },

  plugins: ['@typescript-eslint', 'prettier'],

  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:md/prettier',
    'plugin:markdown/recommended',
  ],

  overrides: [
    {
      files: ['**/*.md'],
      processor: 'markdown/markdown',
      parser: "markdown-eslint-parser",
      extends: ["plugin:markdownlint/recommended"],
      rules: { 'prettier/prettier': ['error', { parser: 'markdown', }] },
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.md/*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'eslint:recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended'
      ],

      parserOptions: {
        sourceType: 'module',
        createDefaultProgram: true,
        project: './tsconfig.json'
      },

      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        'arrow-parens': 'off',
        'prettier/prettier': ['error', {
          tabWidth: 2,
          singleQuote: true,
          trailingComma: 'all',
          printWidth: 80,
          arrowParens: 'avoid',
          endOfLine: 'auto'
        }]
      },
    }
  ]
};