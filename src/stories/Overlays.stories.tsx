import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useTranslations } from 'next-intl';
import { Button, ConfirmDialog } from '@/components/ui';
import { notify } from '@/components/providers';
import { Header, Footer } from '@/components/shell';
const meta = {
  title: 'Primitives/Overlays and shell',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Confirmation: Story = {
  render: function Example() {
    const t = useTranslations();
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button onPress={() => setOpen(true)}>{t('admin.cancelAction')}</Button>
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          title={t('admin.cancelTitle')}
          onConfirm={() => setOpen(false)}
          confirmLabel={t('admin.cancelAction')}
          danger
        >
          {t('admin.cancelText')}
        </ConfirmDialog>
      </>
    );
  },
};
export const ArabicConfirmation: Story = {
  ...Confirmation,
  globals: { locale: 'ar' },
};
export const Toast: Story = {
  render: function Example() {
    const t = useTranslations();
    return (
      <Button onPress={() => notify(t('admin.saved'))}>
        {t('common.save')}
      </Button>
    );
  },
};
export const Navigation: Story = {
  render: () => <Header />,
  parameters: { layout: 'fullscreen' },
};
export const FooterLayout: Story = {
  render: () => <Footer />,
  parameters: { layout: 'fullscreen' },
};
