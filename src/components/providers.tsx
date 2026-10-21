'use client';
import { useEffect, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import {
  I18nProvider,
  RouterProvider,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastContent as ToastContent,
  Text,
  Button,
} from 'react-aria-components';
import { MotionConfig } from 'motion/react';
import { useRouter } from 'next/navigation';
import type messagesType from '@/messages/en.json';
export const toastQueue = new ToastQueue<string>({ maxVisibleToasts: 2 });
export function notify(message: string) {
  toastQueue.add(message, { timeout: 5000 });
}
export function Providers({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: string;
  messages: typeof messagesType;
}) {
  const router = useRouter();
  useEffect(() => {
    document.documentElement.dataset.ready = 'true';
  }, []);
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.NEXT_PUBLIC_AXE === 'true'
    ) {
      void Promise.all([
        import('react'),
        import('react-dom'),
        import('@axe-core/react'),
      ]).then(([React, ReactDOM, axe]) => axe.default(React, ReactDOM, 1000));
    }
  }, []);
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Beirut"
    >
      <I18nProvider locale={locale === 'ar' ? 'ar-LB-u-ca-gregory' : 'en-GB'}>
        <RouterProvider navigate={router.push}>
          <MotionConfig reducedMotion="user" transition={{ duration: 0.2 }}>
            {children}
            <ToastRegion queue={toastQueue} className="toast-region">
              {({ toast }) => (
                <Toast toast={toast} className="toast">
                  <ToastContent>
                    <Text slot="title">{toast.content}</Text>
                  </ToastContent>
                  <Button
                    slot="close"
                    className="toast-close"
                    aria-label={messages.common.close}
                  >
                    ×
                  </Button>
                </Toast>
              )}
            </ToastRegion>
          </MotionConfig>
        </RouterProvider>
      </I18nProvider>
    </NextIntlClientProvider>
  );
}
