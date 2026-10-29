import Link from 'next/link';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';

/**
 * 顶栏字标 lockup：宋体「玩机索引」+ 一个纯 CSS 的光圈/片盘标记（不再叠英文副标，顶栏只留一个声音）。
 * 实色态整体缩一号（不等于换一套字），保证首页透明态的仪式感与滚动后的克制。
 */
export function HeaderLockup({ solid }: { solid: boolean }) {
  return (
    <Link href="/" aria-label="玩机索引 Wanji Index" className="group flex min-h-11 shrink-0 items-center gap-3 lg:justify-self-start">
      <span
        aria-hidden
        className={cn(
          'relative grid shrink-0 place-items-center transition-[width,height] duration-500 ease-out',
          solid ? 'size-[26px]' : 'size-[30px]',
        )}
      >
        <span className="absolute inset-0 rounded-full border border-foreground/40 transition-colors duration-300 group-hover:border-foreground/80" />
        <span className="absolute inset-[5px] rounded-full border border-foreground/15" />
        <span className="relative size-[4px] rounded-full bg-foreground/80" />
        <span className="absolute inset-0 transition-transform duration-700 ease-out group-hover:rotate-45">
          <span className="absolute left-1/2 top-[-3px] h-[3px] w-px -translate-x-1/2 bg-foreground/55" />
          <span className="absolute bottom-[-4px] left-1/2 h-[4px] w-px -translate-x-1/2 bg-foreground/55" />
          <span className="absolute left-[-3px] top-1/2 h-px w-[3px] -translate-y-1/2 bg-foreground/55" />
          <span className="absolute right-[-3px] top-1/2 h-px w-[3px] -translate-y-1/2 bg-foreground/55" />
        </span>
      </span>

      <span
        className={cn(
          'font-display font-semibold leading-none tracking-[-0.018em] transition-[font-size] duration-500 ease-out',
          solid ? 'text-lg' : 'text-xl',
        )}
      >
        <T zh="玩机索引" en="Wanji Index" />
      </span>
    </Link>
  );
}
