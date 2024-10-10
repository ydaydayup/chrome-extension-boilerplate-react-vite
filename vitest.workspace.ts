import { defineConfig, defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // 'packages/*',
  // 'tests/*',
  // 'chrome-extension/*',
  'chrome-extension/**/*.{ts}',
  'pages/content-ui/src/**/*.{ts}',
  {
    // extends: './vite.config.ts',
    test: {
      name: 'test',
      // root: './shared_tests',
      environment: 'node',
      // setupFiles: ['./setup.happy-dom.ts'],
      exclude: ['*.js', 'chrome-extension/manifest.js', 'tests/**/*.{js,ts}', 'node_modules/**'],
      include: ['chrome-extension/**/*.{ts}'],
      includeSource: ['chrome-extension/**/*.{js,ts}'],
      testTimeout: 50000,
    },
    define: {
      'import.meta.vitest': 'undefined',
    },
  },
  {
    test: {
      name: 'test_pages',
      environment: 'node',
      // dir: './pages/content-ui/src',
      // setupFiles: ['./setup.happy-dom.ts'],
      // exclude: ['*.js', 'chrome-extension/manifest.js', 'tests/**/*.{js,ts}', 'node_modules/**'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
        '**/state.ts', // 添加这一行来排除 state.ts
      ],
      includeSource: ['pages/content-ui/**/*.{js,ts,tsx}'],
      testTimeout: 50000,
    },
    resolve: {
      alias: {
        // '@src': './pages/content-ui/src',
        '@src': new URL('./pages/content-ui/src', import.meta.url).pathname,
      },
    },
    define: {
      'import.meta.vitest': 'undefined',
    },
  },
]);
// export default defineWorkspace([
//   'pages/**/*.{ts,tsx}',
//   // 'packages/*',
//   // 'tests/*',
//   // 'chrome-extension/*',
//   'chrome-extension/**/*.{ts}',
//   {
//     // extends: './vite.config.ts',
//     test: {
//       name: 'test',
//       // root: './shared_tests',
//       environment: 'node',
//       // setupFiles: ['./setup.happy-dom.ts'],
//       exclude: ['*.js', 'chrome-extension/manifest.js', 'tests/**/*.{js,ts}', "tailwind.config.ts"],
//       include: ['chrome-extension/**/*.{js,ts,tsx}','pages/**/*.{js,ts,tsx}'],
//       includeSource: ['chrome-extension/**/*.{js,ts,tsx}', 'pages/**/*.{js,ts,tsx}'],
//       testTimeout: 50000,
//     },
//     define: {
//       'import.meta.vitest': 'undefined',
//     },
//   },
// ]);
