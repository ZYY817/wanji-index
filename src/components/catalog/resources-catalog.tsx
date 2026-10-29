'use client';
import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import type { SiteVM } from '@/lib/present';
import { zh } from '@/lib/labels.mjs';
import { SiteLogo } from '@/components/ui/site-logo';
import { StatusBadge } from '@/components/ui/badge';
import { SectionHeading } from '@/components/ui/section-label';
import { ListRow } from '@/components/ui/list-row';
import { CategoryRail, EmptyResult } from './category-rail';
import { useCatalogQuery } from './use-catalog-query';

function SiteRow({ s }: { s: SiteVM }) {
  return (
    <ListRow
      href={`/resources/${s.slug}/`}
      className="border-b border-border"
      media={<SiteLogo id={s.id} name={s.name} size={44} />}
      title={s.name}
      aside={<span className="tabular">{s.domain}</span>}
      badge={s.linkHealth !== 'ok' ? <StatusBadge value={s.linkHealth} /> : undefined}
      description={s.summary}
      meta={<>{s.purposes.join(' · ')}{s.entryCount > 0 && <span> · <T zh={`收录 ${s.entryCount} 个游戏入口`} en={`${s.entryCount} game pages`} /></span>}</>}
    />
  );
}

/** 资源站目录：左侧搜索 + 分类，右侧按分类分组的站点列表 */
const CAT_ORDER = ['store', 'mod', 'indie', 'guide-wiki', 'other'];
const rankCat = (c: string) => (CAT_ORDER.includes(c) ? CAT_ORDER.indexOf(c) : CAT_ORDER.length);

export function ResourcesCatalog({ sites }: { sites: SiteVM[] }) {
  const { query: q, update } = useCatalogQuery();
  const cat = q.cat ?? '';
  const text = (q.q ?? '').trim().toLowerCase();
  // 分类顺序与首页一致：商店 → MOD 社区 → 独立游戏 → 攻略百科 → 比价与数据（其余按出现顺序排在后面）
  const categories = [...new Set(sites.map((s) => s.category))].sort((a, b) => rankCat(a) - rankCat(b));
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
          placeholderEn="Name, domain or use"
          items={categories.map((c) => ({ value: c, label: L('siteCategory', c), count: sites.filter((s) => s.category === c).length }))}
          active={cat}
          onSelect={(v) => update({ cat: v })}
          allLabel={<T zh="全部站点" en="All sites" />}
        />
      </div>

      <div className="min-w-0 space-y-16 lg:col-span-9">
        {categories.map((c) => {
          const group = filtered.filter((s) => s.category === c);
          if (!group.length) return null;
          return (
            <section key={c} aria-label={zh('siteCategory', c)}>
              <SectionHeading title={L('siteCategory', c)} count={group.length} className="mb-0" />
              {group.map((s) => <SiteRow key={s.id} s={s} />)}
            </section>
          );
        })}
        {!filtered.length && <EmptyResult onClear={() => update({ q: '', cat: '' })} />}
      </div>
    </div>
  );
}
