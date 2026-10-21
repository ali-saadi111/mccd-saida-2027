'use client';
import { useTranslations } from 'next-intl';
import { Button, PageIntro } from '@/components/ui';
export default function Error({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const t = useTranslations();
  return (
    <div className="page-bottom container">
      <PageIntro eyebrow={t('common.error')} title={t('errors.title')}>
        {t('errors.text')}
      </PageIntro>
      <Button onPress={retry}>{t('common.retry')}</Button>
    </div>
  );
}
