'use client';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import type { SiteVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { Monogram } from '@/components/ui/monogram';
import { StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCatalogQuery } from './use-catalog-query';
export function ResourcesCatalog({ sites }: { sites: SiteVM[] }) {
  const {query:q,update}=useCatalogQuery();
  const categories=[...new Set(sites.map(s=>s.category))];
  const filtered=sites.filter(s=>(!q.cat || q.cat===s.category)&&(!q.q || [s.name,s.domain,...s.aliases,...s.purposes].join(' ').toLowerCase().includes(q.q.trim().toLowerCase())));
  return <div className="container-x grid gap-10 py-10 md:grid-cols-[190px_minmax(0,1fr)] md:gap-14 md:py-16">
    <aside className="min-w-0"><div className="sticky top-[calc(var(--header-h)+24px)]"><p className="meta mb-5 text-fg-3">分类索引</p><nav aria-label="资源站分类" className="flex overflow-auto md:block">{['',...categories].map((cat,i)=><button key={cat} onClick={()=>update({cat})} aria-pressed={(q.cat||'')===cat} className={`flex min-h-12 shrink-0 items-center gap-4 border-b border-border px-3 text-left text-sm md:w-full ${(q.cat||'')===cat?'border-primary text-primary':'text-fg-2 hover:text-foreground'}`}><span className="font-mono text-2xs">{String(i).padStart(2,'0')}</span><span className="flex-1 whitespace-nowrap">{cat?zh('siteCategory',cat):'全部站点'}</span><span className="font-mono text-xs">{cat?sites.filter(s=>s.category===cat).length:sites.length}</span></button>)}</nav></div></aside>
    <div className="min-w-0"><label className="flex min-h-14 items-center gap-4 border-b border-border-strong"><Search className="size-4 text-fg-3" aria-hidden/><span className="sr-only">搜索资源站</span><input value={q.q||''} onChange={e=>update({q:e.target.value})} className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary" placeholder="按站名、域名或用途检索"/><span aria-live="polite" className="meta text-fg-3">{filtered.length} 站</span></label>
      {categories.map((cat,i)=>{const group=filtered.filter(s=>s.category===cat);return group.length>0&&<section key={cat} className="mt-10"><div className="mb-2 flex items-baseline gap-3 border-b border-border py-3"><span className="meta text-primary">{String(i+1).padStart(2,'0')}</span><h2 className="font-serif text-2xl font-bold">{zh('siteCategory',cat)}</h2><span className="meta ml-auto text-fg-3">{group.length} ENTRIES</span></div>{group.map(s=><Link key={s.id} href={`/resources/${s.slug}/`} className="group flex items-start gap-4 border-b border-border py-6 transition-colors hover:bg-surface-2/40 sm:gap-6"><Monogram name={s.name} seed={s.id} size={48}/><div className="min-w-0 flex-1"><div className="flex items-baseline gap-4"><h3 className="font-serif text-xl font-bold group-hover:text-primary">{s.name}</h3><span aria-hidden className="hidden flex-1 border-b border-dotted border-border-strong sm:block"/><span className="hidden font-mono text-xs text-fg-3 lg:block">{s.domain}</span><ArrowUpRight className="size-4 shrink-0 text-fg-3" aria-hidden/></div><p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-2">{s.summary}</p><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-3"><span>{s.purposes.join(' / ')}</span><span className="font-mono">{s.entryCount} 入口 · {s.gameCount} 游戏</span><StatusBadge value={s.linkHealth}/></div></div></Link>)}</section>})}
      {!filtered.length&&<div className="py-20"><h2 className="font-serif text-3xl">目录里暂时没有这一项</h2><Button className="mt-6" onClick={()=>update({q:'',cat:''})}>清除筛选</Button></div>}
    </div>
  </div>;
}

