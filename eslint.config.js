const eslintPluginNext = require('eslint-plugin-next');
const prettierRecommended = require('eslint-config-prettier');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    ignores: ['node_modules', '.next', 'dist'],
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      next: eslintPluginNext,
      '@typescript-eslint': typescriptEslint,
    },
    extends: [
      'next/core-web-vitals',
      'plugin:prettier/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        _: 'readonly',
      },
      env: {
        es2021: true,
        jest: true,
      },
    },
    rules: {
      'no-var': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-shadow': 'off',
      'import/extensions': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-void': 'off',
      'import/prefer-default-export': 'off',
      'import/no-unresolved': 'off',
      'consistent-return': 'off',
      'react/no-is-mounted': 'off',
      'no-use-before-define': 'off',
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',
      'no-restricted-syntax': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Test file overrides
  {
    files: ['**/*.spec.[jt]s'],
    plugins: {
      jest: require('eslint-plugin-jest'),
      'testing-library': require('eslint-plugin-testing-library'),
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'global-require': 'off',
    },
  },
  // Cypress test file overrides (empty plugins/rules for now)
  {
    files: ['**/*.cy.[jt]s'],
    plugins: {},
    rules: {},
  },
];