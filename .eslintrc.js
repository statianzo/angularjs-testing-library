module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parser: 'babel-eslint',
  rules: {
    'linebreak-style': ['error', 'unix'],
    'no-console': ['error', {allow: ['warn', 'error']}],
    'no-shadow': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'object-shorthand': 'error',
    'no-useless-rename': 'error',
    'no-use-before-define': ['error', {functions: false}],
  },
}
