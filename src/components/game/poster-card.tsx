import Link from 'next/link';
import type { GameVM } from '@/lib/present';
import { genreZh } from '@/lib/genre';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from './game-art';
import { cn } from '@/lib/utils';

// 海报卡：竖版官方美术 + 档案编号；悬停揭示资源计数与平台（无投影、无上浮）
export function PosterCard({ g, index, className, priority }: { g: GameVM; index?: number; className?: string; priority?: boolean }) {
  return (
    <Link href={`/games/${g.slug}/`} className={cn('group block', className)}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-sm ring-1 ring-white/[0.06] transition-[box-shadow] duration-300 group-hover:ring-foreground/40 group-focus-visible:ring-primary">
        <GameArt src={g.art?.poster} name={g.name} en={g.en} seed={g.id} priority={priority} className="absolute inset-0" imgClassName="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
        <div className="absolute inset-0 flex flex-col justify-end bg-[linear-gradient(0deg,rgba(10,10,9,0.96)_0%,rgba(10,10,9,0.55)_42%,transparent_72%)] p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <dl className="grid grid-cols-3 gap-px border border-white/15 bg-white/15 font-mono text-2xs">
            {[['渠道', g.counts.channels], ['入口', g.counts.entries], ['工具', g.counts.tools]].map(([k, v]) => (
              <div key={k as string} className="bg-background/85 px-1.5 py-1">
                <dt className="text-fg-3">{k}</dt>
                <dd className="text-sm tabular-nums text-foreground">{String(v).padStart(2, '0')}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 flex items-center gap-1.5 text-foreground/80">
            {g.platforms.map((p) => <PlatformMark key={p} platform={p} />)}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        {index != null && <span className="meta shrink-0 text-2xs text-fg-3">{String(index).padStart(3, '0')}</span>}
        <span className="truncate font-serif text-base font-bold tracking-[-0.01em] group-hover:text-primary">{g.name}</span>
      </div>
      <p className="mt-0.5 truncate font-mono text-2xs text-fg-3">{g.genres.slice(0, 2).map(genreZh).join(' · ') || g.en}</p>
    </Link>
  );
}
