import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ResourcesCatalog } from '@/components/catalog/resources-catalog';
export const metadata: Metadata = { title: '资源站', description: 'MOD、汉化、攻略、补丁等可信游戏资源站索引', alternates: { canonical: '/resources/' } };

export default function ResourcesPage() {
  const data = loadData(); const rel = buildRelations(data);
  const sites = [...data.sites].sort((a, b) => a.name.localeCompare(b.name)).map((s) => siteVM(s, rel));
  const categories = new Set(sites.map((s) => s.category)).size;
  return <>
    <IndexMasthead
      no="03"
      title="资源站"
      description="通向原始来源的目录。先认识一个站点——它提供什么、有什么限制、与哪些游戏有关——再决定是否前往。"
      stats={[{ value: sites.length, label: '个资源站' }, { value: categories, label: '个分类' }]}
    />
    <ResourcesCatalog sites={sites} />
  </>;
}
