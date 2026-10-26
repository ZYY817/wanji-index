'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { loadSearchIndex, getRecent, pushRecent, type RecentItem } from '@/lib/search-client';
import { matchItems, groupByType, TYPE_ZH, type SearchItem } from '@/lib/search-match';
import { GameArt } from '@/components/game/game-art';
import { SiteLogo, ToolLogo } from '@/components/ui/site-logo';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-label';
import { useCatalogQuery } from './use-catalog-query';

const SUGGESTIONS = ['星露谷', 'MOD', 'DirectX', '存档', '汉化'];

function ResultRow({ item }: { item: RecentItem }) {
  return (
    <Link href={item.url} onClick={() => pushRecent(item)} className="group flex min-h-20 items-center gap-5 border-b border-border py-4 transition-colors hover:bg-card">
      {item.type === 'game'
        ? <GameArt src={item.art} name={item.title} seed={item.title} variant="wide" className="aspect-[460/215] w-24 shrink-0 rounded-xs sm:w-28" />
        : item.type === 'tool' ? <ToolLogo id={item.seed ?? item.title} name={item.title} size={48} />
        : <SiteLogo id={item.seed ?? item.title} name={item.title} size={48} />}
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold transition-colors group-hover:text-primary">{item.title}</span>
        {item.sub && <span className="mt-1 block truncate text-sm text-fg-3">{item.sub}</span>}
      </span>
      <span className="hidden text-sm text-fg-3 sm:block">{TYPE_ZH[item.type]}</span>
      <ArrowRight className="size-4 shrink-0 text-fg-3 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
    </Link>
  );
}

function Message({ title, children, role = 'status' }: { title: string; children?: React.ReactNode; role?: 'status' | 'alert' }) {
  return (
    <section role={role} className="py-16">
      <h2 className="font-serif text-3xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

/**
 * 搜索页：大号输入框（URL ?q= 同步）→ 结果按类型分组。
 * 空查询时给出示例关键词与最近访问；索引加载失败可重试，关键词保留。
 */
export function SearchCatalog() {
  const { query, update } = useCatalogQuery();
  const q = query.q ?? '';
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => { setRecent(getRecent()); }, []);
  useEffect(() => {
    let current = true;
    setError(false);
    setItems(null);
    loadSearchIndex(attempt > 0)
      .then((v) => { if (current) setItems(v); })
      .catch(() => { if (current) setError(true); });
    return () => { current = false; };
  }, [attempt]);

  const setQuery = (value: string) => update({ q: value });
  const results = items ? matchItems(items, q) : [];

  let body: React.ReactNode;
  if (error) {
    body = (
      <Message title="搜索索引暂时没能加载" role="alert">
        <p className="mt-3 text-base text-fg-2">请检查网络后重试，你输入的关键词会保留。</p>
        <Button className="mt-6" onClick={() => setAttempt((n) => n + 1)}>重新加载</Button>
      </Message>
    );
  } else if (!q.trim()) {
    body = (
      <div className="grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 className="font-serif text-3xl font-bold leading-snug">想玩什么，<br />或遇到了什么问题？</h2>
          <p className="mt-4 text-base text-fg-2">可以试试这些关键词：</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SUGGESTIONS.map((term) => <Button key={term} onClick={() => setQuery(term)}>{term}</Button>)}
          </div>
        </div>
        <section className="lg:col-span-7 lg:col-start-6">
          <SectionHeading title="最近访问" count={recent.length || undefined} />
          {recent.length
            ? recent.map((item) => <ResultRow key={item.url} item={item} />)
            : <p className="text-base text-fg-3">从搜索结果打开的页面会留在这里，方便下次回来。</p>}
        </section>
      </div>
    );
  } else if (!items) {
    body = <p className="py-16 text-base text-fg-2" role="status">正在加载搜索索引…</p>;
  } else if (!results.length) {
    body = (
      <Message title={`没有找到「${q}」`}>
        <p className="mt-3 text-base text-fg-2">试试游戏的中文名、英文名，或缩短报错里的关键词。</p>
        <Button className="mt-6" onClick={() => setQuery('')}>清空重新查找</Button>
      </Message>
    );
  } else {
    body = (
      <div className="py-12">
        <p className="mb-10 text-base text-fg-2" role="status">找到 <span className="text-foreground">{results.length}</span> 条结果</p>
        <div className="space-y-14">
          {groupByType(results).map((group) => (
            <section key={group.type}>
              <SectionHeading title={group.label} count={group.items.length} />
              {group.items.map((item) => <ResultRow key={item.url} item={item} />)}
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container-x pb-24">
      <div role="search" className="flex items-center gap-4 border-b border-foreground/30 py-8 md:py-10">
        <Search aria-hidden className="size-6 shrink-0 text-fg-3" />
        <label htmlFor="full-search" className="sr-only">搜索游戏、资源站、工具或教程</label>
        <input
          id="full-search"
          type="search"
          value={q}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入游戏名、工具名或报错…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 font-serif text-[clamp(20px,3.6vw,48px)] font-bold tracking-[-0.02em] placeholder:text-fg-3"
        />
        {q && <Button size="icon" variant="ghost" onClick={() => setQuery('')} aria-label="清空搜索"><X aria-hidden /></Button>}
      </div>
      {body}
    </div>
  );
}
