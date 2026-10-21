'use client';
/**
 * Adapted from 21st.dev "Icon Card Radio Group" (@sean0205): a radio group laid
 * out as selectable cards with an icon, title and description. Built on React
 * Aria RadioGroup for native radio semantics and arrow-key navigation.
 */
import type { ReactNode } from 'react';
import { RadioGroup, Radio, Label } from 'react-aria-components';

export type RadioCard = {
  value: string;
  title: string;
  description: string;
  icon: ReactNode;
};

export function RadioCards({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioCard[];
  className?: string;
}) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className={'radio-cards ' + className}
    >
      <Label className="group-label">{label}</Label>
      <div className="radio-cards-grid">
        {options.map((option) => (
          <Radio key={option.value} value={option.value} className="radio-card">
            <span className="radio-card-icon" aria-hidden>
              {option.icon}
            </span>
            <span className="radio-card-dot" aria-hidden />
            <span className="radio-card-title">{option.title}</span>
            <span className="radio-card-text">{option.description}</span>
          </Radio>
        ))}
      </div>
    </RadioGroup>
  );
}
