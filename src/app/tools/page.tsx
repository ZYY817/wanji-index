import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import type { Metadata } from 'next';
import { loadData } from '@/lib/data.mjs';
import { SafetyNote } from '@/components/layout/safety-note';
import { IndexMasthead } from '@/components/layout/page-masthead';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { ToolRow } from '@/components/catalog/tool-card';

export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

export default function ToolsPage() {
  const tools = [...loadData().tools].sort((a: any, b: any) => a.name.localeCompare(b.name));
  const types = [...new Set<string>(tools.map((t: any) => t.type))];
  return (
    <>
      <IndexMasthead
        title={<T zh="工具" en="Tools" />}
        count={tools.length}
        description={<T zh={`玩 PC 游戏少不了的实用工具：从 MOD 管理、自动备份存档到帧率与显卡监控，附带官方正规下载和避坑要点。`} en={`Essential PC gaming utilities: mod managers, save back-ups, and hardware overlays, paired with official downloads and setup tips.`} />}
        aside={<SafetyNote variant="compact" />}
      />
      <div className="container-x pb-20">
        <ToolsGuidesIndex
          param="type"
          placeholder="工具名或用途"
          placeholderEn="Tool name or use"
          categories={types.map((t) => ({ value: t, label: L('toolType', t) }))}
          rows={tools.map((t: any) => ({
            id: t.id,
            query: [t.name, t.summary, ...(t.aliases ?? [])].join(' '),
            category: t.type,
            content: <ToolRow t={t} />,
          }))}
        />
      </div>
    </>
  );
}
