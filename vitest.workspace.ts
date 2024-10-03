import { defineConfig, defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // 'pages/*',
  // 'packages/*',
  // 'tests/*',
  // 'chrome-extension/*',
  'chrome-extension/**/*.{ts}',
  {
    // extends: './vite.config.ts',
    test: {
      name: 'test',
      // root: './shared_tests',
      environment: 'node',
      // setupFiles: ['./setup.happy-dom.ts'],
      exclude: ['*.js', 'chrome-extension/manifest.js', 'tests/**/*.{js,ts}'],
      include: ['chrome-extension/**/*.{ts}'],
      includeSource: ['chrome-extension/**/*.{js,ts}', 'pages/**/*.{js,ts}'],
      testTimeout: 50000,
    },
    define: {
      'import.meta.vitest': 'undefined',
    },
  },
]);
