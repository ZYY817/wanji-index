import { L } from '@/lib/labels-i18n';
import { StatusBadge } from '@/components/ui/badge';
import { ListRow } from '@/components/ui/list-row';
import { ToolLogo } from '@/components/ui/site-logo';

const OS: Record<string, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };

/** 工具行（工具列表 / 搜索结果共用）：官方图标 → 名称 + 用途 → 一句说明 → 适用系统；链接异常时才出现状态徽标 */
export function ToolRow({ t }: { t: any }) {
  return (
    <ListRow
      href={`/tools/${t.slug}/`}
      media={<ToolLogo id={t.id} name={t.name} size={44} />}
      title={t.name}
      aside={L('toolType', t.type)}
      badge={t.linkHealth !== 'ok' ? <StatusBadge value={t.linkHealth} /> : undefined}
      description={t.summary}
      meta={(t.os ?? ['windows']).map((o: string) => OS[o] ?? o).join(' / ')}
    />
  );
}
