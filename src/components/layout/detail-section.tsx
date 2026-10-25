import { Reveal } from '@/components/fx/reveal';
import { cn } from '@/lib/utils';

export type DetailSectionMeta = { id: string; title: string; lead?: string; count?: number };

/**
 * 详情页章节（游戏 / 资源站 / 工具 / 教程共用）：
 * V6 单栏结构——标题在内容正上方（宋体 text-2xl–text-3xl，下方 24px 接内容）。
 * 提供可选 aside 插槽供长教程步骤目录等使用。
 */
export function DetailSection({
  meta, index: _index, aside, className, children,
}: {
  meta: DetailSectionMeta; index?: number; aside?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <section
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
      className={cn('scroll-mt-[calc(var(--sticky-top)+32px)] border-t border-border py-12 first:border-t-0 md:py-16', className)}
    >
      <Reveal>
        <div className="mb-6">
          <h2 id={`${meta.id}-title`} className="flex items-baseline gap-3 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {meta.title}
            {meta.count != null && <span className="font-mono text-base font-normal text-fg-3">({meta.count})</span>}
          </h2>
          {meta.lead && <p className="mt-2 max-w-[38em] text-base leading-relaxed text-fg-2 text-pretty">{meta.lead}</p>}
        </div>
      </Reveal>

      {aside ? (
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <Reveal className="min-w-0 lg:col-span-8" delay={0.06}>
            {children}
          </Reveal>
          <aside className="lg:col-span-4">
            {aside}
          </aside>
        </div>
      ) : (
        <Reveal className="min-w-0" delay={0.06}>
          {children}
        </Reveal>
      )}
    </section>
  );
}
