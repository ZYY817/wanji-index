'use client';
// /free/ 客户端：默认五分区视图 ⇄ 筛选激活统一列表（docs B 方案）
import { useMemo, useState } from 'react';
import { OfferRow } from './offer-card';
import { zh } from '@/lib/labels.mjs';

const TYPE_LABEL: Record<string, string> = { limited: '限时领取', permanent: '永久免费', trial: '免费试玩', weekend: '免费周末', opensource: '开源' };

export function FreeClient({ offers, platforms, types }: { offers: any[]; platforms: string[]; types: string[] }) {
  const [q, setQ] = useState('');
  const [plat, setPlat] = useState('');
  const [selTypes, setSelTypes] = useState<string[]>([]);

  const filtering = q.trim() !== '' || plat !== '' || selTypes.length > 0;
  const matched = useMemo(() => offers.filter((o) =>
    (!q || o.gameTitle.toLowerCase().includes(q.toLowerCase())) &&
    (!plat || o.platform === plat) &&
    (selTypes.length === 0 || selTypes.includes(o.type))
  ), [offers, q, plat, selTypes]);
  const byType = (t: string) => matched.filter((o) => o.type === t);

  const toggle = (t: string) => setSelTypes((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);
  const clear = () => { setQ(''); setPlat(''); setSelTypes([]); };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2.5">
        <input className="inp min-w-[160px] flex-1" placeholder="关键词…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="sel" value={plat} onChange={(e) => setPlat(e.target.value)}>
          <option value="">全部平台</option>
          {platforms.map((p) => <option key={p} value={p}>{zh('platform', p)}</option>)}
        </select>
        <div className="flex flex-wrap items-center gap-1.5">
          {types.map((t) => (
            <button key={t} onClick={() => toggle(t)}
              className={`min-h-[40px] rounded-full border px-3.5 text-sm transition-colors ${selTypes.includes(t) ? 'border-[var(--color-amber)] bg-[var(--color-amber-soft)] text-[var(--color-amber-hi)]' : 'border-[var(--color-line-ctl)] text-[var(--color-txt-2)] hover:border-[var(--color-amber-line)]'}`}>
              {TYPE_LABEL[t] ?? t}
            </button>
          ))}
        </div>
        {filtering && <button className="btn-line" onClick={clear}>清除</button>}
      </div>

      {filtering ? (
        <div>
          <div className="meta mb-2">共 {matched.length} 条</div>
          {matched.map((o) => <OfferRow key={o.id} offer={o} now={Date.now()} />)}
          {matched.length === 0 && <div className="py-16 text-center text-[var(--color-txt-2)]">没有符合条件的免费活动</div>}
        </div>
      ) : (
        <div className="space-y-8">
          {types.map((t) => byType(t).length > 0 && (
            <section key={t}>
              <div className="sect"><h2>{TYPE_LABEL[t]}</h2><span className="meta">{byType(t).length} 条</span></div>
              {byType(t).map((o) => <OfferRow key={o.id} offer={o} now={Date.now()} />)}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
