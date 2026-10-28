import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { GameVM } from '@/lib/present';
import { PlatformMark } from '@/components/ui/platform-mark';
import { GameArt } from './game-art';
import { T } from '@/lib/i18n';
import { G } from '@/lib/labels-i18n';

// 列表视图的列宽：表头（GameTableHead）与每一行共用，保证上下对齐
const COLS = 'grid-cols-[88px_minmax(0,1fr)_auto] md:grid-cols-[104px_minmax(0,1.4fr)_minmax(0,1fr)_120px_56px_56px_56px_20px] xl:grid-cols-[120px_minmax(0,1.4fr)_minmax(0,1fr)_140px_64px_64px_64px_96px_20px]';

const num = (n: number) => (n ? String(n) : '—');

export function GameTableHead() {
  return (
    <div className={`hidden items-end gap-x-4 border-b border-border-strong pb-3 text-sm text-fg-2 md:grid ${COLS}`}>
      <span />
      <span><T zh="游戏" en="Game" /></span>
      <span><T zh="类型" en="Genre" /></span>
      <span><T zh="渠道" en="Stores" /></span>
      <span className="text-right">MOD</span>
      <span className="text-right"><T zh="工具" en="Tools" /></span>
      <span className="text-right"><T zh="教程" en="Guides" /></span>
      <span className="hidden text-right xl:block"><T zh="核验" en="Checked" /></span>
      <span />
    </div>
  );
}

// 高密度列表行：缩略图 · 名称 · 类型 · 渠道 · MOD / 工具 / 教程计数 · 核验日期
export function GameRow({ g }: { g: GameVM }) {
  return (
    <Link href={`/games/${g.slug}/`} className={`group grid min-h-[72px] items-center gap-x-4 border-b border-border py-3 transition-colors hover:bg-card ${COLS}`}>
      <div className="edge-light relative aspect-[460/215] w-full overflow-hidden rounded-xs">
        <GameArt src={g.art?.header} name={g.name} seed={g.id} variant="wide" className="size-full" />
      </div>
      <span className="min-w-0">
        <span className="block truncate text-lg font-semibold tracking-[-0.01em] transition-colors group-hover:text-primary"><T zh={g.name} en={g.en || g.name} /></span>
        <span className="block truncate text-sm text-fg-2">
          <T zh={g.en} en={g.en && g.en !== g.name ? g.name : ''} />
          {g.hasOffer && <span className="ml-2 font-medium text-primary"><T zh="免费中" en="Free now" /></span>}
        </span>
      </span>
      <span className="hidden truncate text-sm text-fg-2 md:block">{g.genres.map((x, i) => <span key={x}>{i > 0 && ' · '}{G(x)}</span>)}</span>
      <span className="hidden items-center gap-1.5 text-fg-2 md:flex">{g.platforms.map((p) => <PlatformMark key={p} platform={p} />)}</span>
      <span className="hidden text-right font-mono text-base tabular-nums text-foreground md:block">{num(g.counts.entries)}</span>
      <span className="hidden text-right font-mono text-base tabular-nums text-foreground md:block">{num(g.counts.tools)}</span>
      <span className="hidden text-right font-mono text-base tabular-nums text-foreground md:block">{num(g.counts.guides)}</span>
      <span className="hidden text-right font-mono text-2xs tabular-nums text-fg-3 xl:block">{g.checkedAt}</span>
      <ArrowRight aria-hidden className="size-4 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
