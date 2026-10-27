import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import { Button, ButtonLink } from '@/components/ui';
import { useTranslations } from 'next-intl';
const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'React Aria button, styled through tailwind-variants. All controls have a 44px minimum target. Use the locale toolbar for Arabic/RTL.',
      },
    },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
function LocalButton(props: React.ComponentProps<typeof Button>) {
  const t = useTranslations();
  return <Button {...props}>{t('nav.submit')}</Button>;
}
export const Default: Story = { render: () => <LocalButton /> };
export const Hover: Story = {
  render: () => <LocalButton />,
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole('button'));
  },
};
export const Focus: Story = {
  render: () => <LocalButton />,
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole('button').focus();
  },
};
export const Disabled: Story = { render: () => <LocalButton isDisabled /> };
export const Loading: Story = { render: () => <LocalButton isPending /> };
export const Secondary: Story = {
  render: () => <LocalButton variant="secondary" />,
};
export const Danger: Story = { render: () => <LocalButton variant="danger" /> };
export const Ghost: Story = { render: () => <LocalButton variant="ghost" /> };
export const Arabic: Story = {
  globals: { locale: 'ar' },
  render: () => <LocalButton />,
};
export const NavigationLink: Story = {
  render: function Example() {
    const t = useTranslations();
    return <ButtonLink href="/en/events">{t('nav.programme')}</ButtonLink>;
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use a labelled ButtonLink for navigation. This example demonstrates its shared arrow variant.',
      },
    },
  },
};
