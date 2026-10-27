'use client';
import { forwardRef, type ReactNode } from 'react';
import {
  Button as AriaButton,
  Link,
  TextField,
  Label,
  Input,
  TextArea,
  Text,
  FieldError,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  Checkbox,
  ModalOverlay,
  Modal,
  Dialog,
  Heading,
  type ButtonProps,
  type LinkProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';
import { CaretDown, Check, X } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
export const buttonStyles = tv({
  base: 'button',
  variants: {
    variant: {
      primary: 'button-primary',
      secondary: 'button-secondary',
      outline: 'button-outline',
      ghost: 'button-ghost',
      danger: 'button-danger',
      light: 'button-light',
      'outline-light': 'button-outline-light',
    },
    size: { sm: 'button-sm', md: 'button-md', icon: 'button-icon' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});
type ButtonVariants = VariantProps<typeof buttonStyles>;
export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps & ButtonVariants
>(function Button({ variant, size, className, ...props }, ref) {
  return (
    <AriaButton
      {...props}
      ref={ref}
      className={buttonStyles({
        variant,
        size,
        className: typeof className === 'string' ? className : '',
      })}
    />
  );
});
export function AppLink({ href, children, className, ...props }: LinkProps) {
  return (
    <Link href={href} className={className || 'text-link'} {...props}>
      {children}
    </Link>
  );
}
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: LinkProps & ButtonVariants) {
  return (
    <Link
      {...props}
      className={buttonStyles({
        variant,
        size,
        className: typeof className === 'string' ? className : '',
      })}
    />
  );
}
export const badgeStyles = tv({
  base: 'badge',
  variants: {
    tone: { neutral: 'badge-neutral', sea: 'badge-sea', red: 'badge-red' },
  },
  defaultVariants: { tone: 'neutral' },
});
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'sea' | 'red';
}) {
  return <span className={badgeStyles({ tone })}>{children}</span>;
}
export const fieldStyles = tv({
  base: 'field',
  variants: {
    state: { default: '', error: 'field-error', disabled: 'field-disabled' },
  },
  defaultVariants: { state: 'default' },
});
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  name?: string;
  multiline?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  autoComplete?: string;
  placeholder?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onBlur?: () => void;
};
export function Field({
  label,
  value,
  onChange,
  error,
  hint,
  type = 'text',
  name,
  multiline,
  isDisabled,
  isRequired,
  autoComplete,
  placeholder,
  inputRef,
  onBlur,
}: FieldProps) {
  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isInvalid={!!error}
      isDisabled={isDisabled}
      isRequired={isRequired}
      validationBehavior="aria"
      type={type as 'text'}
      className={fieldStyles({
        state: error ? 'error' : isDisabled ? 'disabled' : 'default',
      })}
    >
      <Label>
        {label}
        {isRequired && <span aria-hidden="true"> *</span>}
      </Label>
      {multiline ? (
        <TextArea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          className="input textarea"
          placeholder={placeholder}
        />
      ) : (
        <Input
          ref={inputRef}
          className="input"
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
      )}
      {hint && (
        <Text slot="description" className="field-hint">
          {hint}
        </Text>
      )}
      {error && <FieldError className="error-text">{error}</FieldError>}
    </TextField>
  );
}
export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  isDisabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
  error?: string;
  isDisabled?: boolean;
}) {
  const t = useTranslations();
  return (
    <Select
      selectedKey={value || 'all'}
      onSelectionChange={(k) => onChange(k === 'all' ? '' : String(k))}
      isInvalid={!!error}
      isDisabled={isDisabled}
      className="field"
      placeholder={t('common.choose')}
    >
      <Label>{label}</Label>
      <AriaButton className="input select-trigger">
        <SelectValue />
        <CaretDown weight="thin" aria-hidden />
      </AriaButton>
      <Popover className="popover">
        <ListBox
          className="listbox"
          items={options.map((o) => ({ ...o, id: o.id || 'all' }))}
        >
          {(item) => (
            <ListBoxItem id={item.id} textValue={item.label} className="option">
              {item.label}
              <Check weight="thin" aria-hidden className="selection-check" />
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
      {error && <FieldError className="error-text">{error}</FieldError>}
    </Select>
  );
}
export function CheckField({
  children,
  isSelected,
  onChange,
  isDisabled = false,
}: {
  children: ReactNode;
  isSelected: boolean;
  onChange: (v: boolean) => void;
  isDisabled?: boolean;
}) {
  return (
    <Checkbox
      isSelected={isSelected}
      onChange={onChange}
      isDisabled={isDisabled}
      className="check-field"
    >
      <span className="check-box">
        <Check weight="thin" aria-hidden />
      </span>
      <span>{children}</span>
    </Checkbox>
  );
}
export function ConfirmDialog({
  open,
  onClose,
  title,
  children,
  onConfirm,
  confirmLabel,
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
  danger?: boolean;
}) {
  const t = useTranslations();
  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={(v) => !v && onClose()}
      isDismissable
      className="modal-overlay"
    >
      <Modal className="modal">
        <Dialog className="dialog">
          <div className="flex items-start justify-between gap-4">
            <Heading slot="title" className="dialog-title">
              {title}
            </Heading>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('common.close')}
              onPress={onClose}
            >
              <X weight="thin" />
            </Button>
          </div>
          <div className="dialog-body">{children}</div>
          <div className="dialog-actions">
            <Button variant="secondary" onPress={onClose}>
              {t('common.cancel')}
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onPress={onConfirm}>
              {confirmLabel || t('common.save')}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-thread" aria-hidden>
        ≈
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <div className="intro-text">{children}</div>}
    </header>
  );
}
