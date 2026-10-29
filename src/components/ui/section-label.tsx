import { cn } from '@/lib/utils';

// 编号母题：Nº 02 —— 标题 ……………… 右侧计数
export function SectionLabel({
  no, children, aside, className, tone = 'dark',
}: { no: string; children: React.ReactNode; aside?: React.ReactNode; className?: string; tone?: 'dark' | 'paper' }) {
  return (
    <div className={cn('meta flex items-center gap-3', tone === 'paper' ? 'text-ink-3' : 'text-fg-3', className)}>
      <span className={tone === 'paper' ? 'text-ink' : 'text-foreground'}>Nº {no}</span>
      <span aria-hidden className="h-px w-6 bg-current opacity-60" />
      <span>{children}</span>
      {aside != null && (
        <>
          <span aria-hidden className="h-px flex-1 bg-current opacity-30" />
          <span>{aside}</span>
        </>
      )}
    </div>
  );
}

/**
 * 分节标题——全站唯一的一种：宋体标题 +（条数）+ 可选一句说明。
 * 列表分组（免费 / 资源站 / 搜索结果）默认带底部发丝线；详情页的章节自带上边线，传 divider={false}。
 * 改样式只改这里，所有页面同步。
 */
export function SectionHeading({
  title, count, description, id, headingId, divider = true, className, children,
}: {
  title: React.ReactNode; count?: number | string; description?: React.ReactNode; id?: string; headingId?: string;
  divider?: boolean; className?: string; children?: React.ReactNode;
}) {
  return (
    <div id={id} className={cn('mb-6', divider && 'border-b border-border pb-4', className)}>
      <h2 id={headingId} className="flex items-baseline gap-3 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
        {title}
        {count != null && <span className="tabular text-sm font-normal tabular-nums text-fg-3">({count})</span>}
      </h2>
      {description && <p className="mt-1.5 max-w-[56em] text-base leading-relaxed text-fg-2 text-pretty">{description}</p>}
      {children}
    </div>
  );
}
