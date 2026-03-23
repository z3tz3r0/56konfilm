import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'play-results/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'tests/**/*.ts', 'tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '../../../*',
              message:
                'Relative imports deeper than 3 levels are not allowed. Use absolute imports instead.',
            },
          ],
        },
      ],
      // Console rules - prevent console statements in production code
      'no-console': [
        'error',
        {
          allow: ['error', 'info', 'debug'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
    },
  },
  prettier,
];

export default config;
