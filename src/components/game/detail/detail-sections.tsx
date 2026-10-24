import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ChannelItem, EntryItem, FaqItem, GuideItem, PathItem, ToolItem } from '@/lib/game-detail';
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

export function ChannelList({ items }: { items: ChannelItem[] }) {
  return (
    <ul className="border-t border-border-strong">
      {items.map((c) => (
        <li key={c.url} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 border-b border-border py-5">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-3 text-xl text-foreground">
              <PlatformMark platform={c.platform} withLabel />
              <Tag>{c.typeLabel}</Tag>
              <Health value={c.health} />
            </p>
            <p className="mt-2 text-sm text-fg-2">{c.note}<span className="text-fg-3"> · 核验于 {c.checkedAt}</span></p>
          </div>
          <AcquireButton href={c.url} health={c.health} label={c.type === 'free' ? '免费获取' : '前往商店'} />
        </li>
      ))}
    </ul>
  );
}

export function PathList({ items }: { items: PathItem[] }) {
  return (
    <ul className="space-y-3">
      {items.map((p) => (
        <li key={p.path} className="border border-border bg-shell p-5 md:p-6">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-fg-2">
              <span className="text-foreground">{p.kind}</span>
              <span className="text-fg-3"> · {p.os}</span>
            </p>
            <CopyButton text={p.path} />
          </div>
          <code className="mt-3 block break-all font-mono text-base leading-[1.6] text-foreground">{p.path}</code>
          {p.note && <p className="mt-3 text-sm text-fg-3">{p.note}</p>}
        </li>
      ))}
    </ul>
  );
}

export function EntryList({ items }: { items: EntryItem[] }) {
  return (
    <ul className="border-t border-border-strong">
      {items.map((e) => (
        <li key={e.id} className="border-b border-border py-6">
          <div className="flex flex-wrap items-center gap-3">
            <ExtLink href={e.url} health={e.health} className="font-serif text-2xl font-bold leading-tight transition-colors hover:text-primary">
              {e.name}
            </ExtLink>
            <Tag>{e.typeLabel}</Tag>
            <Health value={e.health} />
          </div>
          {e.note && <p className="mt-2 text-base text-fg-2">{e.note}</p>}
          <p className="mt-3 text-sm text-fg-3">
            {e.site && (
              <>
                来自{' '}
                <Link href={`/resources/${e.site.slug}/`} className="text-fg-2 underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground">
                  {e.site.name}
                </Link>
                {' · '}
              </>
            )}
            核验于 {e.checkedAt}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ToolList({ items }: { items: ToolItem[] }) {
  return (
    <ul className="grid gap-px border border-border bg-border sm:grid-cols-2">
      {items.map((t) => (
        <li key={t.id} className="bg-background">
          <Link href={`/tools/${t.slug}/`} className="group flex h-full flex-col p-6 transition-colors hover:bg-card">
            <span className="text-sm text-fg-3">{t.typeLabel}</span>
            <span className="mt-2 flex items-center justify-between gap-3 font-serif text-2xl font-bold leading-tight transition-colors group-hover:text-primary">
              {t.name}
              <ArrowRight aria-hidden className="size-5 shrink-0 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </span>
            <span className="mt-3 text-sm leading-[1.7] text-fg-2">{t.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function GuideList({ items }: { items: GuideItem[] }) {
  return (
    <ol className="border-t border-border-strong">
      {items.map((x, i) => (
        <li key={x.id}>
          <Link href={`/guides/${x.slug}/`} className="group grid grid-cols-[40px_minmax(0,1fr)_auto] items-baseline gap-4 border-b border-border py-5">
            <span className="font-mono text-sm tabular-nums text-fg-3">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span className="block font-serif text-xl font-bold leading-snug transition-colors group-hover:text-primary">{x.title}</span>
              <span className="mt-1 block text-sm text-fg-3">{x.kindLabel} · {x.steps} 步</span>
            </span>
            <ArrowRight aria-hidden className="size-5 text-fg-3 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <Accordion type="multiple" defaultValue={['0']} className="border-t border-border-strong">
      {items.map((f, i) => (
        <AccordionItem key={f.question} value={String(i)}>
          <AccordionTrigger index={i + 1} className="text-lg">{f.question}</AccordionTrigger>
          <AccordionContent>
            {f.answer && <p className="leading-[1.8]">{f.answer}</p>}
            {f.guide && (
              <Link href={`/guides/${f.guide.slug}/`} className="mt-3 inline-flex items-center gap-2 text-foreground underline decoration-primary underline-offset-4">
                查看教程：{f.guide.title}
              </Link>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

