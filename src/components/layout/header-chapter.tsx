'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getLenis } from './providers';

const CHAPTERS = [
  { no: '01', label: '开映' },
  { no: '02', label: '片库' },
  { no: '03', label: '档案' },
  { no: '04', label: '雷达' },
  { no: '05', label: '目录' },
  { no: '06', label: '装机' },
  { no: '07', label: '片尾' },
] as const;

/**
 * 首页章节读数：按 main > section 的 DOM 顺序（01 开映 … 06 装机）取当前章，
 * 片尾（footer）进入视口后切到 07。只缓存一次布局，滚动时不再读布局。
 */
export function useChapterIndex(enabled: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setIndex(0);
      return;
    }
    let tops: number[] = [];
    let footerTop = Number.POSITIVE_INFINITY;
    let raf = 0;

    const measure = () => {
      tops = Array.from(document.querySelectorAll<HTMLElement>('main > section')).map(
        (el) => el.getBoundingClientRect().top + window.scrollY,
      );
      const footer = document.querySelector<HTMLElement>('footer');
      footerTop = footer ? footer.getBoundingClientRect().top + window.scrollY : Number.POSITIVE_INFINITY;
    };

    const update = () => {
      const anchor = window.scrollY + window.innerHeight * 0.36;
      let next = 0;
      for (let i = 0; i < tops.length; i += 1) if (anchor >= tops[i]) next = i;
      if (window.scrollY + window.innerHeight - footerTop > 96) next = CHAPTERS.length - 1;
      setIndex((prev) => (prev === next ? prev : Math.min(next, CHAPTERS.length - 1)));
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    const remeasure = () => {
      measure();
      update();
    };

    remeasure();
    const late = window.setTimeout(remeasure, 700);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', remeasure);
    window.addEventListener('load', remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', remeasure);
      window.removeEventListener('load', remeasure);
      ro.disconnect();
    };
  }, [enabled]);

  return index;
}

/**
 * 首页右缘章节进度轨（xl 以上）：7 个刻度，当前章变长变亮，章节名竖排在下方淡入。
 * 放右缘是为了不和档案章左侧步骤刻度撞车；mix-blend-difference 让它在纸面章节上同样可见。
 * 点刻度跳到对应章节。只做 transform / opacity / 颜色过渡，不在滚动中读布局。
 */
export function ChapterRail() {
  const index = useChapterIndex(true);
  const reduced = useReducedMotion();
  const chapter = CHAPTERS[index] ?? CHAPTERS[0];

  const jump = (i: number) => {
    const target = i === CHAPTERS.length - 1
      ? document.querySelector<HTMLElement>('footer')
      : document.querySelectorAll<HTMLElement>('main > section')[i];
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(top, { duration: reduced ? 0 : 1.2 });
    else window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <nav
      aria-label="首页章节"
      className="fixed right-[14px] top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end mix-blend-difference xl:flex"
    >
      <ol className="flex flex-col gap-2.5">
        {CHAPTERS.map((c, i) => {
          const on = i === index;
          return (
            <li key={c.no}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-label={`第 ${c.no} 章 ${c.label}`}
                aria-current={on ? 'step' : undefined}
                className="group flex h-3 w-6 items-center justify-end"
              >
                <span
                  className={cn(
                    'block h-px w-6 origin-right transition-[transform,background-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
                    on ? 'scale-x-100 bg-foreground' : 'scale-x-50 bg-foreground/40 group-hover:scale-x-75 group-hover:bg-foreground/80',
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
      <span aria-hidden className="relative mt-4 block h-[5.5em] w-[1.4em] overflow-hidden text-xs">
        <AnimatePresence initial={false}>
          <motion.span
            key={chapter.no}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-0 flex items-center gap-1.5 font-mono tracking-[0.12em] text-foreground/70 [writing-mode:vertical-rl]"
          >
            <span className="text-foreground">{chapter.no}</span>
            <span>{chapter.label}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </nav>
  );
}
