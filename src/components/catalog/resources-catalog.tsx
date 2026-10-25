'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SiteVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { SiteLogo } from '@/components/ui/site-logo';
import { StatusBadge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-label';
import { CategoryRail, EmptyResult } from './category-rail';
import { useCatalogQuery } from './use-catalog-query';

function SiteRow({ s }: { s: SiteVM }) {
  return (
    <Link href={`/resources/${s.slug}/`} className="group grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-5 border-b border-border py-6 transition-colors hover:bg-card">
      <SiteLogo id={s.id} name={s.name} size={48} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="font-serif text-2xl font-bold leading-tight transition-colors group-hover:text-primary">{s.name}</h3>
          <span className="font-mono text-sm text-fg-3">{s.domain}</span>
          {s.linkHealth !== 'ok' && <StatusBadge value={s.linkHealth} />}
        </div>
        <p className="mt-2 max-w-[60ch] text-base leading-[1.7] text-fg-2">{s.summary}</p>
        <p className="mt-3 text-sm text-fg-3">
          {s.purposes.join(' · ')}
          {s.entryCount > 0 && <span> · 收录 {s.entryCount} 个游戏入口</span>}
        </p>
      </div>
      <ArrowRight aria-hidden className="mt-2 size-5 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
    </Link>
  );
}

/** 资源站目录：左侧搜索 + 分类，右侧按分类分组的站点列表 */
export function ResourcesCatalog({ sites }: { sites: SiteVM[] }) {
  const { query: q, update } = useCatalogQuery();
  const cat = q.cat ?? '';
  const text = (q.q ?? '').trim().toLowerCase();
  const categories = [...new Set(sites.map((s) => s.category))];
  const filtered = sites.filter((s) =>
    (!cat || s.category === cat) &&
    (!text || [s.name, s.domain, ...s.aliases, ...s.purposes].join(' ').toLowerCase().includes(text)));

  return (
    <div className="container-x grid gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-3">
        <CategoryRail
          query={q.q ?? ''}
          onQuery={(v) => update({ q: v })}
          placeholder="站名、域名或用途"
          items={categories.map((c) => ({ value: c, label: zh('siteCategory', c), count: sites.filter((s) => s.category === c).length }))}
          active={cat}
          onSelect={(v) => update({ cat: v })}
          allLabel="全部站点"
        />
      </div>

      <div className="min-w-0 space-y-16 lg:col-span-9">
        {categories.map((c) => {
          const group = filtered.filter((s) => s.category === c);
          if (!group.length) return null;
          return (
            <section key={c} aria-label={zh('siteCategory', c)}>
              <SectionHeading title={zh('siteCategory', c)} count={group.length} className="mb-0" />
              {group.map((s) => <SiteRow key={s.id} s={s} />)}
            </section>
          );
        })}
        {!filtered.length && <EmptyResult onClear={() => update({ q: '', cat: '' })} />}
      </div>
    </div>
  );
}
