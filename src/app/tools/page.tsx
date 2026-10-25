import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { loadData } from '@/lib/data.mjs';
import { zh } from '@/lib/labels.mjs';
import { IndexMasthead, MastNum } from '@/components/layout/page-masthead';
import { NameBand } from '@/components/layout/masthead-bands';
import { ToolsGuidesIndex } from '@/components/catalog/tools-guides-index';
import { StatusBadge } from '@/components/ui/badge';
export const metadata: Metadata = { title: '工具', description: 'MOD 管理、存档、性能监控等 PC 游戏工具索引', alternates: { canonical: '/tools/' } };

/** 工具卡：用途 → 名称 → 一句话 → 适用系统；链接健康异常时才出现徽标 */
function ToolCard({ t }: { t: any }) {
  return (
    <Link href={`/tools/${t.slug}/`} className="group flex h-full flex-col p-6 transition-colors hover:bg-card md:p-7">
      <span className="flex items-center justify-between gap-3 text-sm text-fg-3">
        {zh('toolType', t.type)}
        {t.linkHealth !== 'ok' && <StatusBadge value={t.linkHealth} />}
      </span>
      <span className="mt-3 flex items-center justify-between gap-3 font-serif text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
        {t.name}
        <ArrowRight aria-hidden className="size-5 shrink-0 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </span>
      <span className="mt-3 flex-1 text-base leading-[1.7] text-fg-2">{t.summary}</span>
      <span className="mt-6 text-sm text-fg-3">{(t.os ?? []).map((o: string) => zh('os', o)).join(' / ') || 'Windows'}</span>
    </Link>
  );
}

export default function ToolsPage() {
  const tools = [...loadData().tools].sort((a: any, b: any) => a.name.localeCompare(b.name));
  const types = [...new Set<string>(tools.map((t: any) => t.type))];
  return (
    <>
      <IndexMasthead
        no="04"
        title="工具"
        description={<><MastNum>{tools.length}</MastNum> 个工具：管理 MOD、备份存档、看帧数。每一个都只链接它的官网。</>}
        band={<NameBand items={tools.map((t: any) => ({ id: t.id, name: t.name, note: zh('toolType', t.type), href: `/tools/${t.slug}/` }))} />}
      />
      <div className="container-x pb-20">
        <ToolsGuidesIndex
          param="type"
          placeholder="工具名或用途"
          grid
          categories={types.map((t) => ({ value: t, label: zh('toolType', t) }))}
          rows={tools.map((t: any) => ({
            id: t.id,
            query: [t.name, t.summary, ...(t.aliases ?? [])].join(' '),
            category: t.type,
            content: <ToolCard t={t} />,
          }))}
        />
      </div>
    </>
  );
}
