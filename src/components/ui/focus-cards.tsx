'use client';
/**
 * Adapted from 21st.dev "Focus Cards" (Aceternity): hovering or keyboard-focusing
 * one card softly blurs and recedes its siblings. Titles stay visible at rest
 * (never hover-only) and each card is a single stretched link.
 */
import { useState, type ReactNode } from 'react';
import { AppLink } from '.';

export type FocusCard = {
  key: string;
  href: string;
  title: string;
  media: ReactNode;
  kicker: ReactNode;
  meta: ReactNode;
  corner?: ReactNode;
};

export function FocusCards({
  cards,
  className = '',
}: {
  cards: FocusCard[];
  className?: string;
}) {
  const [focused, setFocused] = useState<number | null>(null);
  return (
    <ul
      className={'focus-cards ' + className}
      onMouseLeave={() => setFocused(null)}
    >
      {cards.map((card, i) => (
        <li
          key={card.key}
          className="focus-card"
          data-dimmed={focused !== null && focused !== i ? '' : undefined}
          onMouseEnter={() => setFocused(i)}
          onFocus={() => setFocused(i)}
          onBlur={() => setFocused(null)}
        >
          <div className="focus-card-media">{card.media}</div>
          {card.corner && <div className="focus-card-corner">{card.corner}</div>}
          <div className="focus-card-body">
            <p className="focus-card-kicker">{card.kicker}</p>
            <h3>
              <AppLink href={card.href} className="focus-card-title">
                {card.title}
              </AppLink>
            </h3>
            <p className="focus-card-meta">{card.meta}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
