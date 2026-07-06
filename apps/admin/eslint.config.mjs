import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

// Solo reglas de correctitud — el formato del código no se gatea acá para no
// generar diffs masivos sobre código que ya está en producción.
export default [
  { ignores: ['.next/**', 'node_modules/**'] },
  js.configs.recommended,
  {
    files: ['app/**/*.{js,jsx}', 'lib/**/*.js', 'components/**/*.{js,jsx}', 'middleware.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      // Server components y actions usan process; client components usan window.
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { react, 'react-hooks': reactHooks },
    settings: { react: { version: 'detect' } },
    rules: {
      'react/jsx-uses-vars': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
];
