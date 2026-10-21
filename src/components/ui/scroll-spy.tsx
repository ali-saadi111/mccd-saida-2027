'use client';
/**
 * Adapted from 21st.dev "Scroll Spy" (@ddoemonn): tracks the section in view
 * and slides a pill to it, with smooth click-to-scroll that holds the target
 * until the scroll settles. Restyled with the site tokens; the rail is
 * vertical on wide screens and a horizontal sticky strip on narrow ones.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const PILL = { type: 'spring', stiffness: 520, damping: 38, mass: 0.5 } as const;
const RELEASE = 900;

export type ScrollSpySection = { id: string; label: string; meta?: string };

export function useScrollSpy({
  sections,
  offset = 120,
}: {
  sections: ScrollSpySection[];
  offset?: number;
}) {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState(() => sections[0]?.id ?? '');
  const list = useRef(sections);
  list.current = sections;
  const frame = useRef(0);
  const lock = useRef<string | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = sections.map((s) => s.id).join('|');

  const measure = useCallback(() => {
    const items = list.current;
    if (!items.length) return '';
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    // The reading line drifts down as the page nears its end, so short last sections still light up.
    const line =
      offset + ratio * Math.max(0, window.innerHeight - offset - 1) * 0.6;
    let current = '';
    for (const item of items) {
      const node = document.getElementById(item.id);
      if (!node) continue;
      if (!current) current = item.id;
      if (node.getBoundingClientRect().top <= line + 1) current = item.id;
    }
    return current;
  }, [offset]);

  const release = useCallback(() => {
    lock.current = null;
    if (lockTimer.current) clearTimeout(lockTimer.current);
    lockTimer.current = null;
  }, []);

  const sync = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const next = measure();
      if (!next) return;
      if (lock.current) {
        if (lock.current === next) release();
        return;
      }
      setActiveId((prev) => (prev === next ? prev : next));
    });
  }, [measure, release]);

  useEffect(() => {
    const abandon = () => lock.current && release();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    window.addEventListener('wheel', abandon, { passive: true });
    window.addEventListener('touchstart', abandon, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(document.documentElement);
    sync();
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('wheel', abandon);
      window.removeEventListener('touchstart', abandon);
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (lockTimer.current) clearTimeout(lockTimer.current);
    };
  }, [sync, release, key]);

  const scrollTo = useCallback(
    (id: string) => {
      const node = document.getElementById(id);
      if (!node) return;
      lock.current = id;
      setActiveId(id);
      const top = node.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduced ? 'auto' : 'smooth',
      });
      if (!node.hasAttribute('tabindex')) node.setAttribute('tabindex', '-1');
      node.focus({ preventScroll: true });
      if (lockTimer.current) clearTimeout(lockTimer.current);
      lockTimer.current = setTimeout(() => {
        lock.current = null;
        lockTimer.current = null;
        sync();
      }, RELEASE);
    },
    [offset, reduced, sync],
  );

  return { activeId, scrollTo };
}

export function ScrollSpy({
  sections,
  label,
  offset,
  className = '',
}: {
  sections: ScrollSpySection[];
  label: string;
  offset?: number;
  className?: string;
}) {
  const { activeId, scrollTo } = useScrollSpy({ sections, offset });
  const reduced = useReducedMotion();
  const pillId = useId();
  const items = useRef(new Map<string, HTMLElement>());
  useEffect(() => {
    // Keep the active chip in view when the rail scrolls sideways on small screens.
    const el = items.current.get(activeId);
    const rail = el?.parentElement;
    if (!el || !rail || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({
      left: el.offsetLeft - rail.clientWidth / 2 + el.clientWidth / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }, [activeId, reduced]);
  return (
    <nav aria-label={label} className={'spy ' + className}>
      <p className="spy-title" aria-hidden>
        {label}
      </p>
      <ol className="spy-list scrollbar-hide">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <li
              key={section.id}
              ref={(el) => {
                if (el) items.current.set(section.id, el);
                else items.current.delete(section.id);
              }}
              className="spy-item"
            >
              {active && (
                <motion.span
                  layoutId={reduced ? undefined : pillId}
                  transition={PILL}
                  className="spy-pill"
                  aria-hidden
                />
              )}
              <a
                href={'#' + section.id}
                aria-current={active ? 'location' : undefined}
                className="spy-link"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)
                    return;
                  e.preventDefault();
                  scrollTo(section.id);
                }}
              >
                <span>{section.label}</span>
                {section.meta && <small>{section.meta}</small>}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
