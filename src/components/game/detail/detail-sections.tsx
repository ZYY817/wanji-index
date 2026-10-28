import { L } from '@/lib/labels-i18n';
import { T } from '@/lib/i18n';
import Link from 'next/link';
import type { ChannelItem, EntryItem, FaqItem, GuideItem, IssueGroup, PathItem, ToolItem } from '@/lib/game-detail';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
              <span className="text-lg font-semibold text-foreground">{L('platform', c.platform)}</span>
              <Tag><T zh={c.typeLabel} en={c.typeLabelEn} /></Tag>
              <Health value={c.health} />
            </div>
            <p className="mt-1.5 text-sm text-fg-2">
              <T zh={c.note} en={c.noteEn} />
              <span className="font-mono text-2xs text-fg-3"> · <T zh="核验于" en="Checked" /> {c.checkedAt}</span>
            </p>
          </div>
          <AcquireButton
            href={c.url}
            health={c.health}
            label={c.type === 'free' ? <T zh="免费获取" en="Get free" /> : <T zh="前往商店" en="Go to store" />}
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
              <span className="text-foreground">{p.kind === '存档' ? <T zh="存档" en="Saves" /> : <T zh="配置" en="Config" />}</span>
              <span className="text-fg-3"> · {p.os}</span>
            </p>
            <CopyButton text={p.path} label="复制路径" labelEn="Copy path" className="min-h-11 px-4 text-sm" />
          </div>
          <code className="mt-3 block select-all break-all font-mono text-base leading-relaxed text-foreground">
            {p.path}
          </code>
          {p.note && <p className="mt-2 text-sm text-fg-2"><T zh={p.note} en={p.note === '来源：PCGamingWiki' ? 'Source: PCGamingWiki' : undefined} /></p>}
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
            badge={<><Tag><T zh={e.typeLabel} en={e.typeLabelEn} /></Tag><Health value={e.health === 'dead' ? undefined : e.health} /></>}
            description={e.note}
            meta={<>{e.site ? <T zh={`来自 ${e.site.name}`} en={`From ${e.site.name}`} /> : <T zh="外部链接" en="External link" />} · <span className="font-mono text-2xs"><T zh="核验于" en="Checked" /> {e.checkedAt}</span></>}
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
          <ListRow href={`/tools/${t.slug}/`} media={<ToolLogo id={t.id} name={t.name} size={44} />} title={t.name} aside={<T zh={t.typeLabel} en={t.typeLabelEn} />} description={t.summary} />
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
          <ListRow href={`/guides/${x.slug}/`} title={fileTokens(x.title)} meta={<T zh={`${x.kindLabel} · ${x.steps} 个步骤`} en={`${x.kindLabelEn} · ${x.steps} steps`} />} />
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
                <T zh="查看教程：" en="Guide: " />{f.guide.title} ↗
              </Link>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

/** 配置要求：项目 / 最低 / 推荐 三列；小屏改为每项上下两行 */
export function SpecsTable({ rows }: { rows: [string, string, string][] }) {
  // 中文表的项目名（操作系统 / 处理器……）在英文界面里换成英文；英文表（Steam 英文页原文）由页面直接传入
  const KEY_EN: Record<string, string> = { 操作系统: 'OS', 处理器: 'Processor', 内存: 'Memory', 显卡: 'Graphics', 图形: 'Graphics', 'DirectX 版本': 'DirectX', 存储空间: 'Storage', 声卡: 'Sound card', 网络: 'Network', 附注事项: 'Notes', 'VR 支持': 'VR support' };
  return (
    <div className="overflow-hidden rounded-sm ring-1 ring-border">
      <div className="hidden grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] gap-6 bg-surface-2/60 px-5 py-3 text-sm text-fg-3 md:grid">
        <span><T zh="项目" en="Item" /></span><span><T zh="最低配置" en="Minimum" /></span><span><T zh="推荐配置" en="Recommended" /></span>
      </div>
      <dl>
        {rows.map(([k, lo, hi]) => (
          <div key={k} className="grid gap-x-6 gap-y-1 border-t border-border px-5 py-3.5 first:border-t-0 md:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)] md:first:border-t">
            <dt className="text-sm text-fg-3"><T zh={k} en={KEY_EN[k]} /></dt>
            <dd className="text-base leading-relaxed text-foreground"><span className="mr-2 text-sm text-fg-3 md:hidden"><T zh="最低" en="Min" /></span>{lo}</dd>
            <dd className="text-base leading-relaxed text-fg-2"><span className="mr-2 text-sm text-fg-3 md:hidden"><T zh="推荐" en="Rec." /></span>{hi}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** 已知问题：按站内问题类型分组 → 每组先给本站排障页入口，再列 PCGamingWiki 的原文条目（英文，外链到锚点） */
export function IssueList({ groups }: { groups: IssueGroup[] }) {
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.problem?.slug ?? '_other'}>
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border-strong pb-3">
            <h3 className="text-lg font-semibold">{g.problem ? <T zh={g.problem.short} en={g.problem.shortEn} /> : <T zh="其他问题" en="Other issues" />}</h3>
            {g.problem && (
              <Link href={`/fixes/${g.problem.slug}/`} className="group inline-flex min-h-11 items-center gap-1.5 text-sm text-fg-2 underline decoration-primary underline-offset-[5px] hover:text-primary">
                <T zh="通用排查方法" en="General fixes" />
                <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
          <ul>
            {g.issues.map((i) => (
              <li key={i.url} className="border-b border-border last:border-b-0">
                <a href={i.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-4 py-3.5 transition-colors hover:bg-card md:-mx-3 md:px-3">
                  <span className={cn('mt-0.5 shrink-0 text-sm', i.fixed === false ? 'text-warn' : 'text-ok')}>{i.fixed === false ? <T zh="未解决" en="Unresolved" /> : <T zh="有解法" en="Fixed" />}</span>
                  <span className="min-w-0 flex-1 text-base leading-[1.6] text-foreground/90 group-hover:text-foreground">{i.title}</span>
                  <ArrowUpRight aria-hidden className="mt-1 size-4 shrink-0 text-fg-3 group-hover:text-foreground" />
                  <span className="sr-only"><T zh="（在新窗口打开 PCGamingWiki）" en="(opens PCGamingWiki in a new window)" /></span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
