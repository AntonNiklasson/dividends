import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Enforce unused vars as error
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Prefer const over let
      'prefer-const': 'error',
      // No console.log in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Prefer named exports over default exports
      'import/no-default-export': 'error',
    },
  },
  // Allow default exports for Next.js pages, layouts, and config files
  {
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      '*.config.ts',
      '*.config.mjs',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },
]);

export default eslintConfig;
