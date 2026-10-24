import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GameVM } from '@/lib/present';
import { genreZh } from '@/lib/genre';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from './game-art';

// 高密度列表行：编号 · 缩略图 · 名称 · 类型 · 平台 · 资源计数 · 更新
export function GameRow({ g, index }: { g: GameVM; index: number }) {
  return (
    <Link
      href={`/games/${g.slug}/`}
      className="group grid min-h-[68px] grid-cols-[auto_1fr_auto] items-center gap-x-4 border-b border-border px-1 py-2.5 transition-colors hover:bg-surface-2/60 md:grid-cols-[36px_96px_minmax(0,1fr)_minmax(0,0.9fr)_96px_60px_20px] lg:grid-cols-[36px_96px_minmax(0,1fr)_minmax(0,140px)_60px_20px] xl:grid-cols-[40px_112px_minmax(0,1.6fr)_minmax(0,1fr)_112px_64px_84px_20px]"
    >
      <span className="meta hidden text-fg-3 md:block">{String(index).padStart(3, '0')}</span>
      <GameArt src={g.art?.header} name={g.name} seed={g.id} variant="wide" className="aspect-[460/215] w-[88px] rounded-xs md:w-[96px] xl:w-[112px]" />
      <span className="min-w-0">
        <span className="block truncate font-serif text-lg font-bold tracking-[-0.01em] group-hover:text-primary">{g.name}</span>
        <span className="block truncate font-mono text-2xs text-fg-3">{g.en}</span>
      </span>
      <span className="hidden truncate text-sm text-fg-2 md:block xl:block">{g.genres.map(genreZh).join(' · ')}</span>
      <span className="hidden items-center gap-1.5 text-fg-2 md:flex lg:hidden xl:flex">{g.platforms.map((p) => <PlatformMark key={p} platform={p} />)}</span>
      <span className="text-right font-mono text-xs tabular-nums text-foreground md:text-left">
        <span className="text-fg-3 md:hidden">资源 </span>{String(g.counts.total).padStart(2, '0')}
      </span>
      <span className="hidden font-mono text-2xs tabular-nums text-fg-3 xl:block">{g.updatedAt}</span>
      <ArrowRight aria-hidden className="hidden size-4 text-fg-3 transition-colors group-hover:text-foreground md:block" />
    </Link>
  );
}
