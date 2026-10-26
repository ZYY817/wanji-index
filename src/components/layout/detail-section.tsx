import { Reveal } from '@/components/fx/reveal';
import { cn } from '@/lib/utils';
import { SectionHeading } from '@/components/ui/section-label';

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
        <SectionHeading headingId={`${meta.id}-title`} title={meta.title} count={meta.count} description={meta.lead} divider={false} />
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
