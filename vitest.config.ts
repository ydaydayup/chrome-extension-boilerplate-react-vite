import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // exclude: ['*.js', 'chrome-extension/manifest.js', "tests/**/*.{js,ts}"],
    // coverage: {
    //   all: false,
    //   provider: 'istanbul',
    //   exclude: [
    //     ...coverageConfigDefaults.exclude,
    //     '**/__mocks/**',
    //     '**/dist/**',
    //     'playwright.config.ts',
    //     'vitest-setup.ts',
    //     'vitest.helpers.ts',
    //   ],
    // },
  },
});
