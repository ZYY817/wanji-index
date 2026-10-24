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
 * 分节标题（内页列表的分组）：宋体标题 + 条数 + 可选一句说明，底部发丝线。
 * 与详情页 DetailSection 同一种读法：先看「这是什么」，再看「有多少」，最后一句「为什么在这里」。
 */
export function SectionHeading({
  title, count, description, id, className, children,
}: { title: string; count?: number | string; description?: React.ReactNode; id?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div id={id} className={cn('mb-8 flex flex-wrap items-end gap-x-4 gap-y-2 border-b border-border pb-4', className)}>
      <h2 className="font-serif text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">{title}</h2>
      {count != null && <span className="pb-1 font-mono text-base tabular-nums text-fg-3">{count}</span>}
      {description && <p className="basis-full text-base text-fg-2 md:ml-auto md:basis-auto md:pb-1.5 md:text-right">{description}</p>}
      {children}
    </div>
  );
}
