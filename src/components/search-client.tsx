'use client';
// /search/：三态分离（空引导/无结果/索引失败）+ 分类 tab + 命中高亮
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { withBase } from '@/lib/base';

const TYPE_LABEL: Record<string, string> = { game: '游戏', site: '资源站', tool: '工具', guide: '教程' };
const TABS = ['', 'game', 'site', 'tool', 'guide'] as const;

export function SearchClient() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [tab, setTab] = useState('');
  const [index, setIndex] = useState<any>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);
  useEffect(() => {
    fetch(withBase('/search-index.json'))
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setIndex).catch(() => setFailed(true));
  }, []);

  const hits = useMemo(() => {
    if (!index || !q.trim()) return [];
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return index.items.filter((i: any) => {
      const hay = [i.title, i.sub, i.summary, ...(i.keywords ?? [])].join(' ').toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [index, q]);

  const groups = Object.keys(TYPE_LABEL).map((t) => ({ t, list: hits.filter((i: any) => i.type === t) }));
  const shown = tab ? groups.filter((g) => g.t === tab) : groups;

  const hl = (text: string) => {
    if (!text || !q.trim()) return text;
    const ws = q.toLowerCase().split(/\s+/).filter(Boolean);
    const esc = ws.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return text.split(new RegExp(`(${esc})`, 'gi')).map((part, i) =>
      ws.includes(part.toLowerCase()) ? <mark key={i}>{part}</mark> : part);
  };

  const setQuery = (v: string) => {
    setQ(v);
    const u = new URL(location.href);
    v.trim() ? u.searchParams.set('q', v) : u.searchParams.delete('q');
    history.replaceState(null, '', u);
  };

  return (
    <div className="mt-6">
      <input className="inp !h-12 max-w-[560px]" placeholder="游戏名、报错文本、工具名…" value={q} onChange={(e) => setQuery(e.target.value)} />

      {q.trim() && index && (
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const n = t ? hits.filter((i: any) => i.type === t).length : hits.length;
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`min-h-[36px] rounded-full border px-3.5 text-sm ${tab === t ? 'border-[var(--color-amber)] bg-[var(--color-amber-soft)] text-[var(--color-amber-hi)]' : 'border-[var(--color-line-ctl)] text-[var(--color-txt-2)]'}`}>
                {t ? TYPE_LABEL[t] : '全部'} {n}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        {!q.trim() && (
          <div className="py-10">
            <p className="text-[var(--color-txt-2)]">输入游戏名、报错文本、工具名试试——也可以先去：</p>
            <p className="mt-3 flex gap-4"><a href={withBase('/games/')} className="text-[var(--color-amber-hi)]">浏览游戏库</a><a href={withBase('/free/')} className="text-[var(--color-amber-hi)]">看免费活动</a><a href={withBase('/guides/')} className="text-[var(--color-amber-hi)]">看教程</a></p>
          </div>
        )}
        {q.trim() && failed && (
          <div className="py-10">
            <p>搜索索引加载失败。</p>
            <button className="btn-line mt-4" onClick={() => location.reload()}>重试</button>
            <p className="meta mt-3">或直接 <a href={withBase('/games/')} className="text-[var(--color-amber-hi)]">走索引页</a></p>
          </div>
        )}
        {q.trim() && index && hits.length === 0 && (
          <div className="py-10">
            <p>没有找到「{q}」相关的内容。</p>
            <p className="meta mt-2">换个关键词，或 <a href={withBase('/about/#feedback')} className="text-[var(--color-amber-hi)]">提交收录请求</a>。</p>
          </div>
        )}
        {shown.map((g) => g.list.length > 0 && (
          <section key={g.t} className="mb-6">
            <h2 className="sect">{TYPE_LABEL[g.t]}</h2>
            {g.list.map((i: any) => (
              <a key={i.url} href={withBase(i.url)} className="irow block !py-3">
                <span className="tag mr-2 shrink-0">{i.typeLabel}</span>
                <span className="min-w-0">
                  <span className="font-medium">{hl(i.title)}</span>
                  {i.sub && <span className="meta ml-2">{hl(i.sub)}</span>}
                  {i.summary && <span className="meta block truncate">{hl(i.summary.slice(0, 80))}</span>}
                </span>
              </a>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
