module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'lit', 'wc', 'no-unsanitized'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:lit/recommended',
    'plugin:wc/recommended',
  ],
  rules: {
    // Checkmarx SAST-aligned rules — prevent XSS and injection vectors
    'no-unsanitized/property': 'error',
    'no-unsanitized/method': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'lit/no-legacy-template-syntax': 'error',
    'lit/no-template-bind': 'error',
    'lit/attribute-value-entities': 'error',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
};
