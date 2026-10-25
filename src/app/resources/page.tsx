import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { LogoBand } from '@/components/layout/masthead-bands';
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
      description={<><MastNum>{sites.length}</MastNum> 个官方或公认可信的站点，分 <MastNum>{categories}</MastNum> 类。点进去先看它提供什么、有什么限制，再决定去不去。</>}
      band={<LogoBand sites={sites} />}
    />
    <ResourcesCatalog sites={sites} />
  </>;
}
