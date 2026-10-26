import Link from 'next/link';
import type { ChannelItem, EntryItem, FaqItem, GuideItem, PathItem, ToolItem } from '@/lib/game-detail';
import { zh } from '@/lib/labels.mjs';
import { AcquireButton } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import { PlatformMark } from '@/components/ui/platform-mark';
import { StatusBadge, Tag } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ListRow } from '@/components/ui/list-row';
import { SiteLogo, ToolLogo } from '@/components/ui/site-logo';
import { fileTokens } from '@/components/ui/file-tokens';

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
              <span className="text-lg font-semibold text-foreground">{zh('platform', c.platform)}</span>
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

/** MOD 与汉化：来源站点的图标 → 条目名（已去掉游戏名）+ 类型 → 一句说明 → 来自哪个站 · 核验日期；整行是外链 */
export function EntryList({ items }: { items: EntryItem[] }) {
  return (
    <ul className="-mx-4 md:-mx-5">
      {items.map((e) => (
        <li key={e.id} className="border-b border-border last:border-b-0">
          <ListRow
            href={e.url}
            external
            health={e.health}
            media={e.site ? <SiteLogo id={e.site.id} name={e.site.name} size={44} /> : undefined}
            title={e.name}
            badge={<><Tag>{e.typeLabel}</Tag><Health value={e.health === 'dead' ? undefined : e.health} /></>}
            description={e.note}
            meta={<>{e.site ? `来自 ${e.site.name}` : '外部链接'} · <span className="font-mono text-2xs">核验于 {e.checkedAt}</span></>}
          />
        </li>
      ))}
    </ul>
  );
}

/** 用到的工具：工具图标 → 名称 + 用途 → 一句说明 */
export function ToolList({ items }: { items: ToolItem[] }) {
  return (
    <ul className="-mx-4 md:-mx-5">
      {items.map((t) => (
        <li key={t.id} className="border-b border-border last:border-b-0">
          <ListRow href={`/tools/${t.slug}/`} media={<ToolLogo id={t.id} name={t.name} size={44} />} title={t.name} aside={t.typeLabel} description={t.summary} />
        </li>
      ))}
    </ul>
  );
}

/** 相关教程：标题（已去掉游戏名）→ 类型 · 步骤数 */
export function GuideList({ items }: { items: GuideItem[] }) {
  return (
    <ul className="-mx-4 md:-mx-5">
      {items.map((x) => (
        <li key={x.id} className="border-b border-border last:border-b-0">
          <ListRow href={`/guides/${x.slug}/`} title={fileTokens(x.title)} meta={`${x.kindLabel} · ${x.steps} 个步骤`} />
        </li>
      ))}
    </ul>
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
