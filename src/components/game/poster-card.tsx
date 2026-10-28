import Link from 'next/link';
import type { GameVM } from '@/lib/present';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from './game-art';
import { Tilt } from '@/components/fx/interact';
import { cn } from '@/lib/utils';
import { T } from '@/lib/i18n';
import { G } from '@/lib/labels-i18n';

/** 档案里有什么：只列出真实存在的资源，给用户「点进去能得到什么」的预期 */
export function archiveFacts(g: GameVM): [string, string, number?][] {
  const c = g.counts;
  return ([
    c.entries ? ['MOD', 'Mods', c.entries] : null,
    c.paths ? ['存档', 'Saves'] : null,
    c.tools ? ['工具', 'Tools', c.tools] : null,
    c.guides ? ['教程', 'Guides', c.guides] : null,
  ] as ([string, string, number?] | null)[]).filter((x): x is [string, string, number?] => x !== null);
}

// 海报卡：竖版官方美术 → 名称 → 类型 → 档案资源概览。悬停：美术随鼠标轻微 3D 倾斜 + 跟随高光，并显示平台标识。
export function PosterCard({ g, className, priority }: { g: GameVM; className?: string; priority?: boolean }) {
  const facts = archiveFacts(g);
  return (
    <Link href={`/games/${g.slug}/`} className={cn('group block', className)}>
      <Tilt max={4} className="rounded-sm">
        <div className="edge-light relative aspect-[2/3] overflow-hidden rounded-sm ring-1 ring-white/[0.06] transition-[box-shadow] duration-300 group-hover:ring-foreground/40 group-focus-visible:ring-primary">
          <GameArt src={[g.art?.poster, g.art?.capsule, g.art?.header]} name={g.name} en={g.en} seed={g.id} priority={priority} className="absolute inset-0" imgClassName="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
          {g.hasOffer && (
            <span className="absolute left-2.5 top-2.5 inline-flex h-6 items-center rounded-xs bg-primary px-2 text-xs font-medium text-primary-foreground"><T zh="免费中" en="Free now" /></span>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-[linear-gradient(0deg,rgba(19,18,17,0.9),transparent)] px-3 pb-3 pt-10 text-foreground/85 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            {g.platforms.map((p) => <PlatformMark key={p} platform={p} withLabel={g.platforms.length < 3} className="text-xs" />)}
          </div>
        </div>
      </Tilt>
      <p className="mt-3 truncate font-serif text-lg font-bold leading-snug tracking-[-0.01em] transition-colors group-hover:text-primary"><T zh={g.name} en={g.en || g.name} /></p>
      <p className="mt-0.5 truncate text-sm text-fg-2">{g.genres.length ? g.genres.slice(0, 2).map((x, i) => <span key={x}>{i > 0 && ' · '}{G(x)}</span>) : g.en}</p>
      {facts.length > 0 && (
        <p className="mt-1.5 truncate text-sm text-fg-2">
          {facts.map(([zhLabel, enLabel, n], i) => (
            <span key={i}>
              {i > 0 && <span className="text-fg-3"> · </span>}
              <T zh={zhLabel} en={enLabel} />
              {n != null && <span className="font-mono"> {n}</span>}
            </span>
          ))}
        </p>
      )}
    </Link>
  );
}
