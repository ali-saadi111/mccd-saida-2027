'use client';
/**
 * Adapted from 21st.dev "Chip Group" (@kuratlielia): selecting morphs the chip —
 * a check draws itself in, the label slides over and the chip's edge follows on
 * a spring while neighbours glide to their new places. Restyled with the site
 * tokens, made direction-aware for Arabic and given optional live counts.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, RefObject } from 'react';
import {
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';

export type ChipOption = { value: string; label: string; count?: string };

const spring = {
  morph: { type: 'spring', visualDuration: 0.34, bounce: 0.12 },
  snappy: { type: 'spring', visualDuration: 0.24, bounce: 0.2 },
} as const;
/** The width the check takes from the label: a 14px glyph and its gap. */
const SLOT = 20;

/**
 * A chip's layout width changes in one frame so the row re-flows once, but the
 * visible edge trails it: `lag` jumps by the change, then springs back to zero.
 */
function useWidthLag(
  node: RefObject<HTMLElement | null>,
  key: string,
  reduce: boolean,
) {
  const lag = useMotionValue(0);
  const width = useRef<number | null>(null);
  useLayoutEffect(() => {
    const element = node.current;
    if (!element) return;
    const next = element.offsetWidth;
    const previous = width.current;
    width.current = next;
    if (previous === null || previous === next) return;
    if (reduce) return lag.jump(0);
    const velocity = lag.getVelocity();
    lag.jump(lag.get() + previous - next);
    animate(lag, 0, { ...spring.morph, velocity });
  }, [key, lag, node, reduce]);
  useEffect(() => {
    const element = node.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      width.current = element.offsetWidth;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [node]);
  return lag;
}

function Chip({
  option,
  selected,
  tabbable,
  reduce,
  rtl,
  onToggle,
  onFocusChip,
}: {
  option: ChipOption;
  selected: boolean;
  tabbable: boolean;
  reduce: boolean;
  rtl: boolean;
  onToggle: (value: string) => void;
  onFocusChip: (value: string) => void;
}) {
  const body = useRef<HTMLSpanElement>(null);
  const lag = useWidthLag(body, String(selected), reduce);
  const slot = useRef(selected ? SLOT : 0);
  const grown = useMotionValue(selected ? 1 : 0);
  const edge = useTransform(lag, (v) => -v);
  const shift = useTransform(lag, (v) => (rtl ? -v : v));
  const checkScale = useTransform(grown, (v) => Math.min(v, 1.1));
  const checkOpacity = useTransform(grown, (v) => Math.min(1, v * 1.4));
  const checkDraw = useTransform(grown, (v) => Math.min(1, Math.max(0.001, v)));
  useLayoutEffect(() => {
    slot.current = selected ? SLOT : 0;
    const update = () =>
      grown.set(Math.max(0, (slot.current + lag.get()) / SLOT));
    update();
    return lag.on('change', update);
  }, [selected, lag, grown]);
  return (
    <motion.button
      type="button"
      className="chip"
      data-chip={option.value}
      aria-pressed={selected}
      tabIndex={tabbable ? 0 : -1}
      onClick={() => onToggle(option.value)}
      onFocus={() => onFocusChip(option.value)}
      layout="position"
      transition={{ layout: reduce ? { duration: 0 } : spring.morph }}
    >
      <span ref={body} className="chip-body" data-selected={selected}>
        <motion.span
          className="chip-surface"
          style={rtl ? { left: edge } : { right: edge }}
          aria-hidden
        />
        <motion.span
          className="chip-check"
          style={{ scale: checkScale, opacity: checkOpacity }}
          aria-hidden
        >
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <motion.path
              d="M4 12.5 9.5 18 20 6.5"
              style={{ pathLength: checkDraw }}
            />
          </svg>
        </motion.span>
        <span className="chip-slot" aria-hidden />
        <motion.span className="chip-label" style={{ x: shift }}>
          {option.label}
          {option.count !== undefined && (
            <span className="chip-count">{option.count}</span>
          )}
        </motion.span>
      </span>
    </motion.button>
  );
}

export function ChipGroup({
  options,
  value,
  onValueChange,
  label,
  multiple = false,
  rtl = false,
  className = '',
}: {
  options: ChipOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  /** Accessible name of the group. */
  label: string;
  /** In single mode the selected chip can still be cleared by pressing it. */
  multiple?: boolean;
  rtl?: boolean;
  className?: string;
}) {
  const id = useId();
  const reduce = !!useReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const keys = options.map((o) => o.value);
  // One chip holds the tab stop: the last focused, else the first selected, else the first.
  const tabStop =
    active !== null && keys.includes(active)
      ? active
      : (keys.find((k) => value.includes(k)) ?? keys[0]);
  function toggle(next: string) {
    const on = value.includes(next);
    if (!multiple) return onValueChange(on ? [] : [next]);
    onValueChange(
      keys.filter((k) => (k === next ? !on : value.includes(k))),
    );
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const buttons = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        'button[data-chip]',
      ),
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const last = buttons.length - 1;
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    const moves: Record<string, number> = {
      [forward]: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      [back]: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    buttons[moves[event.key]].focus();
  }
  return (
    <LayoutGroup id={id}>
      <div
        className={'chip-group ' + className}
        role="group"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {options.map((option) => (
          <Chip
            key={option.value}
            option={option}
            selected={value.includes(option.value)}
            tabbable={tabStop === option.value}
            reduce={reduce}
            rtl={rtl}
            onToggle={toggle}
            onFocusChip={setActive}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
