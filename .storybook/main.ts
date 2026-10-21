import type { StorybookConfig } from '@storybook/nextjs-vite';
import path from 'node:path';
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs-vite', options: {} },
  staticDirs: ['../public'],
  viteFinal(config) {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@/lib/actions': path.resolve('.storybook/actions.ts'),
      },
    };
    return config;
  },
};
export default config;
