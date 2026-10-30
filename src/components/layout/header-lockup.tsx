import Link from 'next/link';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';
import { BrandMark } from '@/components/ui/brand-mark';

/**
 * 顶栏字标 lockup：品牌图形（W + 菱形，src/lib/brand.mjs）+ 黑体「玩机索引」（不再叠英文副标，顶栏只留一个声音）。
 * 实色态整体缩一号（不等于换一套字），保证首页透明态的仪式感与滚动后的克制。
 */
export function HeaderLockup({ solid }: { solid: boolean }) {
  return (
    <Link href="/" aria-label="玩机索引 Wanji Index" className="group flex min-h-11 shrink-0 items-center gap-3 lg:justify-self-start">
      <BrandMark
        className={cn(
          'transition-[width,height,opacity] duration-500 ease-out group-hover:opacity-80',
          solid ? 'size-[22px]' : 'size-[26px]',
        )}
      />

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
