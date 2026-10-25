import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ChannelItem, EntryItem, FaqItem, GuideItem, PathItem, ToolItem } from '@/lib/game-detail';
import { zh } from '@/lib/labels.mjs';
import { AcquireButton } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { ExtLink } from '@/components/ui/ext-link';
import { PlatformMark } from '@/components/ui/platform-mark';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/** 健康状态只在「不正常」时才出现，正常链接不加噪音 */
function Health({ value }: { value?: string }) {
  return value && value !== 'ok' ? <StatusBadge value={value} /> : null;
}

/** 获取渠道列表：每行 平台标志 + 名称（text-lg）+ 一行说明（text-sm text-fg-2）+ 右侧主按钮"前往商店" */
export function ChannelList({ items }: { items: ChannelItem[] }) {
  return (
    <ul>
      {items.map((c) => (
        <li
          key={c.url}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 border-b border-border py-5 last:border-b-0"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <PlatformMark platform={c.platform} />
              <span className="text-lg font-bold text-foreground">{zh('platform', c.platform)}</span>
              <Tag>{c.typeLabel}</Tag>
              <Health value={c.health} />
            </div>
            <p className="mt-1.5 text-sm text-fg-2">
              {c.note}
              <span className="font-mono text-2xs text-fg-3"> · 核验于 {c.checkedAt}</span>
            </p>
          </div>
          <AcquireButton
            href={c.url}
            health={c.health}
            label={c.type === 'free' ? '免费获取' : '前往商店'}
            size="md"
            className="h-11 px-5 text-base"
          />
        </li>
      ))}
    </ul>
  );
}

/** 存档与配置路径：等宽字体 text-base，复制按钮 44px 点击区 */
export function PathList({ items }: { items: PathItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.path} className="rounded-xs border border-border bg-shell p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-fg-2">
              <span className="text-foreground">{p.kind}</span>
              <span className="text-fg-3"> · {p.os}</span>
            </p>
            <CopyButton text={p.path} label="复制路径" className="min-h-11 px-4 text-sm" />
          </div>
          <code className="mt-3 block select-all break-all font-mono text-base leading-relaxed text-foreground">
            {p.path}
          </code>
          {p.note && <p className="mt-2 text-sm text-fg-2">{p.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/** MOD 与汉化专区：去除顶部重合粗线，项末无底线 */
export function EntryList({ items }: { items: EntryItem[] }) {
  return (
    <ul>
      {items.map((e) => (
        <li key={e.id} className="border-b border-border py-6 last:border-b-0">
          <div className="flex flex-wrap items-center gap-3">
            <ExtLink
              href={e.url}
              health={e.health}
              className="font-serif text-xl font-bold leading-tight transition-colors hover:text-primary md:text-2xl"
            >
              {e.name}
            </ExtLink>
            <Tag>{e.typeLabel}</Tag>
            <Health value={e.health} />
          </div>
          {e.note && <p className="mt-2 text-base leading-relaxed text-fg-2 text-pretty">{e.note}</p>}
          <p className="mt-3 text-sm text-fg-2">
            {e.site && (
              <>
                来自{' '}
                <Link
                  href={`/resources/${e.site.slug}/`}
                  className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:text-primary"
                >
                  {e.site.name}
                </Link>
                {' · '}
              </>
            )}
            <span className="font-mono text-2xs text-fg-3">核验于 {e.checkedAt}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}

/** 工具推荐列表 */
export function ToolList({ items }: { items: ToolItem[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-xs border border-border bg-border sm:grid-cols-2">
      {items.map((t) => (
        <li key={t.id} className="bg-background">
          <Link href={`/tools/${t.slug}/`} className="group flex h-full flex-col p-6 transition-colors hover:bg-card">
            <span className="text-sm font-medium text-fg-2">{t.typeLabel}</span>
            <span className="mt-2 flex items-center justify-between gap-3 font-serif text-xl font-bold leading-tight transition-colors group-hover:text-primary md:text-2xl">
              {t.name}
              <ArrowRight aria-hidden className="size-5 shrink-0 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </span>
            <span className="mt-3 text-base leading-relaxed text-fg-2">{t.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 教程列表：步骤编号 + 标题 + 补充信息 */
export function GuideList({ items }: { items: GuideItem[] }) {
  return (
    <ol>
      {items.map((x, i) => (
        <li key={x.id}>
          <Link
            href={`/guides/${x.slug}/`}
            className="group grid grid-cols-[40px_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border py-5 transition-colors hover:bg-card/40 last:border-b-0"
          >
            <span className="font-mono text-sm tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="block font-serif text-xl font-bold leading-snug transition-colors group-hover:text-primary">{x.title}</span>
              <span className="mt-1 block text-sm text-fg-2">{x.kindLabel} · {x.steps} 步</span>
            </span>
            <ArrowRight aria-hidden className="size-5 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** 常见问题列表：手风琴无冗余底线 */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="multiple" defaultValue={['0']}>
      {items.map((f, i) => (
        <AccordionItem key={f.question} value={String(i)} className="last:border-b-0">
          <AccordionTrigger index={i + 1} className="text-lg font-medium text-foreground">{f.question}</AccordionTrigger>
          <AccordionContent>
            {f.answer && <p className="text-base leading-relaxed text-fg-2">{f.answer}</p>}
            {f.guide && (
              <Link
                href={`/guides/${f.guide.slug}/`}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-primary underline-offset-4 hover:text-primary"
              >
                查看教程：{f.guide.title} ↗
              </Link>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
