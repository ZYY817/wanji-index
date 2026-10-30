import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { loadData, buildRelations } from '@/lib/data.mjs';
import { siteVM } from '@/lib/present';
import { SafetyNote } from '@/components/layout/safety-note';
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
        description={<T zh={`整理了 ${sites.length} 个广大玩家经常打交道的知名资源站。支持的语言、国内网络访问情况以及是否需要注册，全都标得明明白白，出发前先心里有数。`} en={`A curated index of ${sites.length} trusted community sites. We note supported languages, network accessibility, and sign-up requirements so you always know what to expect.`} />}
        aside={<SafetyNote variant="compact" />}
      />
      <ResourcesCatalog sites={sites} />
    </>
  );
}
