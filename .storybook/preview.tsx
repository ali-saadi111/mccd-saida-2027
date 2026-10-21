import type { Preview } from '@storybook/nextjs-vite';
import { Providers } from '../src/components/providers';
import en from '../src/messages/en.json';
import ar from '../src/messages/ar.json';
import '../src/app/globals.css';
import './fonts.css';
import {
  AppRouterContext,
  LayoutRouterContext,
  type AppRouterInstance,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import { fn } from 'storybook/test';
// Next 16.4 changed its internal cache tree. Provide a minimal current router
// instead of Storybook's legacy LayoutRouterContext fixture.
const router: AppRouterInstance = {
  back: fn(),
  forward: fn(),
  refresh: fn(),
  push: fn(),
  replace: fn(),
  prefetch: fn(),
  bfcacheId: '_b_workshop_',
};
const preview: Preview = {
  globalTypes: {
    locale: {
      description: 'Language and reading direction',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English · LTR' },
          { value: 'ar', title: 'العربية · RTL' },
        ],
      },
    },
  },
  initialGlobals: { locale: 'en' },
  parameters: {
    nextjs: { appDirectory: false },
    layout: 'padded',
    a11y: { test: 'error' },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale === 'ar' ? 'ar' : 'en';
      return (
        <AppRouterContext.Provider value={router}>
          <LayoutRouterContext.Provider value={null}>
            <PathnameContext.Provider value={'/' + locale}>
              <div lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <Providers locale={locale} messages={locale === 'ar' ? ar : en}>
                  <Story />
                </Providers>
              </div>
            </PathnameContext.Provider>
          </LayoutRouterContext.Provider>
        </AppRouterContext.Provider>
      );
    },
  ],
};
export default preview;
