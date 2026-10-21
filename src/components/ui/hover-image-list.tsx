'use client';
/**
 * Adapted from 21st.dev "Hover Image List" (@educalvolpz): hovering a row
 * reveals its picture beside the cursor, following on a spring with a slight
 * skew from horizontal speed. Keyboard focus parks the preview beside the
 * focused row. Only fine-pointer hover devices get the preview, so touch
 * screens rely on the rows' own thumbnails and server and client markup match.
 */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react';

const FOLLOW = { damping: 26, stiffness: 260 };
const SKEW = { damping: 18, stiffness: 220 };
const MAX_SKEW = 8;
const SKEW_FACTOR = 0.12;
const MAX_FRAME_DELTA_MS = 50;
const GAP = 32;
const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export function HoverImageList<T extends { id: string }>({
  items,
  preview,
  renderRow,
  rtl = false,
  width = 280,
  height = 200,
  focusInset = 24,
  className = '',
  listRef,
}: {
  items: T[];
  /** The picture shown for a row; decorative, as the row already names it. */
  preview: (item: T) => ReactNode;
  renderRow: (item: T, index: number) => ReactNode;
  rtl?: boolean;
  width?: number;
  height?: number;
  /** Distance from the inline end for the keyboard-focus preview, clear of row controls. */
  focusInset?: number;
  className?: string;
  listRef?: React.Ref<HTMLOListElement>;
}) {
  const reduce = useReducedMotion();
  const [hoverDevice, setHoverDevice] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const [source, setSource] = useState<'pointer' | 'focus' | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const last = useRef<{ t: number; x: number } | null>(null);
  const pending = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const skew = useMotionValue(0);
  const springX = useSpring(x, FOLLOW);
  const springY = useSpring(y, FOLLOW);
  const springSkew = useSpring(skew, SKEW);

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    setHoverDevice(query.matches);
    const change = (e: MediaQueryListEvent) => setHoverDevice(e.matches);
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  /** Beside the cursor toward the inline end, flipping sides where it would not fit. */
  const besideCursor = useCallback(
    (localX: number, boxWidth: number) => {
      const after = localX + GAP;
      const before = localX - width - GAP;
      if (rtl) return before >= 0 ? before : after;
      return after + width <= boxWidth ? after : before;
    },
    [rtl, width],
  );

  /** Keeps the preview inside the list vertically, where the stage clips it. */
  const withinList = useCallback(
    (top: number, boxHeight: number) =>
      clamp(top, 0, Math.max(0, boxHeight - height)),
    [height],
  );

  /** Keyboard focus: park the preview toward the inline end, centred on the row. */
  const park = useCallback(
    (row: HTMLElement) => {
      const box = container.current;
      if (!box) return;
      x.jump(rtl ? focusInset : box.clientWidth - width - focusInset);
      y.jump(
        withinList(
          row.offsetTop + row.offsetHeight / 2 - height / 2,
          box.clientHeight,
        ),
      );
      skew.jump(0);
    },
    [rtl, width, height, focusInset, withinList, x, y, skew],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!hoverDevice || source === 'focus') return;
      pending.current = { x: event.clientX, y: event.clientY };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame((now) => {
        frame.current = null;
        const point = pending.current;
        const box = container.current;
        if (!point || !box) return;
        const rect = box.getBoundingClientRect();
        const localX = point.x - rect.left;
        const localY = point.y - rect.top;
        let vx = 0;
        if (last.current) {
          const dt = Math.min(now - last.current.t, MAX_FRAME_DELTA_MS);
          if (dt > 0) vx = (localX - last.current.x) / dt;
        }
        last.current = { t: now, x: localX };
        skew.set(reduce ? 0 : clamp(vx * SKEW_FACTOR, -MAX_SKEW, MAX_SKEW));
        x.set(besideCursor(localX, rect.width));
        y.set(withinList(localY - height / 2, rect.height));
      });
    },
    [hoverDevice, source, reduce, besideCursor, withinList, height, x, y, skew],
  );

  const activeItem = active === null ? null : items[active];
  return (
    <div
      ref={container}
      className={'hover-list ' + className}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        if (source === 'pointer') {
          setActive(null);
          setSource(null);
        }
        last.current = null;
      }}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (source === 'focus' && !e.currentTarget.contains(e.relatedTarget)) {
          setActive(null);
          setSource(null);
        }
      }}
    >
      <ol ref={listRef} className="hover-list-rows">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="hover-list-row"
            data-active={active === index ? '' : undefined}
            onMouseEnter={(e) => {
              if (!hoverDevice) return;
              // Start where the cursor enters rather than flying in from a corner.
              if (active === null) {
                const box = container.current!.getBoundingClientRect();
                const localX = e.clientX - box.left;
                x.jump(besideCursor(localX, box.width));
                y.jump(
                  withinList(e.clientY - box.top - height / 2, box.height),
                );
              }
              setActive(index);
              setSource('pointer');
            }}
            onFocus={(e) => {
              if (!hoverDevice) return;
              park(e.currentTarget);
              setActive(index);
              setSource('focus');
            }}
          >
            {renderRow(item, index)}
          </li>
        ))}
      </ol>
      {hoverDevice && (
        <div className="hover-list-stage" aria-hidden>
          <motion.div
            className="hover-list-preview"
            initial={false}
            animate={{
              opacity: activeItem ? 1 : 0,
              scale: activeItem ? 1 : 0.94,
            }}
            transition={{ type: 'spring', bounce: 0.1, duration: 0.25 }}
            style={{
              width,
              height,
              x: springX,
              y: springY,
              skewX: springSkew,
            }}
          >
            <AnimatePresence initial={false}>
              {activeItem && (
                <motion.div
                  key={activeItem.id}
                  className="hover-list-image"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
                >
                  {preview(activeItem)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </div>
  );
}
