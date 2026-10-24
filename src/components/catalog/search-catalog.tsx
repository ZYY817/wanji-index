'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCatalogQuery } from './use-catalog-query';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { loadSearchIndex, getRecent, pushRecent, type RecentItem } from '@/lib/search-client';
import { matchItems, groupByType, TYPE_ZH, type SearchItem } from '@/lib/search-match';
import { GameArt } from '@/components/game/game-art';
import { Monogram } from '@/components/ui/monogram';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-label';
function ResultRow({ item }: { item: RecentItem }) {
  return <Link href={item.url} onClick={() => pushRecent(item)} className="group flex min-h-24 items-center gap-4 border-b border-border py-5 hover:bg-surface-2/50 sm:gap-6">
    {item.type === 'game' ? <GameArt src={item.art} name={item.title} seed={item.title} variant="wide" className="h-12 w-20 shrink-0 sm:h-16 sm:w-28" /> : <Monogram name={item.title} seed={item.seed ?? item.title} size={48} />}
    <span className="min-w-0 flex-1"><span className="block font-serif text-xl font-semibold group-hover:text-primary sm:text-2xl">{item.title}</span>{item.sub && <span className="mt-1 block truncate text-xs text-fg-3">{item.sub}</span>}</span><span className="meta hidden text-fg-3 sm:block">{TYPE_ZH[item.type]}</span><ArrowUpRight className="size-5 shrink-0 text-fg-3" aria-hidden />
  </Link>;
}
export function SearchCatalog() {
  const { query, update } = useCatalogQuery(), q = query.q ?? '';
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [error, setError] = useState(false), [attempt, setAttempt] = useState(0);
  useEffect(() => { setRecent(getRecent()); }, []);
  useEffect(() => {
    let current = true;
    setError(false); setItems(null);
    loadSearchIndex(attempt > 0).then((v) => { if (current) setItems(v); }).catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [attempt]);
  const setQuery = (value: string) => update({ q: value });
  const results = items ? matchItems(items, q) : [];
  return <div className="container-x pb-24">
    <div role="search" className="flex items-center gap-4 border-b border-foreground/40 py-7 md:py-10"><Search aria-hidden className="size-6 shrink-0 text-fg-3" /><label htmlFor="full-search" className="sr-only">搜索游戏、资源、工具或教程</label><input id="full-search" type="search" value={q} onChange={(e) => setQuery(e.target.value)} placeholder="你在找什么？" className="min-w-0 flex-1 bg-transparent py-3 font-serif text-[clamp(24px,4vw,56px)] font-semibold tracking-tight placeholder:text-fg-3" autoComplete="off" />{q && <Button size="icon" variant="ghost" onClick={() => setQuery('')} aria-label="清空搜索"><X aria-hidden /></Button>}</div>
    {error ? <section className="py-16" role="alert"><p className="meta text-warn">搜索暂不可用</p><h2 className="mt-4 font-serif text-3xl">索引暂时未能加载。</h2><p className="mt-4 text-fg-2">请检查网络后重试，你输入的关键词会保留。</p><Button className="mt-6" onClick={() => setAttempt((n) => n + 1)}>重新加载索引</Button></section> : !q.trim() ? <div className="grid gap-12 py-12 lg:grid-cols-[1fr_2fr]"><div><p className="meta text-fg-3">从一条线索开始</p><h2 className="mt-5 font-serif text-3xl leading-snug">想玩什么，<br />或遇到了什么？</h2><div className="mt-6 flex flex-wrap gap-2">{['星露谷', 'MOD', 'DirectX'].map((term) => <Button key={term} onClick={() => setQuery(term)}>{term}</Button>)}</div></div><section><SectionHeading title="最近访问" count={recent.length} />{recent.length ? recent.map((item) => <ResultRow key={item.url} item={item} />) : <p className="py-6 text-sm text-fg-3">从搜索结果打开的档案，会留在这里。</p>}</section></div> : !items ? <p className="py-16 text-fg-2" role="status">正在加载搜索索引…</p> : !results.length ? <section className="py-16" role="status"><p className="meta text-fg-3">没有结果</p><h2 className="mt-4 font-serif text-3xl">还没找到这条线索。</h2><p className="mt-4 text-fg-2">试试游戏的中文名、英文名，或缩短报错关键词。</p><Button className="mt-6" onClick={() => setQuery('')}>清空，重新查找</Button></section> : <div className="py-10"><p className="meta mb-12 text-fg-3" role="status">找到 {results.length} 条结果</p><div className="space-y-14">{groupByType(results).map((group, i) => <section key={group.type}><SectionHeading no={`0${i + 1}`} title={group.label} count={group.items.length} />{group.items.map((item) => <ResultRow key={item.url} item={item} />)}</section>)}</div></div>}
  </div>;
}
