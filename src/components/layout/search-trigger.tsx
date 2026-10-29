'use client';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useCommand } from './command-palette';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';
import { useL } from './lang-toggle';

/**
 * 命令面板触发器：variant=bar 为 Hero / 搜索页的大号触发条；
 * compact 是顶栏形制（放大镜 + 搜索 + 闪烁 caret + Ctrl K）；
 * icon 用于移动端，保持 44px 触控区。
 */
export function SearchTrigger({ variant = 'compact', className, label }: { variant?: 'compact' | 'bar' | 'icon'; className?: string; label?: string }) {
  const { setOpen } = useCommand();
  const l = useL();
  const [mod, setMod] = useState('Ctrl');
  useEffect(() => { if (/Mac|iPhone|iPad/.test(navigator.platform)) setMod('⌘'); }, []);

  if (variant === 'icon')
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${l('打开搜索', 'Open search')}（${mod} K）`}
        className={cn(
          'relative grid size-11 place-items-center text-foreground transition-colors focus-visible:text-primary',
          className,
        )}
      >
        <Search className="size-[19px]" aria-hidden />
      </button>
    );

  if (variant === 'bar')
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${l('打开搜索', 'Open search')}（Ctrl K）`}
        className={cn(
          'glass group flex h-14 w-full items-center gap-3 rounded-full px-5 text-left ring-1 ring-white/[0.1] transition-[box-shadow] hover:ring-white/25',
          className,
        )}
      >
        <Search className="size-[18px] shrink-0 text-foreground" aria-hidden />
        <span className="flex-1 truncate text-base text-fg-2 group-hover:text-foreground">{label ?? <T zh="搜索游戏、资源站、工具或报错…" en="Search games, sites, tools or errors…" />}</span>
        <span className="hidden items-center gap-1 sm:flex"><Kbd className="border-foreground/30 text-foreground/80">{mod}</Kbd><Kbd className="border-foreground/30 text-foreground/80">K</Kbd></span>
      </button>
    );

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`${l('打开搜索', 'Open search')}（${mod} K）`}
      className={cn(
        'group relative inline-flex h-8 items-center rounded-full px-2.5 text-xs text-foreground/55',
        'transition-[color,background-color] duration-300',
        'hover:bg-white/[0.08] hover:text-foreground',
        className,
      )}
    >
      <Search aria-hidden className="mr-1.5 size-[14px] transition-colors" />
      <span className="flex items-center whitespace-nowrap">
        <T zh="搜索" en="Search" />
        <span
          aria-hidden
          className="ml-1.5 inline-block h-[13px] w-px shrink-0 bg-foreground opacity-0 transition-opacity group-hover:animate-blink group-hover:opacity-100 group-focus-visible:animate-blink group-focus-visible:bg-primary group-focus-visible:opacity-100 motion-reduce:animate-none"
        />
      </span>
      <span className="ml-3 flex items-center gap-0.5 opacity-70">
        <Kbd className="h-5 min-w-5 rounded-full border-0 bg-white/[0.08] px-1.5 text-2xs">{mod}</Kbd>
        <Kbd className="h-5 min-w-5 rounded-full border-0 bg-white/[0.08] px-1.5 text-2xs">K</Kbd>
      </span>
    </button>
  );
}
