import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { zh } from '@/lib/labels.mjs';
import { StatusBadge } from '@/components/ui/badge';

/** 工具卡（工具列表 / 搜索结果共用）：用途 → 名称 → 一句说明 → 适用系统；链接异常时才出现状态徽标 */
const OS: Record<string, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

export function ToolCard({ t }: { t: any }) {
  const healthy = t.linkHealth === 'ok';
  return (
    <Link href={`/tools/${t.slug}/`} className="group relative flex h-full flex-col p-5 md:p-6 transition-colors">
      <div className="flex items-center justify-between gap-3 text-sm text-fg-2">
        <span>{zh('toolType', t.type)}</span>
        {!healthy && <StatusBadge value={t.linkHealth} />}
      </div>

      <span className="mt-3.5 flex items-center justify-between gap-3 font-serif text-xl sm:text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
        {t.name}
        <ArrowRight aria-hidden className="size-4 shrink-0 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </span>

      <p className="mt-2.5 flex-1 text-base leading-relaxed text-fg-2 text-pretty">
        {t.summary}
      </p>

      <p className="mt-5 border-t border-border pt-3 text-sm text-fg-2">{(t.os ?? ['windows']).map((o: string) => OS[o] ?? o).join(' / ')}</p>
    </Link>
  );
}
