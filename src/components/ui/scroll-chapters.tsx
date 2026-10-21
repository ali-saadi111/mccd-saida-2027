'use client';
/**
 * Adapted from 21st.dev "Scroll Reveal Content A" (abui): numbered chapters
 * whose progress line grows as each one is read, beside a sticky picture that
 * follows the chapter in view. Laid out in normal flow rather than a 300vh
 * scroll track, and every chapter stays at full contrast; only the line and
 * the number mark progress. Narrow screens show each picture inline instead.
 */
import { useRef, useState, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import { numberLabel } from '@/lib/dates';

export type Chapter = {
  id: string;
  title: string;
  body: ReactNode;
  /** Decorative; the chapter's title and text carry its meaning. */
  media: ReactNode;
};

export function ScrollChapters({
  chapters,
  locale,
}: {
  chapters: Chapter[];
  locale: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="chapters">
      <ol className="chapters-list">
        {chapters.map((chapter, index) => (
          <ChapterItem
            key={chapter.id}
            chapter={chapter}
            number={numberLabel(index + 1, locale, { minimumIntegerDigits: 2 })}
            active={active === index}
            onActive={() => setActive(index)}
          />
        ))}
      </ol>
      <div className="chapters-media" aria-hidden>
        <div className="chapters-frame">
          {chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className="chapters-image"
              data-active={active === index ? '' : undefined}
            >
              {chapter.media}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterItem({
  chapter,
  number,
  active,
  onActive,
}: {
  chapter: Chapter;
  number: string;
  active: boolean;
  onActive: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 65%', 'end 45%'],
  });
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (value > 0 && value < 1) onActive();
  });
  return (
    <li ref={ref} className="chapter" data-active={active ? '' : undefined}>
      <span className="chapter-number" aria-hidden>
        {number}
      </span>
      <span className="chapter-rail" aria-hidden>
        <motion.span
          className="chapter-progress"
          style={{ scaleY: scrollYProgress }}
        />
      </span>
      <div className="chapter-body">
        <h3>{chapter.title}</h3>
        {chapter.body}
        <div className="chapter-media-inline" aria-hidden>
          {chapter.media}
        </div>
      </div>
    </li>
  );
}
