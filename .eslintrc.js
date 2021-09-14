module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': ['error', 'unix'],
    'no-console': ['error', {allow: ['warn', 'error']}],
    'no-shadow': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'object-shorthand': 'error',
    'no-useless-rename': 'error',
    'no-use-before-define': ['error', {functions: false}],
    'no-unused-vars': 'off',
    'no-duplicate-imports': 'off',
  },
}
