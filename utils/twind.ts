import { IS_BROWSER } from '$fresh/runtime.ts';
import { Configuration, setup } from 'twind';
export * from 'twind';
export const config: Configuration = {
  darkMode: 'class',
  mode: 'silent',

  theme: {
    extend: {
      animation: {
        fadein: 'fadein 0.5s ease-out',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
};
if (IS_BROWSER) setup(config);
