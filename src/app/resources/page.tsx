import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ResourcesCatalog } from '@/components/catalog/resources-catalog';

export const metadata: Metadata = { title: '资源站', description: 'MOD、汉化、攻略、补丁等可信游戏资源站索引', alternates: { canonical: '/resources/' } };

export default function ResourcesPage() {
  const data = loadData();
  const rel = buildRelations(data);
  const sites = [...data.sites].sort((a, b) => a.name.localeCompare(b.name)).map((s) => siteVM(s, rel));
  const categories = new Set(sites.map((s) => s.category)).size;

  return (
    <>
      <IndexMasthead
        title="资源站"
        count={sites.length}
        description={`收录 ${sites.length} 个官方或公认可信的站点，分 ${categories} 类。直连官网与主流开源社区，如实标注语言、网络与注册门槛。`}
      />
      <ResourcesCatalog sites={sites} />
    </>
  );
}
