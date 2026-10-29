'use client';
import { T } from '@/lib/i18n';
// /check/ 列表：按「流畅 / 能玩 / 吃力」把所有游戏分好，配置没设置时先显示设置面板
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { judge, VERDICT_LABEL, VERDICT_EN, type Reqs, type Verdict } from '@/lib/hardware';
import { GameArt } from '@/components/game/game-art';
import { RigPicker, useRig, VerdictMark } from './rig';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CheckGame = { id: string; slug: string; name: string; en?: string; art?: string; reqs?: Reqs };
const ORDER: Verdict[] = ['smooth', 'playable', 'weak', 'unknown'];

export function CheckList({ games }: { games: CheckGame[] }) {
  const rig = useRig();
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Verdict | 'all'>('all');

  const rows = useMemo(() => games.map((g) => ({ g, ...(rig ? judge(rig, g.reqs) : { verdict: 'unknown' as Verdict, reason: '', reasonEn: '' }) }))
    .sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict)), [games, rig]);
  const counts = useMemo(() => Object.fromEntries(ORDER.map((v) => [v, rows.filter((r) => r.verdict === v).length])) as Record<Verdict, number>, [rows]);
  const shown = tab === 'all' ? rows : rows.filter((r) => r.verdict === tab);

  return (
    <div>
      {!rig || editing ? (
        <RigPicker onDone={() => setEditing(false)} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4 lift rounded-md p-5 md:p-6">
          <p className="text-base">
            <span className="text-fg-3"><T zh="我的配置" en="My PC" /> </span>
            <span className="font-semibold text-foreground">{rig.gpu?.name}{rig.gpu && rig.ramGb ? ' · ' : ''}{rig.ramGb ? <T zh={`${rig.ramGb} GB 内存`} en={`${rig.ramGb} GB RAM`} /> : null}</span>
          </p>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><T zh="改配置" en="Edit" /></Button>
        </div>
      )}

      {rig && (
        <>
          <div role="tablist" aria-label="Filter by result" className="mt-10 flex flex-wrap gap-2 border-b border-border pb-4">
            {(['all', ...ORDER] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={tab === v}
                onClick={() => setTab(v)}
                className={cn(
                  'h-10 rounded-sm px-4 text-base transition-colors',
                  tab === v ? 'bg-surface-2 text-foreground' : 'text-fg-2 hover:text-foreground',
                )}
              >
                {v === 'all' ? <T zh="全部" en="All" /> : <T zh={VERDICT_LABEL[v]} en={VERDICT_EN[v]} />}
                <span className="ml-2 tabular text-sm tabular-nums text-fg-3">{v === 'all' ? rows.length : counts[v]}</span>
              </button>
            ))}
          </div>

          <ul className="mt-2">
            {shown.map(({ g, verdict, reason, reasonEn }) => (
              <li key={g.id}>
                <Link
                  href={`/games/${g.slug}/#specs`}
                  className="group grid grid-cols-[88px_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-border py-3 transition-colors hover:bg-card md:grid-cols-[104px_minmax(0,1fr)_96px_minmax(0,1fr)_20px]"
                >
                  <div className="edge-light relative aspect-[460/215] w-full overflow-hidden rounded-sm">
                    <GameArt src={g.art} name={g.name} seed={g.id} variant="wide" className="size-full" />
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-semibold"><T zh={g.name} en={g.en || g.name} /></span>
                    <span className="block truncate text-sm text-fg-2 md:hidden"><T zh={reason} en={reasonEn} /></span>
                    {g.en && <span className="hidden truncate text-sm text-fg-2 md:block"><T zh={g.en} en={g.en !== g.name ? g.name : ''} /></span>}
                  </span>
                  <VerdictMark verdict={verdict} />
                  <span className="hidden truncate text-sm text-fg-2 md:block"><T zh={reason} en={reasonEn} /></span>
                  <ArrowRight aria-hidden className="hidden size-4 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground md:block" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
