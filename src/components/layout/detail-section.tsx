import { Reveal } from '@/components/fx/reveal';

export type DetailSectionMeta = { id: string; title: string; lead?: string; count?: number };

/**
 * 详情页章节（游戏 / 资源站 / 工具 / 教程共用）：统一的编辑式两栏。左栏吸顶——编号、章节名、条数、一句说明；右栏是内容。
 * 每章结构一致，用户读过一章就知道其余章节怎么读。
 */
export function DetailSection({ meta, index, children }: { meta: DetailSectionMeta; index: number; children: React.ReactNode }) {
  return (
    <section id={meta.id} aria-labelledby={`${meta.id}-title`} className="scroll-mt-32 border-t border-border py-14 first:border-t-0 md:py-20">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+88px)]">
            <p className="font-mono text-xs tabular-nums text-fg-3">{String(index + 1).padStart(2, '0')}</p>
            <h2 id={`${meta.id}-title`} className="mt-3 flex items-baseline gap-3 font-serif text-3xl font-bold leading-tight tracking-[-0.03em] md:text-4xl">
              {meta.title}
              {meta.count != null && <span className="font-mono text-base font-normal text-fg-3">{meta.count}</span>}
            </h2>
            {meta.lead && <p className="mt-4 max-w-[30ch] text-base leading-[1.75] text-fg-2">{meta.lead}</p>}
          </div>
        </Reveal>
        <Reveal className="min-w-0 lg:col-span-8" delay={0.08}>
          {children}
        </Reveal>
      </div>
    </section>
  );
}

