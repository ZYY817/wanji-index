import type { Metadata } from 'next';
import Link from 'next/link';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { PageMastheadFrame } from '@/components/layout/page-masthead';
import { ResourcesCatalog } from '@/components/catalog/resources-catalog';
import { Monogram } from '@/components/ui/monogram';
import { pad } from '@/lib/utils';
export const metadata: Metadata = { title: '资源站', description: 'MOD、汉化、攻略、补丁等可信游戏资源站索引', alternates: { canonical: '/resources/' } };

export default function ResourcesPage() {
  const data = loadData(); const rel = buildRelations(data);
  const sites = [...data.sites].sort((a, b) => a.name.localeCompare(b.name)).map((s) => siteVM(s, rel));
  const ledger = sites.slice(0, 7);
  const categories = new Set(sites.map((s) => s.category)).size;
  return <>
    <PageMastheadFrame no="03" en="DIRECTORY OF SOURCES" crumbs={[['来源']]}>
      <div className="grid gap-8 pb-9 pt-8 md:grid-cols-12 md:gap-10 md:pb-12 md:pt-11">
        <div className="md:col-span-5">
          <h1 className="display-l leading-[0.92]">
            <span className="block">来源</span>
            <span className="mt-3 flex items-center gap-4 text-[0.46em] leading-none tracking-[-0.02em]">
              <span aria-hidden className="h-px w-10 bg-primary" />
              目录
            </span>
          </h1>
          <p className="mt-6 max-w-[34ch] text-base leading-[1.8] text-fg-2">通向原始来源的索引。认识一个站点，再决定是否前往：它提供什么、有什么限制、与哪些游戏有关。</p>
          <dl className="mt-6 grid max-w-xs grid-cols-2 border-t border-border pt-3">
            <div>
              <dt className="meta text-2xs text-fg-3">站点在册</dt>
              <dd className="mt-1 font-mono text-2xl leading-none tabular text-primary">{pad(sites.length, 3)}</dd>
            </div>
            <div>
              <dt className="meta text-2xs text-fg-3">分类索引</dt>
              <dd className="mt-1 font-mono text-2xl leading-none tabular text-foreground">{pad(categories, 2)}</dd>
            </div>
          </dl>
        </div>

        <div className="min-w-0 md:col-span-7">
          <div className="flex items-baseline justify-between gap-3 border-b border-foreground/30 pb-2">
            <span className="meta text-2xs text-foreground">SOURCE LEDGER / 原始来源</span>
            <span className="meta text-2xs text-fg-3">FRONT MATTER · 前 {pad(ledger.length, 2)} 条</span>
          </div>
          <ol>
            {ledger.map((s, i) => (
              <li key={s.id}>
                <Link href={`/resources/${s.slug}/`} className="group flex min-h-10 items-center gap-2.5 border-b border-border py-2">
                  <span className="w-4 shrink-0 font-mono text-2xs tabular text-fg-3">{pad(i + 1, 2)}</span>
                  <Monogram name={s.name} seed={s.id} size={22} />
                  <span className="w-[38%] min-w-0 truncate font-serif text-base font-semibold leading-tight transition-colors group-hover:text-primary">{s.name}</span>
                  <span aria-hidden className="leader" />
                  <span className="w-[33%] min-w-0 truncate font-mono text-2xs tracking-[0.03em] text-fg-3">{s.domain}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="meta mt-2 flex justify-between gap-3 text-2xs text-fg-3">
            <span>首字图章 · 域名点线引导</span>
            <span>前 {pad(ledger.length, 2)} / 共 {pad(sites.length, 2)} · 完整目录在下</span>
          </p>
        </div>
      </div>
    </PageMastheadFrame>
    <ResourcesCatalog sites={sites} />
  </>;
}
