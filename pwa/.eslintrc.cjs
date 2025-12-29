module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
  rules: {
    // Ban the classic AI escape hatches
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    // Note: no-unnecessary-type-assertion requires type info, may need to disable for now
    // '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // Kill TODO/FIXME
    'no-warning-comments': [
      'error',
      { terms: ['todo', 'fixme', 'hack', 'later', 'xxx'], location: 'anywhere' },
    ],

    // Ban direct process.env usage (force lib/env.ts)
    'no-restricted-properties': [
      'error',
      {
        object: 'process',
        property: 'env',
        message: 'Use lib/env.ts (validated env) instead of process.env',
      },
    ],
  },
};
