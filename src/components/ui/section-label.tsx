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

/** 分节标题（内页）：宋体 h2 + 编号 + 计数 + 发丝线 */
export function SectionHeading({
  no, title, count, id, className, children,
}: { no?: string; title: string; count?: number | string; id?: string; className?: string; children?: React.ReactNode }) {
  return (
    <div id={id} className={cn('mb-6 flex items-end gap-4 border-b border-border pb-3', className)}>
      {no && <span className="meta pb-[0.4em] text-fg-3">{no}</span>}
      <h2 className="font-serif text-2xl font-bold leading-none tracking-[-0.02em] md:text-3xl">{title}</h2>
      {count != null && <span className="meta pb-[0.4em] text-fg-3">{typeof count === 'number' ? String(count).padStart(2, '0') : count}</span>}
      <span className="flex-1" />
      {children}
    </div>
  );
}
