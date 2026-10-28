import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ResourcesCatalog } from '@/components/catalog/resources-catalog';

export const metadata: Metadata = { title: '资源站', description: 'MOD、汉化、攻略、补丁等游戏资源站合集', alternates: { canonical: '/resources/' } };

export default function ResourcesPage() {
  const data = loadData();
  const rel = buildRelations(data);
  const sites = [...data.sites].sort((a, b) => a.name.localeCompare(b.name)).map((s) => siteVM(s, rel));
  const categories = new Set(sites.map((s) => s.category)).size;

  return (
    <>
      <IndexMasthead
        title={<T zh="资源站" en="Sites" />}
        count={sites.length}
        description={<T zh={`收录 ${sites.length} 个玩家常用的资源站，分 ${categories} 类。标注语言、网络与注册门槛，去之前先心里有数。`} en={`${sites.length} sites players use, in ${categories} categories — with language, network and sign-up notes so you know what to expect.`} />}
      />
      <ResourcesCatalog sites={sites} />
    </>
  );
}
