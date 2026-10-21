import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useTranslations } from 'next-intl';
import { Field, SelectField, CheckField } from '@/components/ui';
const meta = {
  title: 'Primitives/Fields',
  component: Field,
  args: { label: '', value: '', onChange: () => {} },
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Every field has a visible label. Errors and hints use React Aria description slots. Required, invalid and disabled states are semantic. Select uses a keyboard-enabled popover listbox.',
      },
    },
  },
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;
function Example({
  error = false,
  disabled = false,
  multiline = false,
}: {
  error?: boolean;
  disabled?: boolean;
  multiline?: boolean;
}) {
  const t = useTranslations();
  const [value, setValue] = useState('');
  return (
    <Field
      label={t(multiline ? 'booking.description' : 'booking.titleField')}
      value={value}
      onChange={setValue}
      error={error ? t('validation.title') : undefined}
      isDisabled={disabled}
      isRequired
      multiline={multiline}
    />
  );
}
export const Default: Story = { render: () => <Example /> };
export const Error: Story = { render: () => <Example error /> };
export const Disabled: Story = { render: () => <Example disabled /> };
export const Textarea: Story = { render: () => <Example multiline /> };
export const ArabicError: Story = {
  globals: { locale: 'ar' },
  render: () => <Example error />,
};
export const Selection: Story = {
  render: function Selection() {
    const t = useTranslations();
    const [v, setV] = useState('free');
    const [checked, setChecked] = useState(false);
    return (
      <div className="form-fields">
        <SelectField
          label={t('booking.entry')}
          value={v}
          onChange={setV}
          options={['free', 'ticketed'].map((id) => ({
            id,
            label: t('common.' + id),
          }))}
        />
        <CheckField isSelected={checked} onChange={setChecked}>
          {t('booking.consent')}
        </CheckField>
      </div>
    );
  },
};
