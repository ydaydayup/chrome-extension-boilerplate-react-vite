import baseConfig from '@extension/tailwindcss-config';
import { withUI } from '@extension/ui';
import tailwindAnimate from 'tailwindcss-animate';
import plugin from 'tailwindcss/plugin';

export default withUI({
  ...baseConfig,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  plugins: [
    tailwindAnimate,
    plugin(function ({ addVariant }) {
      addVariant('forest', '.theme-forest &');
      addVariant('ocean', '.theme-ocean &');
      addVariant('sunset', '.theme-sunset &');
    }),
  ],
});
